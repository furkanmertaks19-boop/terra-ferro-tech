"use client";

import { createContext, useContext } from "react";

const ProductViewContext = createContext({ preview: false });

export function ProductViewProvider({
  preview,
  children,
}: {
  preview: boolean;
  children: React.ReactNode;
}) {
  return <ProductViewContext.Provider value={{ preview }}>{children}</ProductViewContext.Provider>;
}

export function useProductView() {
  return useContext(ProductViewContext);
}
