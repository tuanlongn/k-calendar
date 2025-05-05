import AuthButton from "@/components/AuthButton";

export default async function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello K-Calendar</h1>
        <AuthButton />
      </div>
    </div>
  );
}
