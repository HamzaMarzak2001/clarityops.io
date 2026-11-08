"use client";
import { useEffect } from "react";
import { lift } from "@/lib/opening";

/* Pages without the home page's loader release the page straight away, so scrolling starts at once. */
export function Lift() {
  useEffect(() => { lift(); }, []);
  return null;
}
