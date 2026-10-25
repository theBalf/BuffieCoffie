import { API_BASE_URL } from "./apiBase";

const CATEGORIES_URL = `${API_BASE_URL}/api/menu/categories/`;

export async function getCategories() {
  const response = await fetch(CATEGORIES_URL);

  if (!response.ok) {
    throw new Error("دریافت دسته‌بندی‌ها با خطا مواجه شد");
  }

  const data = await response.json();

  return data.results;
}