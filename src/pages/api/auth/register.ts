import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { setSessionUser } from "../../../lib/auth";
import { json, supabaseAuthFetch } from "./_utils";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");

    if (!name || !email || !password) {
      return json({ error: "Name, email, password are required" }, 400);
    }

    if (password.length < 6) {
      return json({ error: "Password must be at least 6 characters" }, 400);
    }

    const existing = (await supabaseAuthFetch(
      `/rest/v1/app_users?select=id&email=eq.${encodeURIComponent(email)}&limit=1`,
      "GET"
    )) as Array<{ id: string }>;

    if (existing.length) {
      return json({ error: "Email already registered" }, 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = (await supabaseAuthFetch("/rest/v1/app_users", "POST", {
      name,
      email,
      password_hash: passwordHash,
      role: "user",
    })) as Array<{ id: string; name: string; email: string; role: "user" | "admin" }>;

    const user = created[0];
    if (!user) return json({ error: "Failed to create user" }, 500);

    setSessionUser(cookies, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201);
  } catch (error) {
    console.error("POST /api/auth/register failed", error);
    return json({ error: "Registration failed" }, 500);
  }
};
