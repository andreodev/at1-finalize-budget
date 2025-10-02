import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/motivos
export async function POST(request: NextRequest) {
  try {
    const { motivo } = await request.json();
    if (!motivo || typeof motivo !== "string") {
      return NextResponse.json({ success: false, error: "Motivo é obrigatório." }, { status: 400 });
    }
   
    const novoMotivo = await prisma.motivo.create({
      data: { motivo },
    });
    return NextResponse.json({ success: true, motivo: novoMotivo });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// GET /api/motivos
export async function GET() {
  try {
    const motivos = await prisma.motivo.findMany({
      select: { id: true, motivo: true },
    });
    return NextResponse.json({ success: true, motivos });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
