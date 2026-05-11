import { TemplatePreviewBody } from "./template-preview-body";

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TemplatePreviewBody id={id} />;
}
