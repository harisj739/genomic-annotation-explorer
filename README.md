# Genomic Annotation Explorer

A web application for parsing, visualizing, and exploring genomic annotation files. Built with React, TypeScript, and Vite.

## Features

- **Multi-format support** — Parse BED, GFF, and GTF genomic annotation files
- **Interactive charts** — Visualize annotation data with Recharts
- **Statistics** — Summary stats for uploaded genomic datasets
- **Saved files** — Parsed files are saved locally and can be reloaded without re-uploading
- **Genny AI assistant** — Ask questions about your loaded file in natural language
- **Educational mode** — In-app explanations of genomic file formats

## Genny — AI Genomic Assistant

After loading a file, click **"Ask Genny"** in the header to open the AI chat panel. Genny is an AI assistant that can answer questions about the currently loaded file — feature counts, chromosome distribution, strand information, and more.

Genny only discusses the loaded file and will politely decline off-topic questions.

### Getting an API Key

Genny is powered by [Claude](https://claude.ai) (Anthropic). Each user needs their own free API key:

1. Go to [console.anthropic.com](https://console.anthropic.com) and sign up for a free account
2. Navigate to **API Keys** and click **Create Key**
3. Copy the key (it starts with `sk-ant-...`)
4. In the app, click **🔑 Add key** inside the Genny panel and paste your key
5. Your key is saved in your browser's local storage — it is never sent anywhere except directly to Anthropic's API

> **Note:** Anthropic offers free credits for new accounts. Each question to Genny costs a fraction of a cent using the Claude Haiku model.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Testing

```bash
npm test
```

## Supported File Formats

| Format | Description |
|--------|-------------|
| BED    | Browser Extensible Data — genomic intervals |
| GFF    | General Feature Format — genome annotations |
| GTF    | Gene Transfer Format — gene/transcript annotations |

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Vitest](https://vitest.dev/)
