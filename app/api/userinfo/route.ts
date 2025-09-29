import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, channelIds } = body;

    if (!userId || !Array.isArray(channelIds) || channelIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Dados de canais ou usuário ausentes."
      }, { status: 400 });
    }

    let usersCadastrados: any[] = [];
    let erros: any[] = [];

    for (const channelId of channelIds) {
      try {
        const apiUrl = `https://api.inovstar.com/core/v2/api/users/${userId}`;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "access-token": channelId,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        // Pega apenas nome e role
        const { name, isAdmin, id } = data;

        // Validação dos dados recebidos
        if (!name || typeof isAdmin === "undefined" || !id) {
          erros.push({ channelId, error: "Dados do usuário incompletos." });
          continue;
        }

        // Salva no banco
        try {
          const user = await prisma.user.create({
            data: {
              name,
              isAdmin,
              userId: id,
            },
          });
          usersCadastrados.push({ channelId, user });
        } catch (dbError: any) {
          if (
            dbError?.code === "P2002" ||
            String(dbError).includes("Unique constraint failed")
          ) {
            erros.push({ channelId, error: "Conta já cadastrada, seguindo normalmente." });
          } else {
            erros.push({ channelId, error: dbError?.message || String(dbError) });
          }
        }
      } catch (apiError: any) {
        erros.push({ channelId, error: apiError?.message || String(apiError) });
      }
    }

    if (usersCadastrados.length > 0) {
      return NextResponse.json({ success: true, users: usersCadastrados, erros });
    } else {
      // Se todos os erros forem de conta já cadastrada, retorna só um
      const todosJaCadastrados = erros.length > 0 && erros.every(e => e.error === "Conta já cadastrada, seguindo normalmente.");
      if (todosJaCadastrados) {
        return NextResponse.json({
          success: false,
          error: "Conta já cadastrada, seguindo normalmente."
        });
      }
      // Senão, retorna todos os erros
      return NextResponse.json({ success: false, erros });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
