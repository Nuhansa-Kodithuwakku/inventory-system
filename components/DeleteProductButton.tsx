"use client";

import { deleteProduct } from "@/actions/product-actions";

type DeleteProductButtonProps = {
  id: number;
  name: string;
};

export default function DeleteProductButton({
  id,
  name,
}: DeleteProductButtonProps) {
  return (
    <form action={deleteProduct} className="inline">
      <input type="hidden" name="id" value={id} />

      <button
        type="submit"
        className="text-red-600 hover:underline"
        onClick={(event) => {
          const confirmed = window.confirm(
            `Are you sure you want to delete "${name}"?`,
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}
