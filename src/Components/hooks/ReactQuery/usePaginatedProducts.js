import { useQuery } from "@tanstack/react-query";
import { getPaginatedProducts } from "../../../api/productsAPI";

export function usePaginatedProducts(category, search, page = 1) {
  return useQuery({
    queryKey: ["paginated-products", category, search, page],

    queryFn: ({ signal }) =>
      getPaginatedProducts(category, search, page, { signal }),
  });
}
