import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function getCurrentUser() {
  const session = (await getServerSession(authOptions)) as Session | null;
  return session?.user;
}

export async function getCurrentUserRole() {
  const session = (await getServerSession(authOptions)) as Session | null;
  return session?.user?.role;
}

export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

export async function hasRole(roleToCheck: string) {
  const session = (await getServerSession(authOptions)) as Session | null;
  return session?.user?.role === roleToCheck;
}