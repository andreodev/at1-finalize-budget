import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await context.params;
    const userId = params.userId;
    if (!userId) {
      console.warn("[API DEBUG] userId não informado");
      return NextResponse.json({ success: false, error: "userId não informado" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) {
      console.warn("[API DEBUG] Usuário não encontrado para userId:", userId);
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    console.error("[API DEBUG] Erro na rota /api/userinfo/[userId]:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
