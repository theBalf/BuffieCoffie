import { API_BASE_URL } from "./apiBase";

const PRODUCTS_URL = `${API_BASE_URL}/api/menu/products/`;

export async function getProducts(category, search,featured) {
  const params = new URLSearchParams();
  if (search) {
    params.append("search", search);
  }
  if (category) {
    params.append("category", category);
  }
  if (featured) {
    params.append("featured", true);
  }
  const queryString = params.toString();
  const url = queryString ? `${PRODUCTS_URL}?${queryString}` : PRODUCTS_URL;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("دریافت محصولات با خطا مواجه شد");
  }
  const data = await response.json();
  return data.results;
}


export async function getPaginatedProducts(
  category,
  search,
  page = 1
) {
  const params = new URLSearchParams();

  if (category) params.append("category", category);
  if (search) params.append("search", search);

  params.append("page", page);

  const response = await fetch(
    `${PRODUCTS_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("دریافت محصولات با خطا مواجه شد");
  }

  return response.json();
}

export async function getAllProducts(category) {
  const products = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await getPaginatedProducts(category, "", page);
    products.push(...data.results);
    hasNextPage = Boolean(data.next);
    page += 1;
  }

  return products;
}