import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: { userId: string } }
) {
  try {
  const contextData = await context;
  const userId = contextData.params.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: "userId não informado" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
