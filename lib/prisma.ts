import { PrismaClient } from "@prisma/client";

// Deklarasi global untuk mencegah multiple instances di development
declare global {
  var prisma: PrismaClient | undefined;
}

// Buat instance PrismaClient
const prisma = globalThis.prisma || new PrismaClient();

// Di development, simpan di global untuk menghindari hot reload issues
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;