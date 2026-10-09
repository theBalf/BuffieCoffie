import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ShopSearch({
  initialValue = "",
  onSearch,
}) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event) {
    event.preventDefault();

    onSearch(value.trim());
  }

  function handleChange(event) {
    const newValue = event.target.value;
  
    setValue(newValue);
  
    if (newValue === "") {
      onSearch("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      dir="rtl"
      className="mx-auto mb-8 w-full max-w-xl"
    >
      <Field orientation="horizontal" className="gap-2">
       <Input
  type="search"
  placeholder="جستجوی محصول..."
  value={value}
  onChange={handleChange}
  className="text-right"
/>

        <Button type="submit">
          جستجو
        </Button>
      </Field>
    </form>
  );
}