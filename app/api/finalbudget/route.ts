import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/finalbudget
export async function POST(request: Request) {
  try {
    const { name, isAdmin, valor, motivo, obs, status, name_contact } = await request.json();
    if (!name || !valor || !motivo || !status) {
      return NextResponse.json({ success: false, error: "Campos obrigatórios não preenchidos." }, { status: 400 });
    }
    const pedido = await prisma.finalBudget.create({
      data: {
        name,
        isAdmin,
        valor,
        motivo,
        obs,
        status,
        name_contact
      },
    });
    return NextResponse.json({ success: true, pedido });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// GET /api/finalbudget
export async function GET() {
  try {
    const pedidos = await prisma.finalBudget.findMany({
      orderBy: { id: "desc" },
      select: { id: true, name: true, isAdmin: true, valor: true, motivo: true, obs: true, status: true, name_contact: true},
    });
    return NextResponse.json({ success: true, pedidos });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
