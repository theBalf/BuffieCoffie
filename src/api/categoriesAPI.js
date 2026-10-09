const CATEGORIES_URL =
  "http://127.0.0.1:8000/api/menu/categories/";

export async function getCategories() {
  const response = await fetch(CATEGORIES_URL);

  if (!response.ok) {
    throw new Error("دریافت دسته‌بندی‌ها با خطا مواجه شد");
  }

  const data = await response.json();

  return data.results;
}