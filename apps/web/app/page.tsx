import { getAuthToken } from "@/lib/session";
import KaopizApiService from "@/services/kaopiz-api-service";

export default async function Page() {
  let userData = null;

  try {
    const token = await getAuthToken();

    if (token) {
      const kaopizService = new KaopizApiService(token);
      userData = await kaopizService.getCurrentUser();
      const allUsers = await kaopizService.getAllUsers();
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
  }

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello K-Calendar</h1>

        <div className="flex flex-col items-center">
          {userData && (
            <div className="mt-2 p-4 bg-gray-100 rounded-md">
              <p>
                <strong>Tên:</strong> {userData.name}
              </p>
              <p>
                <strong>Email:</strong> {userData.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
