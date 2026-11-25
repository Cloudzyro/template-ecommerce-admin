import { useEffect } from "react";
import { store } from "../data/store";

export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${store.name}`;
  }, [title]);
}
