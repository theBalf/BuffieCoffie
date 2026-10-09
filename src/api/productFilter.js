export function getFeaturedProducts(products = []) {
  return products.filter((product) => product.is_featured === true);
}

export function getAvailableProducts(products = []) {
  return products.filter((product) => product.is_available === true);
}

