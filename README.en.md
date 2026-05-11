# Open Design · AI Dashboard Generator

> Describe what you need in natural language. AI generates a production-ready data visualization dashboard.

## Philosophy

Traditional BI tools produce JSON configurations — unreadable to humans, opaque to AI. Open Design takes a different path:

**The deliverable is code, not configuration.** Generated Markdown documents and JSX components are both human-readable design artifacts and source code that AI can directly understand and modify. Every conversational edit hits the mark precisely, with no guesswork through configuration mappings.

## Core Features

### 📁 Files as Memory

Each project's full context is persisted as plain-text files in the `.dv/` directory:

```
.dv/project-{id}/
├── 数据故事/design-story.md      # Business goals, metrics, decision scenarios
├── 页面结构/pages-story.md       # Layout planning, component specs, data contracts
├── 品牌VI/vi-system.md           # Visual identity specification
├── 品牌VI/vi-tokens.json         # CSS variables, color palette, typography tokens
└── 页面/dashboard.jsx            # Final renderable React component
```

AI reads these files as long-term memory on every conversation turn, understanding the full project context before making incremental changes. Projects are inherently Git-friendly, team-shareable, and tool-portable.

### 🧠 Markdown + JSX as Deliverables

- **Markdown** captures design decisions (data stories, page structures, VI specs) — structured and semantically explicit
- **JSX** captures the final view as a real, runnable React component rather than an abstract configuration
- AI has native comprehension of both formats — no schema mapping or format conversion needed, resulting in significantly higher edit accuracy compared to JSON-based approaches

### ⚡ Real-Time Preview & Tweaking

- **Live VI Token Editing**: Adjust colors, spacing, and typography variables with instant visual feedback
- **Markdown Partial Refinement**: Select a document fragment, describe your intent in natural language, and AI rewrites only the selected portion
- **Widget-Level Editing**: Click any component on the dashboard and modify its data bindings, styles, or layout through conversation
- **Cascading Regeneration**: After modifying upstream documents (data story / page structure), regenerate all downstream artifacts in one click

### 🎨 134+ Design Systems

A built-in library of design system references spanning industries and aesthetics — from brand styles like Apple and BMW to scenario themes like cyberpunk and government blue. Select a style and AI automatically generates matching VI tokens and visual specifications.

### 🔄 Progressive Generation Pipeline

```
Requirements → Data Story → Page Structure → VI System → JSX Dashboard
```

A five-stage pipeline where each step produces an independently reviewable document. Intervene at any stage; downstream artifacts cascade-update automatically.

### 🌐 Decentralized Storage (Optional)

Integrated with 0G Network for optional decentralized file storage, enabling self-sovereign data ownership. Defaults to local filesystem with zero configuration required.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your DeepSeek API Key:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

> Get an API Key: https://platform.deepseek.com/

### 3. Start the Dev Server

```bash
npm run dev
```

Visit http://localhost:3000

## Workflow

1. **Describe Your Needs** — Explain the dashboard you want in natural language (industry, audience, key metrics)
2. **Provide Details** — AI collects critical information through dynamic forms (data dimensions, comparison methods, alert thresholds)
3. **Review the Design** — Data story, page structure, and VI specs are generated step by step; intervene at any point
4. **Preview the Dashboard** — Live-rendered JSX dashboard with interactive fine-tuning
5. **Iterate Continuously** — Chat with existing projects; AI makes incremental updates based on file memory

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TypeScript, Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix), Lucide Icons |
| Charts | ECharts 6 |
| AI | Vercel AI SDK + DeepSeek API |
| Storage | Local Filesystem / 0G Network (optional) |

## Project Structure

```
├── src/
│   ├── app/                  # Next.js App Router routes
│   ├── components/           # UI components (Board Studio is the core)
│   ├── hooks/                # State management (Pipeline, Agent, VI Tweaks)
│   ├── lib/                  # Business logic (pipeline, storage, design systems)
│   └── types/                # TypeScript type definitions
├── board-templates/          # Pre-built dashboard templates
├── design-systems/           # 134+ design system references
├── .dv/                      # Project file storage (long-term memory)
└── .assets/                  # Vector graphic assets
```

## License

Private
