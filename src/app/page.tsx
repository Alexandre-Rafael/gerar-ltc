"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { StoryPreview } from "@/components/StoryPreview";
import { ClassificacaoStory } from "@/components/ClassificacaoStory";
import {
  DivisaoUpload,
  DivisaoClassificacaoUpload,
  Divisao,
  Jogo,
  ClassificacaoItem,
} from "@/types";

/* ── constants ─────────────────────────────────────────────── */

type DivisaoBase = { key: string; label: string };

const DIVISOES_COPA_FACIL: DivisaoBase[] = [
  { key: "primeira", label: "1ª DIVISÃO" },
  { key: "segunda",  label: "2ª DIVISÃO" },
  { key: "terceira", label: "3ª DIVISÃO" },
  { key: "seniorA",  label: "SÊNIOR A"   },
  { key: "seniorB",  label: "SÊNIOR B"   },
];

const DIVISOES_COPA_SICREDI: DivisaoBase[] = [
  { key: "mascPreMirim", label: "MASCULINO PRÉ-MIRIM" },
  { key: "mascMirim",    label: "MASCULINO MIRIM"     },
  { key: "mascInfantil", label: "MASCULINO INFANTIL"  },
  { key: "femInfantil",  label: "FEMININO INFANTIL"   },
  { key: "femAdulto",    label: "FEMININO ADULTO"     },
  { key: "masterOuro",   label: "MASTER OURO"         },
];

const DIVISOES_POR_CAMPEONATO: Record<Campeonato, DivisaoBase[]> = {
  "Copa Fácil":   DIVISOES_COPA_FACIL,
  "Copa Sicredi": DIVISOES_COPA_SICREDI,
};

const mkJogos  = (divs: DivisaoBase[]): DivisaoUpload[]              => divs.map(d => ({ ...d, arquivo: null, processando: false, jogos:   [], erro: null }));
const mkClass  = (divs: DivisaoBase[]): DivisaoClassificacaoUpload[] => divs.map(d => ({ ...d, arquivo: null, processando: false, tabela: [], erro: null }));

/* ── split logic ───────────────────────────────────────────── */
const CARD_HEAD  = 44;
const GAME_H     = 90;   // average game row height
const CARD_GAP   = 16;
const MAX_HEIGHT = 1180; // conservative — always leaves breathing room

function cardH(d: Divisao) { return CARD_HEAD + d.jogos.length * GAME_H; }

function splitPages(divs: Divisao[]): Divisao[][] {
  const active = divs.filter(d => d.jogos.length > 0);
  const pages: Divisao[][] = [];
  let page: Divisao[] = [];
  let used = 0;

  for (const d of active) {
    const h = cardH(d);
    const needed = page.length === 0 ? h : used + CARD_GAP + h;
    if (needed > MAX_HEIGHT && page.length > 0) {
      pages.push(page);
      page = [d];
      used = h;
    } else {
      page.push(d);
      used = needed;
    }
  }
  if (page.length > 0) pages.push(page);
  return pages.length ? pages : [[]];
}

/* ── main page ─────────────────────────────────────────────── */

const CAMPEONATOS = ["Copa Fácil", "Copa Sicredi"] as const;
type Campeonato = (typeof CAMPEONATOS)[number];

type Tab = "jogos" | "classificacao";

