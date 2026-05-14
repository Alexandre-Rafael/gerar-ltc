import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Jogo } from "@/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const imageFile = formData.get("image") as File | null;
  const divisao = formData.get("divisao") as string;
  const campeonato = (formData.get("campeonato") as string) || "Copa Fácil";

  if (!imageFile) {
    return NextResponse.json({ jogos: [] }, { status: 400 });
  }

  const bytes = await imageFile.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mediaType = (
    imageFile.type.startsWith("image/") ? imageFile.type : "image/png"
  ) as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: `Analise esta tabela de jogos do ${campeonato} (divisão: ${divisao}).

Extraia APENAS os jogos com status em aberto (não encerrados, sem placar).
Retorne SOMENTE um JSON válido, sem texto extra:

{
  "jogos": [
    {
      "casa": "Nome do time da esquerda",
      "fora": "Nome do time da direita",
      "campo": "Nome do campo",
      "data": "Dia DD/MM",
      "hora": "HH:MM"
    }
  ]
}

Se não houver jogos em aberto, retorne: {"jogos": []}`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match?.[0] ?? '{"jogos":[]}') as {
      jogos: Jogo[];
    };

    parsed.jogos.sort((a, b) => {
      const key = (data: string, hora: string) => {
        const d = data.match(/(\d{1,2})\/(\d{1,2})/);
        const h = hora.match(/(\d{1,2}):(\d{2})/);
        const day   = d ? parseInt(d[1]) : 0;
        const month = d ? parseInt(d[2]) : 0;
        const hour  = h ? parseInt(h[1]) : 0;
        const min   = h ? parseInt(h[2]) : 0;
        return month * 1000000 + day * 10000 + hour * 100 + min;
      };
      return key(a.data, a.hora) - key(b.data, b.hora);
    });

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ jogos: [] });
  }
}
