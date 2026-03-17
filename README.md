# TwinIT — AI-Powered Digital Twin Platform

Convert natural-language prompts into simulated IoT prototypes in seconds.

## Tech Stack

- **Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui
- **Backend:** Lovable Cloud (PostgreSQL · Auth · Edge Functions)
- **AI:** Gemini 2.5 Flash via Edge Functions
- **Key Libraries:** Monaco Editor · Recharts · React Router · TanStack Query · Zod

## Features

- 🗣️ **Prompt-to-Twin** — Describe an IoT system in plain English; get a running digital twin
- 🔧 **Live Code Editor** — View & edit generated SimPy (Python) or JSON config with Monaco
- 📊 **Real-time Dashboard** — Sensor charts, event logs, and component status via Recharts
- 🌐 **Topology Visualizer** — Interactive graph of sensors, actuators, and controllers
- 📦 **Export** — Download twin config as JSON or SimPy code

## Getting Started

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run tests (Vitest) |
| `npm run lint` | Lint with ESLint |

## Deployment

Open [Lovable](https://lovable.dev) → Share → Publish.

## License

Private project.
