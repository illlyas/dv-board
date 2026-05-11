/**
 * 0G Storage 调用封装（服务端单例）。
 *
 * 只提供「上传 Buffer → rootHash」「按 rootHash 下载 → Buffer」两个操作，
 * 其余业务逻辑不在此层。
 */
import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import { mkdtemp, readFile, rm } from "fs/promises";
import os from "os";
import path from "path";

interface ZerogEnv {
  evmRpc: string;
  indexerRpc: string;
  privateKey: string;
}

let cachedIndexer: Indexer | null = null;
let cachedSigner: ethers.Wallet | null = null;
let cachedEnv: ZerogEnv | null = null;

function readEnv(): ZerogEnv {
  const evmRpc = process.env.ZEROG_EVM_RPC?.trim();
  const indexerRpc = process.env.ZEROG_INDEXER_RPC?.trim();
  const privateKey = process.env.ZEROG_PRIVATE_KEY?.trim();
  if (!evmRpc || !indexerRpc || !privateKey) {
    throw new Error(
      "0G storage not configured. Set ZEROG_EVM_RPC, ZEROG_INDEXER_RPC, ZEROG_PRIVATE_KEY in .env.local."
    );
  }
  return { evmRpc, indexerRpc, privateKey };
}

function getIndexer(): { indexer: Indexer; signer: ethers.Wallet; env: ZerogEnv } {
  if (!cachedIndexer || !cachedSigner || !cachedEnv) {
    const env = readEnv();
    const provider = new ethers.JsonRpcProvider(env.evmRpc);
    cachedSigner = new ethers.Wallet(env.privateKey, provider);
    cachedIndexer = new Indexer(env.indexerRpc);
    cachedEnv = env;
  }
  return { indexer: cachedIndexer, signer: cachedSigner, env: cachedEnv };
}

function extractRootHash(
  txInfo:
    | { txHash: string; rootHash: string; txSeq: number }
    | { txHashes: string[]; rootHashes: string[]; txSeqs: number[] }
): string {
  if ("rootHash" in txInfo) return txInfo.rootHash;
  const first = txInfo.rootHashes[0];
  if (!first) throw new Error("0G upload returned no rootHash");
  return first;
}

/**
 * 把一段文本（或二进制）上传到 0G，返回 rootHash。
 * 行为：
 *   - 计算 Merkle 根
 *   - 若该 rootHash 的数据已经存在于网络，SDK upload 会直接成功（通过 finalityRequired=false 的默认路径），
 *     但仍会花 gas 提交 flow。为了避免重复上传相同内容，调用方可以先用 getRootHashForBytes 比对索引。
 */
export async function zgUploadBytes(bytes: Uint8Array): Promise<string> {
  if (bytes.length === 0) {
    // 空文件特殊处理：0G 不接受空数据，写一个单字节占位（上层需要区分）
    throw new Error("refusing to upload empty bytes to 0G");
  }
  const { indexer, signer, env } = getIndexer();
  const file = new MemData(bytes);
  const [tree, mErr] = await file.merkleTree();
  if (mErr || !tree) {
    throw new Error(`0G merkleTree failed: ${mErr?.message ?? "unknown"}`);
  }
  const expectedRoot = tree.rootHash();
  if (!expectedRoot) throw new Error("0G merkleTree returned null root");

  const [info, upErr] = await indexer.upload(file, env.evmRpc, signer);
  if (upErr) {
    throw new Error(`0G upload failed: ${upErr.message}`);
  }
  const root = extractRootHash(info);
  return root || expectedRoot;
}

export async function zgUploadText(text: string): Promise<string> {
  return zgUploadBytes(new TextEncoder().encode(text));
}

/**
 * 按 rootHash 下载文件内容到内存。
 * SDK 的 download 只能写到文件路径，这里用临时目录接住再读回 Buffer。
 */
export async function zgDownloadBytes(rootHash: string): Promise<Buffer> {
  const { indexer } = getIndexer();
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "zg-dl-"));
  const tmpFile = path.join(tmpDir, "out.bin");
  try {
    // 第三个参数 proof=false，加快下载
    const err = await indexer.download(rootHash, tmpFile, false);
    if (err) throw new Error(`0G download failed: ${err.message}`);
    return await readFile(tmpFile);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

export async function zgDownloadText(rootHash: string): Promise<string> {
  const buf = await zgDownloadBytes(rootHash);
  return buf.toString("utf-8");
}

/** 本地纯函数：同样算法算出一段字节的 rootHash，不联网，用来做写前去重 */
export async function zgComputeRootHash(bytes: Uint8Array): Promise<string> {
  if (bytes.length === 0) {
    throw new Error("refusing to compute root for empty bytes");
  }
  const file = new MemData(bytes);
  const [tree, err] = await file.merkleTree();
  if (err || !tree) throw new Error(`0G merkleTree failed: ${err?.message ?? "unknown"}`);
  const root = tree.rootHash();
  if (!root) throw new Error("0G merkleTree returned null root");
  return root;
}
