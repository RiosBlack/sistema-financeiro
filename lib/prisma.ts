import { PrismaClient } from "./generated/prisma";

// Declaração global para evitar múltiplas instâncias do PrismaClient em desenvolvimento
declare global {
  var prisma: PrismaClient | undefined;
}

// Usa o prisma global em desenvolvimento para evitar múltiplas instâncias
const prisma = global.prisma || new PrismaClient();

// Atribui a instância ao global em desenvolvimento
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma;