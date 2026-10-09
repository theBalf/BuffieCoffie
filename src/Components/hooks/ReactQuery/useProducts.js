import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../../api/productsAPI";

export function useProducts(category, search, featured) {
  return useQuery({
    queryKey: ["products", category, search, featured],
    queryFn: () => getProducts(category, search,featured),
  });
}
