import { redis } from "@/lib/redis";
import axios, { AxiosInstance } from "axios";
import LZString from "lz-string";

interface User {
  id: number;
  name: string;
  email: string;
  // Add other fields if needed
}

interface AuthMeResponse {
  user: User;
  // Add other fields if needed
}

interface AllUsersResponse {
  items: User[];
  // Add other fields if needed
}

export class KaopizApiService {
  private client: AxiosInstance;
  private baseURL = "https://api.hrm.kaopiz.com/api";
  private token: string | null = null;

  constructor(token?: string) {
    if (token) {
      this.token = token;
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
  }

  /**
   * Update authentication token
   * @param token New authentication token
   */
  setToken(token: string): void {
    this.token = token;
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  /**
   * Get current user information
   * @returns Information of the logged-in user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.client.get<AuthMeResponse>("/auth/me");
      return response.data.user;
    } catch (error) {
      console.error("Error getting current user information:", error);
      throw error;
    }
  }

  /**
   * Get information of a specific user
   * @param userId ID of the user (default is 375)
   * @returns Information of the user
   */
  async getUserById(userId: number = 375): Promise<User> {
    try {
      const response = await this.client.get<User>(
        `/webhooks-ksystem/users/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting user information with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get list of all users
   * @returns List of all users
   */
  async getAllUsers(): Promise<User[]> {
    const CACHE_KEY = "all-users";
    const CACHE_TTL =
      process.env.NODE_ENV === "development" ? 1 * 60 * 60 : 24 * 60 * 60; // 1h in dev, 24h in prod

    try {
      const cachedData = await redis.get(CACHE_KEY);

      if (cachedData) {
        // Decompress and parse cached data
        const decompressed = LZString.decompress(cachedData as string);
        return JSON.parse(decompressed);
      }

      // If not in cache, fetch from API
      const response =
        await this.client.get<AllUsersResponse>("/master/all-users");

      const users = response.data.items;

      // Compress and cache the response
      const compressed = LZString.compress(JSON.stringify(users));
      await redis.set(CACHE_KEY, compressed, { ex: CACHE_TTL });

      return users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }
}

export default KaopizApiService;
