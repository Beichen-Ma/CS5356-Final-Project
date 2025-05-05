"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function LoginRedirect() {
  useEffect(() => {
    redirect("/auth");
  }, []);

  return null;
}