export default function Home() {
  const [tab, setTab]               = useState<Tab>("jogos");
  const [campeonato, setCampeonato] = useState<Campeonato>("Copa Fácil");
  const [divisoes, setDivisoes]     = useState<DivisaoUpload[]>(mkJogos(DIVISOES_COPA_FACIL));
  const [classDiv, setClassDiv]     = useState<DivisaoClassificacaoUpload[]>(mkClass(DIVISOES_COPA_FACIL));

  function selecionarCampeonato(c: Campeonato) {
    setCampeonato(c);
    const divs = DIVISOES_POR_CAMPEONATO[c];
    setDivisoes(mkJogos(divs));
    setClassDiv(mkClass(divs));
    setPreviewPage(0);
  }
  const [rodada, setRodada]         = useState("6ª RODADA · JOGOS EM ABERTO");
  const [previewPage, setPreviewPage] = useState(0);
  const [gerando, setGerando]       = useState(false);

  // refs for full-size off-screen capture
  const captureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const classRefs   = useRef<(HTMLDivElement | null)[]>([]);

  /* ── updaters ── */
  const updateJogo = useCallback((key: string, patch: Partial<DivisaoUpload>) =>
    setDivisoes(p => p.map(d => d.key === key ? { ...d, ...patch } : d)), []);

  const updateClass = useCallback((key: string, patch: Partial<DivisaoClassificacaoUpload>) =>
    setClassDiv(p => p.map(d => d.key === key ? { ...d, ...patch } : d)), []);

  /* ── extract jogos ── */
  async function processar() {
    const targets = divisoes.filter(d => d.arquivo);
    if (!targets.length) return;
    await Promise.all(targets.map(async div => {
      updateJogo(div.key, { processando: true, erro: null });
      try {
        const fd = new FormData();
        fd.append("image", div.arquivo!);
        fd.append("divisao", div.label);
        fd.append("campeonato", campeonato);
        const res  = await fetch("/api/extract", { method: "POST", body: fd });
        const data = await res.json() as { jogos: Jogo[] };
        updateJogo(div.key, { jogos: data.jogos, processando: false });
      } catch {
        updateJogo(div.key, { erro: "Falha. Tente novamente.", processando: false });
      }
    }));
    setPreviewPage(0);
  }

  /* ── extract classificação ── */
  async function processarClass() {
    const targets = classDiv.filter(d => d.arquivo);
    if (!targets.length) return;
    await Promise.all(targets.map(async div => {
      updateClass(div.key, { processando: true, erro: null });
      try {
        const fd = new FormData();
        fd.append("image", div.arquivo!);
        fd.append("divisao", div.label);
        fd.append("campeonato", campeonato);
        const res  = await fetch("/api/extract-classificacao", { method: "POST", body: fd });
        const data = await res.json() as { classificacao: ClassificacaoItem[] };
        updateClass(div.key, { tabela: data.classificacao, processando: false });
      } catch {
        updateClass(div.key, { erro: "Falha. Tente novamente.", processando: false });
      }
    }));
  }

  /* ── download helpers ── */
  async function capturePng(el: HTMLDivElement, filename: string) {
    const url = await toPng(el, { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true });
    const a = document.createElement("a");
    a.download = filename;
    a.href = url;
    a.click();
    await new Promise(r => setTimeout(r, 400));
  }

  async function baixarJogos() {
    setGerando(true);
    try {
      for (let i = 0; i < storyPages.length; i++) {
        const el = captureRefs.current[i];
        if (el) await capturePng(el, `story-jogos-${i + 1}.png`);
      }
    } finally { setGerando(false); }
  }

  async function baixarClassificacoes() {
    setGerando(true);
    try {
      for (let i = 0; i < classDiv.length; i++) {
        if (!classDiv[i].tabela.length) continue;
        const el = classRefs.current[i];
        if (el) await capturePng(el, `classificacao-${classDiv[i].key}.png`);
      }
    } finally { setGerando(false); }
  }

  /* ── derived state ── */
  const previewDivisoes: Divisao[] = divisoes.map(d => ({ key: d.key, label: d.label, jogos: d.jogos }));
  const storyPages = splitPages(previewDivisoes);
  const curPage    = Math.min(previewPage, storyPages.length - 1);

  const algumJogoProcessando = divisoes.some(d => d.processando);
  const algumClassProcessando = classDiv.some(d => d.processando);
  const temJogos  = divisoes.some(d => d.jogos.length > 0);
  const temClass  = classDiv.some(d => d.tabela.length > 0);

  /* ── class preview index ── */
  const [classPreview, setClassPreview] = useState(0);
  const activeClass = classDiv.filter(d => d.tabela.length > 0);

  return (
    <div className="min-h-screen bg-[#07111d] text-white flex flex-col" style={{ fontFamily: "Arial, sans-serif" }}>

      {/* HEADER */}
      <header className="flex items-center gap-4 px-8 py-4 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="LTC" className="w-9 h-9 object-contain" />
        <div>
          <h1 className="font-bold text-base leading-tight tracking-wide">LTC · Gerador de Stories</h1>
          <p className="text-xs text-white/30 tracking-widest">LAGOA TÊNIS CLUBE</p>
        </div>
        {/* Championship selector */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {CAMPEONATOS.map(c => (
            <button
              key={c}
              onClick={() => selecionarCampeonato(c)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all ${
                campeonato === c ? "bg-[#c7f465] text-[#07111d]" : "text-white/40 hover:text-white/70"
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="ml-auto flex gap-1 bg-white/5 rounded-xl p-1">
          {(["jogos", "classificacao"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-xs font-bold tracking-widest transition-all ${
                tab === t ? "bg-[#08a7cf] text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {t === "jogos" ? "JOGOS" : "CLASSIFICAÇÃO"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <aside className="w-[400px] flex-shrink-0 border-r border-white/10 flex flex-col overflow-y-auto">
          <div className="p-5 flex flex-col gap-4">

            {tab === "jogos" ? (
              <>
                {campeonato !== "Copa Sicredi" && (
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-white/40 mb-1.5">LABEL DA RODADA</label>
                    <input
                      value={rodada}
                      onChange={e => setRodada(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#08a7cf] transition-colors"
                    />
                  </div>
                )}
                {divisoes.map(div => (
                  <UploadCard key={div.key} label={div.label} arquivo={div.arquivo} processando={div.processando}
                    jogos={div.jogos} erro={div.erro}
                    onFile={f => updateJogo(div.key, { arquivo: f, jogos: [], erro: null })} />
                ))}
                <button onClick={processar} disabled={algumJogoProcessando || divisoes.every(d => !d.arquivo)}
                  className="w-full py-3 rounded-xl font-bold tracking-widest text-sm bg-[#08a7cf] hover:bg-[#06c0ec] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  {algumJogoProcessando ? "PROCESSANDO..." : "EXTRAIR JOGOS"}
                </button>
                {temJogos && (
                  <button onClick={baixarJogos} disabled={gerando}
                    className="w-full py-3 rounded-xl font-bold tracking-widest text-sm bg-[#c7f465] hover:bg-[#d5f97a] text-[#07111d] disabled:opacity-50 transition-all">
                    {gerando ? "GERANDO..." : `⬇ BAIXAR ${storyPages.length} STOR${storyPages.length > 1 ? "IES" : "Y"}`}
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-white/40 tracking-wide">
                  Envie o print da tabela de classificação de cada divisão.
                </p>
                {classDiv.map((div, i) => (
                  <UploadCard key={div.key} label={div.label} arquivo={div.arquivo} processando={div.processando}
                    jogos={[]} tabela={div.tabela} erro={div.erro}
                    onFile={f => { updateClass(div.key, { arquivo: f, tabela: [], erro: null }); setClassPreview(i); }} />
                ))}
                <button onClick={processarClass} disabled={algumClassProcessando || classDiv.every(d => !d.arquivo)}
                  className="w-full py-3 rounded-xl font-bold tracking-widest text-sm bg-[#08a7cf] hover:bg-[#06c0ec] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  {algumClassProcessando ? "PROCESSANDO..." : "EXTRAIR CLASSIFICAÇÕES"}
                </button>
                {temClass && (
                  <button onClick={baixarClassificacoes} disabled={gerando}
                    className="w-full py-3 rounded-xl font-bold tracking-widest text-sm bg-[#c7f465] hover:bg-[#d5f97a] text-[#07111d] disabled:opacity-50 transition-all">
                    {gerando ? "GERANDO..." : `⬇ BAIXAR ${activeClass.length} CLASSIFICAÇ${activeClass.length > 1 ? "ÕES" : "ÃO"}`}
                  </button>
                )}
              </>
            )}
          </div>
        </aside>

        {/* RIGHT PANEL — PREVIEW */}
        <main className="flex-1 flex flex-col items-center overflow-auto bg-[#0d1b2a] py-8 px-4">
          <p className="text-xs text-white/30 tracking-widest mb-4">PRÉ-VISUALIZAÇÃO · 1080 × 1920 px</p>

          {tab === "jogos" ? (
            <>
              {/* Pagination */}
              {storyPages.length > 1 && (
                <div className="flex items-center gap-4 mb-4">
                  <button onClick={() => setPreviewPage(p => Math.max(0, p - 1))} disabled={curPage === 0}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-sm font-bold">◀</button>
                  <span className="text-xs text-white/50 tracking-widest">
                    PÁGINA {curPage + 1} DE {storyPages.length}
                  </span>
                  <button onClick={() => setPreviewPage(p => Math.min(storyPages.length - 1, p + 1))} disabled={curPage === storyPages.length - 1}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-sm font-bold">▶</button>
                </div>
              )}
              {/* Scaled preview */}
              <div style={{ transform: "scale(0.35)", transformOrigin: "top center", marginBottom: -1920 * 0.65 }}>
                <StoryPreview divisoes={storyPages[curPage] ?? []} rodada={rodada} page={curPage + 1} total={storyPages.length} campeonato={campeonato} />
              </div>
            </>
          ) : (
            <>
              {/* Classification division tabs */}
              {activeClass.length > 1 && (
                <div className="flex gap-1 mb-4 flex-wrap justify-center">
                  {activeClass.map((d, i) => (
                    <button key={d.key} onClick={() => setClassPreview(classDiv.findIndex(x => x.key === d.key))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide transition-all ${
                        classDiv[classPreview]?.key === d.key ? "bg-[#08a7cf]" : "bg-white/10 hover:bg-white/20"
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
              {/* Scaled classification preview */}
              <div style={{ transform: "scale(0.35)", transformOrigin: "top center", marginBottom: -1920 * 0.65 }}>
                <ClassificacaoStory
                  label={classDiv[classPreview]?.label ?? ""}
                  tabela={classDiv[classPreview]?.tabela ?? []}
                  campeonato={campeonato}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* HIDDEN OFF-SCREEN CAPTURE TARGETS */}
      <div aria-hidden="true" style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
        {/* Story pages */}
        {storyPages.map((page, i) => (
          <div key={`cap-${i}`} ref={el => { captureRefs.current[i] = el; }}>
            <StoryPreview divisoes={page} rodada={rodada} page={i + 1} total={storyPages.length} campeonato={campeonato} />
          </div>
        ))}
        {/* Classification stories */}
        {classDiv.map((d, i) => (
          d.tabela.length > 0 && (
            <div key={`cls-${d.key}`} ref={el => { classRefs.current[i] = el; }}>
              <ClassificacaoStory label={d.label} tabela={d.tabela} campeonato={campeonato} />
            </div>
          )
        ))}
      </div>
    </div>
  );
}

/* ── UploadCard ─────────────────────────────────────────────── */

interface UploadCardProps {
  label: string;
  arquivo: File | null;
  processando: boolean;
  jogos: Jogo[];
  tabela?: ClassificacaoItem[];
  erro: string | null;
  onFile: (f: File | null) => void;
}

function UploadCard({ label, arquivo, processando, jogos, tabela = [], erro, onFile }: UploadCardProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onFile(file);
  }

  const hasData  = jogos.length > 0 || tabela.length > 0;
  const countLabel = jogos.length > 0 ? `${jogos.length} jogo${jogos.length > 1 ? "s" : ""}` : tabela.length > 0 ? `${tabela.length} times` : null;

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ border: `1.5px solid ${hasData ? "#c7f465" : dragging ? "#08a7cf" : "rgba(255,255,255,0.08)"}` }}>
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#08a7cf]">
        <span className="font-bold text-sm tracking-widest">{label}</span>
        {countLabel && <span className="text-xs bg-[#c7f465] text-[#07111d] font-bold px-2 py-0.5 rounded-full">{countLabel}</span>}
        {processando && <span className="text-xs text-white/60 animate-pulse">Extraindo...</span>}
      </div>
      {/* drop zone */}
      <div className="p-3 cursor-pointer bg-white/[0.02]"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => onFile(e.target.files?.[0] ?? null)} />
        {arquivo ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(arquivo)} alt="preview"
              className="w-10 h-10 object-cover rounded-md border border-white/10" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-white/70">{arquivo.name}</p>
              {erro && <p className="text-xs text-red-400 mt-0.5">{erro}</p>}
              {jogos.length > 0 && (
                <p className="text-xs text-[#c7f465] mt-0.5 truncate">
                  {jogos.map(j => `${j.casa} × ${j.fora}`).join(" | ")}
                </p>
              )}
              {tabela.length > 0 && (
                <p className="text-xs text-[#c7f465] mt-0.5">{tabela.length} times extraídos</p>
              )}
            </div>
            <button onClick={e => { e.stopPropagation(); onFile(null); }}
              className="text-white/30 hover:text-white/70 text-lg leading-none">×</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-1 text-white/20">
            <span className="text-xl">↑</span>
            <span className="text-xs tracking-wide">clique ou arraste o print</span>
          </div>
        )}
      </div>
    </div>
  );
}
