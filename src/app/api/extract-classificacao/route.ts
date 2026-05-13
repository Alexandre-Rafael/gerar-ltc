import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { ClassificacaoItem } from "@/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const imageFile = formData.get("image") as File | null;
  const divisao = formData.get("divisao") as string;
  const campeonato = (formData.get("campeonato") as string) || "Copa Fácil";

  if (!imageFile) return NextResponse.json({ classificacao: [] }, { status: 400 });

  const bytes = await imageFile.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mediaType = (
    imageFile.type.startsWith("image/") ? imageFile.type : "image/png"
  ) as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
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
            text: `Analise esta tabela de classificação do ${campeonato} (${divisao}).
Extraia todos os times com: posição, nome, pontos, jogos, vitórias, empates, derrotas, saldo de gols.
Retorne SOMENTE JSON válido, sem texto extra:

{
  "classificacao": [
    { "pos": 1, "time": "Nome do Time", "pts": 10, "j": 4, "v": 3, "e": 1, "d": 0, "sg": 5 }
  ]
}`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match?.[0] ?? '{"classificacao":[]}') as {
      classificacao: ClassificacaoItem[];
    };
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ classificacao: [] });
  }
}
