import type { APIRoute } from "astro";
import { getSessionUser } from "../../../lib/auth";
import { json } from "./_utils";

export const GET: APIRoute = async ({ cookies }) => {
  const user = getSessionUser(cookies);
  if (!user) return json({ user: null }, 401);
  return json({ user });
};
