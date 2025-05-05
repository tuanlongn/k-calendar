import { Suspense } from "react";
import AuthCallback from "@/components/AuthCallBack";

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
}
