import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { setSessionUser } from "../../../lib/auth";
import { json, supabaseAuthFetch } from "./_utils";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const payload = (await request.json()) as { email?: string; password?: string };
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");

    if (!email || !password) {
      return json({ error: "Email and password are required" }, 400);
    }

    const users = (await supabaseAuthFetch(
      `/rest/v1/app_users?select=id,name,email,role,password_hash&email=eq.${encodeURIComponent(email)}&limit=1`,
      "GET"
    )) as Array<{
      id: string;
      name: string;
      email: string;
      role: "user" | "admin";
      password_hash: string;
    }>;

    const user = users[0];
    if (!user) return json({ error: "Invalid credentials" }, 401);

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return json({ error: "Invalid credentials" }, 401);

    setSessionUser(cookies, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("POST /api/auth/login failed", error);
    return json({ error: "Login failed" }, 500);
  }
};
