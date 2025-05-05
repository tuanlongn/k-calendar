import { NextRequest, NextResponse } from "next/server";
import { setAuthToken, clearAuthToken } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json();
    
    if (!token || !userId) {
      return NextResponse.json(
        { error: "Thiếu thông tin token hoặc userId" },
        { status: 400 }
      );
    }
    
    await setAuthToken(token, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi lưu session:", error);
    return NextResponse.json(
      { error: "Lỗi server khi xử lý session" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Thiếu thông tin userId" },
        { status: 400 }
      );
    }
    
    await clearAuthToken(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi xóa session:", error);
    return NextResponse.json(
      { error: "Lỗi server khi xử lý session" },
      { status: 500 }
    );
  }
}