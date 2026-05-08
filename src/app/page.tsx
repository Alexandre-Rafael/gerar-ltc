"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { StoryPreview } from "@/components/StoryPreview";
import { DivisaoUpload, Jogo, Divisao } from "@/types";

const DIVISOES_INIT: DivisaoUpload[] = [
  { key: "primeira", label: "1ª DIVISÃO", arquivo: null, processando: false, jogos: [], erro: null },
  { key: "segunda",  label: "2ª DIVISÃO", arquivo: null, processando: false, jogos: [], erro: null },
  { key: "terceira", label: "3ª DIVISÃO", arquivo: null, processando: false, jogos: [], erro: null },
  { key: "seniorA",  label: "SÊNIOR A",   arquivo: null, processando: false, jogos: [], erro: null },
  { key: "seniorB",  label: "SÊNIOR B",   arquivo: null, processando: false, jogos: [], erro: null },
];

export default function Home() {
  const [divisoes, setDivisoes] = useState<DivisaoUpload[]>(DIVISOES_INIT);
  const [rodada, setRodada] = useState("6ª RODADA · JOGOS EM ABERTO");
  const [gerando, setGerando] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const update = useCallback(
    (key: string, patch: Partial<DivisaoUpload>) =>
      setDivisoes((prev) =>
        prev.map((d) => (d.key === key ? { ...d, ...patch } : d))
      ),
    []
  );

  function handleFile(key: string, file: File | null) {
    update(key, { arquivo: file, jogos: [], erro: null });
  }

  async function processar() {
    const comArquivo = divisoes.filter((d) => d.arquivo);
    if (!comArquivo.length) return;

    await Promise.all(
      comArquivo.map(async (div) => {
        update(div.key, { processando: true, erro: null });
        try {
          const fd = new FormData();
          fd.append("image", div.arquivo!);
          fd.append("divisao", div.label);
          const res = await fetch("/api/extract", { method: "POST", body: fd });
          const data = (await res.json()) as { jogos: Jogo[] };
          update(div.key, { jogos: data.jogos, processando: false });
        } catch {
          update(div.key, {
            erro: "Falha na extração. Tente novamente.",
            processando: false,
          });
        }
      })
    );
  }

  async function baixarPNG() {
    const el = captureRef.current;
    if (!el) return;
    setGerando(true);
    try {
      const dataUrl = await toPng(el, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.download = "story-jogos.png";
      a.href = dataUrl;
      a.click();
    } finally {
      setGerando(false);
    }
  }

  const previewDivisoes: Divisao[] = divisoes.map((d) => ({
    key: d.key,
    label: d.label,
    jogos: d.jogos,
  }));

  const algumProcessando = divisoes.some((d) => d.processando);
  const algumJogo = divisoes.some((d) => d.jogos.length > 0);

  return (
    <div className="min-h-screen bg-[#07111d] text-white flex flex-col">
      {/* ── HEADER ── */}
      <header className="flex items-center gap-4 px-8 py-5 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="LTC" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-wide">
            LTC · Gerador de Stories
          </h1>
          <p className="text-xs text-white/40 tracking-widest">
            LAGOA TÊNIS CLUBE
          </p>
        </div>
      </header>

      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* ── LEFT PANEL: UPLOAD ── */}
        <aside className="w-[420px] flex-shrink-0 flex flex-col gap-0 border-r border-white/10 overflow-y-auto">
          <div className="p-6 flex flex-col gap-5">
            {/* Rodada input */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-white/40 mb-2">
                LABEL DA RODADA
              </label>
              <input
                value={rodada}
                onChange={(e) => setRodada(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#08a7cf] transition-colors"
              />
            </div>

            {/* Division upload cards */}
            {divisoes.map((div) => (
              <UploadCard
                key={div.key}
                div={div}
                onFile={(f) => handleFile(div.key, f)}
              />
            ))}

            {/* Process button */}
            <button
              onClick={processar}
              disabled={algumProcessando || divisoes.every((d) => !d.arquivo)}
              className="w-full py-3 rounded-xl font-bold tracking-widest text-sm
                         bg-[#08a7cf] hover:bg-[#06c0ec] disabled:opacity-30
                         disabled:cursor-not-allowed transition-all"
            >
              {algumProcessando ? "PROCESSANDO..." : "EXTRAIR JOGOS"}
            </button>

            {/* Download button */}
            {algumJogo && (
              <button
                onClick={baixarPNG}
                disabled={gerando}
                className="w-full py-3 rounded-xl font-bold tracking-widest text-sm
                           bg-[#c7f465] hover:bg-[#d5f97a] text-[#07111d]
                           disabled:opacity-50 transition-all"
              >
                {gerando ? "GERANDO PNG..." : "⬇ BAIXAR STORY PNG"}
              </button>
            )}
          </div>
        </aside>

        {/* ── RIGHT PANEL: PREVIEW ── */}
        <main className="flex-1 flex flex-col items-center justify-start overflow-auto bg-[#0d1b2a] p-8">
          <p className="text-xs text-white/30 tracking-widest mb-6">
            PRÉ-VISUALIZAÇÃO · 1080 × 1920 px
          </p>
          {/* Scaled preview wrapper */}
          <div
            style={{
              transform: "scale(0.35)",
              transformOrigin: "top center",
              marginBottom: -1920 * 0.65,
            }}
          >
            <div ref={captureRef}>
              <StoryPreview divisoes={previewDivisoes} rodada={rodada} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Upload Card component ─────────────────────────────────── */

function UploadCard({
  div,
  onFile,
}: {
  div: DivisaoUpload;
  onFile: (f: File | null) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onFile(file);
  }

  const hasJogos = div.jogos.length > 0;
  const borderColor = hasJogos
    ? "#c7f465"
    : dragging
    ? "#08a7cf"
    : "rgba(255,255,255,0.08)";

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ border: `1.5px solid ${borderColor}` }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#08a7cf]">
        <span className="font-bold text-sm tracking-widest">{div.label}</span>
        {hasJogos && (
          <span className="text-xs bg-[#c7f465] text-[#07111d] font-bold px-2 py-0.5 rounded-full">
            {div.jogos.length} jogo{div.jogos.length > 1 ? "s" : ""}
          </span>
        )}
        {div.processando && (
          <span className="text-xs text-white/60 animate-pulse">
            Extraindo...
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />

        {div.arquivo ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(div.arquivo)}
              alt="preview"
              className="w-12 h-12 object-cover rounded-md border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-white/80">
                {div.arquivo.name}
              </p>
              {div.erro && (
                <p className="text-xs text-red-400 mt-0.5">{div.erro}</p>
              )}
              {hasJogos && (
                <p className="text-xs text-[#c7f465] mt-0.5">
                  {div.jogos.map((j) => `${j.casa} × ${j.fora}`).join(" | ")}
                </p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onFile(null); }}
              className="text-white/30 hover:text-white/70 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-2 text-white/25">
            <span className="text-2xl">↑</span>
            <span className="text-xs tracking-wide">
              clique ou arraste o print
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
