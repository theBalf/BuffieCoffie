import { API_BASE_URL } from "./apiBase";

const API_URL = `${API_BASE_URL}/api/accounts`;
const ORDERS_URL = `${API_BASE_URL}/api/orders/`;
const TABLES_URL = `${ORDERS_URL}tables/`;
const MENU_URL = `${API_BASE_URL}/api/menu`;
const GUEST_ORDERS_STORAGE_KEY = "buffiecoffee-guest-orders";
let csrfTokenFromApi = "";

function getCookie(name) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const body = await response.text();
  let data;
  try {
    data = body ? JSON.parse(body) : {};
  } catch {
    throw new Error(
      response.ok
        ? "پاسخ سرور قابل خواندن نیست."
        : response.status === 403
          ? "نشست امنیتی معتبر نیست یا منقضی شده است. صفحه را تازه‌سازی کنید و دوباره تلاش کنید."
        : `درخواست انجام نشد (کد ${response.status}).`
    );
  }
  if (!response.ok) {
    const message =
      data.detail ||
      Object.values(data)
        .flat()
        .filter((value) => typeof value === "string")
        .join(" ");
    throw new Error(message || "درخواست انجام نشد. دوباره تلاش کنید.");
  }
  return data;
}

async function request(url, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.method && !["GET", "HEAD", "OPTIONS"].includes(options.method)) {
    if (!getCookie("csrftoken") && !csrfTokenFromApi) {
      await prepareAccountSession();
    }
    const csrfToken = getCookie("csrftoken") || csrfTokenFromApi;
    if (!csrfToken) {
      throw new Error("گرفتن توکن امنیتی از سرور ممکن نشد.");
    }
    headers.set("X-CSRFToken", csrfToken);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
  return parseResponse(response);
}

export async function prepareAccountSession() {
  const response = await fetch(`${API_URL}/csrf/`, {
    credentials: "include",
  });
  const data = await parseResponse(response);
  csrfTokenFromApi = data.csrfToken;
}

export function getCsrfToken() {
  return getCookie("csrftoken") || csrfTokenFromApi;
}

export async function getCurrentUser() {
  const result = await request(`${API_URL}/me/`);
  return result.user;
}

export async function loginAccount(identifier, password, captchaToken) {
  await prepareAccountSession();
  const result = await request(`${API_URL}/login/`, {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
      captcha_token: captchaToken,
    }),
  });
  return result.user;
}

export async function registerAccount(values) {
  await prepareAccountSession();
  const result = await request(`${API_URL}/register/`, {
    method: "POST",
    body: JSON.stringify(values),
  });
  return result.user;
}

export async function logoutAccount() {
  await prepareAccountSession();
  await request(`${API_URL}/logout/`, { method: "POST" });
}

export async function updateAccountProfile(values) {
  await prepareAccountSession();
  const result = await request(`${API_URL}/profile/`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
  return result.user;
}

export function getMyOrders() {
  return claimGuestOrders().then(() => request(`${ORDERS_URL}?mine=true`));
}

function readGuestOrders() {
  const savedOrders = window.localStorage.getItem(GUEST_ORDERS_STORAGE_KEY);
  if (!savedOrders) return [];

  const orders = JSON.parse(savedOrders);
  if (!Array.isArray(orders)) {
    throw new Error("اطلاعات سفارش مهمان در مرورگر معتبر نیست.");
  }
  return orders;
}

export function rememberGuestOrder(order) {
  if (!order?.id || !order.guest_claim_token) {
    throw new Error("اطلاعات پیگیری سفارش مهمان از سرور دریافت نشد.");
  }

  const guestOrders = readGuestOrders().filter(
    (savedOrder) => savedOrder.id !== order.id
  );
  guestOrders.push({
    id: order.id,
    guest_claim_token: order.guest_claim_token,
  });
  window.localStorage.setItem(
    GUEST_ORDERS_STORAGE_KEY,
    JSON.stringify(guestOrders)
  );
}

async function claimGuestOrders() {
  const guestOrders = readGuestOrders();
  if (guestOrders.length === 0) return;

  const claimedIds = new Set();
  for (let index = 0; index < guestOrders.length; index += 50) {
    const result = await request(`${ORDERS_URL}claim-guests/`, {
      method: "POST",
      body: JSON.stringify({ orders: guestOrders.slice(index, index + 50) }),
    });
    result.claimed_ids.forEach((id) => claimedIds.add(id));
  }
  const remainingOrders = guestOrders.filter(
    (order) => !claimedIds.has(order.id)
  );

  if (remainingOrders.length === 0) {
    window.localStorage.removeItem(GUEST_ORDERS_STORAGE_KEY);
  } else {
    window.localStorage.setItem(
      GUEST_ORDERS_STORAGE_KEY,
      JSON.stringify(remainingOrders)
    );
  }
}

export function getCafeTables() {
  return request(TABLES_URL);
}

export function getAdminCafeTables() {
  return request(`${TABLES_URL}?manage=true`);
}

export function createCafeTable(tableNumber) {
  return request(TABLES_URL, {
    method: "POST",
    body: JSON.stringify({ table_number: tableNumber }),
  });
}

export function updateCafeTable(tableId, isOccupied) {
  return request(`${TABLES_URL}${tableId}/`, {
    method: "PATCH",
    body: JSON.stringify({ is_occupied: isOccupied }),
  });
}

export function getCafeTableByQrToken(token) {
  return request(`${TABLES_URL}qr/${encodeURIComponent(token)}/`);
}

export function getAdminProducts() {
  return request(`${MENU_URL}/products/`);
}

export function getAdminCategories() {
  return request(`${MENU_URL}/categories/`);
}

export function getAdminOrders() {
  return request(ORDERS_URL);
}

export function getAdminAttentionOrders() {
  return request(`${ORDERS_URL}attention/`);
}

export function rateProduct(productSlug, rating) {
  return request(`${MENU_URL}/products/${encodeURIComponent(productSlug)}/rate/`, {
    method: "POST",
    body: JSON.stringify({ rating }),
  });
}

export function updateAdminOrder(orderId, values) {
  return request(`${ORDERS_URL}${orderId}/`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}
