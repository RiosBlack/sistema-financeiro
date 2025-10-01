import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }
  
  return session.user;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Não autorizado. Faça login para continuar." },
    { status: 401 }
  );
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

