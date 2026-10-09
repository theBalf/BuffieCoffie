import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../../api/categoriesAPI";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}