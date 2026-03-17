import { TwinConfig, SimulationHistory } from "@/lib/simulation";

// Point this to your self-hosted Express server
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface TwinRecord {
  id: string;
  name: string;
  config: TwinConfig;
  created_at: string;
  updated_at: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "API request failed");
  }
  return res.json();
}

export const twinApi = {
  list: () => request<TwinRecord[]>("/api/twins"),

  get: (id: string) => request<TwinRecord>(`/api/twins/${id}`),

  create: (name: string, config: TwinConfig) =>
    request<TwinRecord>("/api/twins", {
      method: "POST",
      body: JSON.stringify({ name, config }),
    }),

  update: (id: string, name: string, config: TwinConfig) =>
    request<TwinRecord>(`/api/twins/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, config }),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/api/twins/${id}`, { method: "DELETE" }),

  saveHistory: (twinId: string, history: SimulationHistory) =>
    request<{ id: string }>(`/api/twins/${twinId}/history`, {
      method: "POST",
      body: JSON.stringify(history),
    }),
};
