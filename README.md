# Genomic Annotation Explorer

A web application for parsing, visualizing, and exploring genomic annotation files. Built with React, TypeScript, and Vite.

## Features

- **Multi-format support** — Parse BED, GFF, and GTF genomic annotation files
- **Interactive charts** — Visualize annotation data with Recharts
- **Statistics** — Summary stats for uploaded genomic datasets
- **Educational mode** — In-app explanations of genomic file formats
- **State management** — Lightweight global state via Zustand

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
- [Vitest](https://vitest.dev/)
