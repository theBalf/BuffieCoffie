const ORDERS_URL = "http://127.0.0.1:8000/api/orders/";

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
  const response = await fetch(ORDERS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
}
