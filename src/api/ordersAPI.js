import { getCsrfToken, prepareAccountSession } from "./accountAPI";
import { API_BASE_URL } from "./apiBase";

const ORDERS_URL = `${API_BASE_URL}/api/orders/`;

function getErrorMessage(data) {
  if (typeof data === "string") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(getErrorMessage).join(" ");
  }
  if (data && typeof data === "object") {
    return Object.values(data).map(getErrorMessage).filter(Boolean).join(" ");
  }
  return "ثبت سفارش انجام نشد. دوباره تلاش کنید.";
}

export async function createOrder(order) {
  await prepareAccountSession();
  const csrfToken = getCsrfToken();
  const response = await fetch(ORDERS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(order),
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
}
