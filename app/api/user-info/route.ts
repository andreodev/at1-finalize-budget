import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, channelIds } = body;

    if (!userId || !Array.isArray(channelIds) || channelIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Dados de canais ou usuário ausentes."
      }, { status: 400 });
    }

    const usersCadastrados: { channelId: string; user: { name: string; isAdmin: boolean; userId: string } }[] = [];
    const erros: { channelId: string; error: string }[] = [];

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
        } catch (dbError: unknown) {
          if (
            typeof dbError === "object" &&
            dbError !== null &&
            "code" in dbError &&
            (dbError as { code?: string }).code === "P2002"
          ) {
            erros.push({ channelId, error: "Conta já cadastrada, seguindo normalmente." });
          } else if (
            typeof dbError === "string" &&
            dbError.includes("Unique constraint failed")
          ) {
            erros.push({ channelId, error: "Conta já cadastrada, seguindo normalmente." });
          } else if (
            typeof dbError === "object" &&
            dbError !== null &&
            "message" in dbError
          ) {
            erros.push({ channelId, error: (dbError as { message?: string }).message || String(dbError) });
          } else {
            erros.push({ channelId, error: String(dbError) });
          }
        }
      } catch (apiError: unknown) {
        if (typeof apiError === "object" && apiError !== null && "message" in apiError) {
          erros.push({ channelId, error: (apiError as { message?: string }).message || String(apiError) });
        } else {
          erros.push({ channelId, error: String(apiError) });
        }
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
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error && typeof error === "object" && "message" in error) ? (error as { message?: string }).message : String(error) },
      { status: 500 }
    );
  }
}
