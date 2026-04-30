// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || "";

export const fetchTramites = async () => {
  const res = await fetch(`${API_BASE}/api/tramites`);
  return res.json();
};