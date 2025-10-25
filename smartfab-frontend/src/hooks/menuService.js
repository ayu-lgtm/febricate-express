// src/services/menuService.js
const API_BASE = import.meta.env.VITE_API_BASE;
export async function fetchUserMenus() {
  const token = sessionStorage.getItem("authToken");
  if (!token) return [];

  const res = await fetch(`${API_BASE}/menu/menus`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch menus");
  const result = await res.json();
  return result.data || [];
}