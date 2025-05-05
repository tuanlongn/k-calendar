import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redis } from "./redis";

// Define the data type for the session
export interface SessionData {
  token?: string;
  isLoggedIn: boolean;
}

// Configuration for iron-session
const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: "k-calendar-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

// Function to get session from request
export async function getSession(
  req: Request,
  res: Response
): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Initialize session if it doesn't exist
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }

  return session;
}

// Function to get session from cookies (used in server components)
export async function getServerSession(): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  // Initialize session if it doesn't exist
  if (session.isLoggedIn === undefined) {
    // Corrected the condition here
    session.isLoggedIn = false;
  }

  return session;
}

// Save token to session and Redis
export async function setAuthToken(
  token: string,
  userId: string
): Promise<void> {
  const session = await getServerSession();

  // Save token to session
  session.token = token;
  session.isLoggedIn = true;
  await session.save();

  // Save token to Redis with userId as key and TTL of 1 week
  await redis.set(`auth:${userId}`, token, { ex: 60 * 60 * 24 * 7 });
}

// Clear token from session and Redis
export async function clearAuthToken(userId: string): Promise<void> {
  const session = await getServerSession();

  // Clear token from session
  session.token = undefined;
  session.isLoggedIn = false;
  await session.save();

  // Clear token from Redis
  await redis.del(`auth:${userId}`);
}

// Check if the user is logged in
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return session.isLoggedIn === true && !!session.token;
}

// Get token from session
export async function getAuthToken(): Promise<string | undefined> {
  const session = await getServerSession();
  return session.token;
}

// Get token from Redis using userId
export async function getAuthTokenFromRedis(
  userId: string
): Promise<string | null> {
  return await redis.get(`auth:${userId}`);
}
