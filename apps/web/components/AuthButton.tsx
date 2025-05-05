"use client";

import { Button } from "@workspace/ui/components/button";

export default function AuthButton() {
  async function getRedirectUrl() {
    const response = await fetch(
      "https://api.hrm.kaopiz.com/api/auth/make-url?path=/",
      { cache: "no-store" }
    );
    const data = await response.json();
    if (data.url_redirect) {
      const url = new URL(data.url_redirect);
      const searchParams = new URLSearchParams(url.search);
      searchParams.set(
        "redirect_oauth",
        `${process.env.NEXT_PUBLIC_URL}/auth/callback?`
      );
      url.search = searchParams.toString();
      window.location.href = url.toString();
    }
  }

  return <Button onClick={getRedirectUrl}>Sign In</Button>;
}
