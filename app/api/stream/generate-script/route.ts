import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LiquidsoapService } from "@/lib/services/liquidsoap";

// GET /api/stream/generate-script - Generar script de Liquidsoap
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true },
    });

    if (!user?.client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const clientId = user.client.id;

    // Generar script
    try {
      const script = await LiquidsoapService.generateScript(clientId);

      return new NextResponse(script, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="liquidsoap_${clientId}.liq"`,
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Error al generar script" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error generating script:", error);
    return NextResponse.json(
      { error: "Error al generar script" },
      { status: 500 }
    );
  }
}
