# TwinIT — AI-Powered Digital Twin Platform

Convert natural-language prompts into simulated IoT prototypes in seconds.

Your tech stack forms a robust, production-ready full-stack architecture optimized for AI-driven projects like digital twins and IoT systems, emphasizing developer experience, scalability, and seamless integration.

## Frontend Deep Dive

React 18.3 with TypeScript provides automatic batching, transitions for smooth UI updates, and strict typing to catch errors early—ideal for complex stateful UIs in IoT dashboards. Vite leverages ES modules for instant hot reloads (under 50ms) and optimized builds via Rollup, outperforming CRA significantly. Tailwind CSS + shadcn/ui combines atomic classes for custom designs with copy-paste Radix-based components (e.g., modals, dropdowns) that are unstyled by default, ensuring full design control without vendor lock-in.

React Router DOM v6+ supports file-based routing, loaders/actions for data mutations, and nested layouts—perfect for multi-page apps like project editors or analytics views. TanStack Query handles optimistic updates, infinite queries, and devtools for caching, reducing boilerplate compared to Redux.

## UI & Visualization Tools

Monaco Editor (VS Code's engine) offers full language services like autocompletion and debugging via `@monaco-editor/react`, great for embedding code editors in digital twin configurators. Recharts delivers declarative, responsive charts (e.g., AreaChart with animations) that resize dynamically, suitable for real-time sensor data. Lucide React includes 1000+ stroke-based icons as tree-shakable components, customizable via strokeWidth or color props.

## Backend & Data Layer

Lovable Cloud simplifies backend management with auto-scaling Postgres databases, real-time subscriptions via WebSockets, and built-in storage—eliminating DevOps overhead for your embedded/IoT prototypes. Authentication uses JWTs with providers (Google, email) and RLS policies to secure rows (e.g., user-owned IoT data). PostgreSQL excels here with JSONB for flexible schemas, PostGIS for location-based twins, and extensions like pgvector for AI embeddings.

## Serverless & AI Pipeline

Backend Edge Functions run TypeScript/Deno code globally at the edge (low ms latency), integrating Gemini 2.5 Flash for multimodal tasks—e.g., processing IoT images/text via API calls without exposing keys. This setup proxies requests securely, handles rate limits, and scales to zero.

## Forms, Validation & Testing

Zod schemas pair with React Hook Form for type-safe, zero-dependency forms featuring watch/subscribe and uncontrolled inputs for performance. Vitest + React Testing Library enables Vite-speed unit/integration tests with mocks for TanStack Query and user-event simulations.

## Integration Flow

```
User → React App (Vite/TS) → TanStack Query → Lovable Cloud (Auth/DB)
                          ↓
                   Edge Functions (Deno) → Gemini AI → Postgres Writeback
                          ↓
                   Recharts/Monaco for Viz/Edit → Real-time Updates
```

This stack minimizes context-switching: TypeScript end-to-end, one unified backend, and AI-ready for your TCS/Valeo-style internships. For digital twins, use Recharts for simulations, Monaco for config scripts, and Edge Functions for predictive ML.

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
