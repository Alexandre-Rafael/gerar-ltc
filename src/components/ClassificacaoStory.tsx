"use client";

import { ClassificacaoItem } from "@/types";

interface Props {
  label: string;
  tabela: ClassificacaoItem[];
  campeonato?: string;
}

const GRID = "58px 1fr 75px 54px 54px 54px 54px 64px";
const COL_HEADS = ["#", "EQUIPE", "PTS", "J", "V", "E", "D", "SG"] as const;

function Dot() {
  return (
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#c7f465", display: "inline-block", flexShrink: 0 }} />
  );
}

function TitleLine({ text, color, size }: { text: string; color: string; size: number }) {
  return (
    <span
      className="story-title-line"
      style={{ display: "block", fontFamily: "'Cubano', Impact, Arial, sans-serif", fontSize: size, color, letterSpacing: "0.5px", lineHeight: 0.88 } as React.CSSProperties}
    >
      {text}
    </span>
  );
}

function ptBR(date: Date) {
  return date
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();
}

export function ClassificacaoStory({ label, tabela, campeonato = "Copa Fácil" }: Props) {
  const dateLabel = ptBR(new Date());

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: "#f2f4f6",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── HERO ── */}
      <section
        style={{
          height: 340,
          background: "#08a7cf",
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: "0 76px",
          gap: 34,
        }}
      >
        {/* lime stripe */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 7, background: "#c7f465" }} />

        {/* Title block */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: 28, fontWeight: 700, color: "#c7f465", letterSpacing: 2, opacity: 0.85, lineHeight: 1.2 }}>
            {campeonato.toUpperCase()}
          </span>
          {/* "CLASSIFICAÇÃO" — one line, white */}
          <TitleLine text="CLASSIFICAÇÃO" color="#f9f9f9" size={86} />
          {/* Division name — lime, larger */}
          <TitleLine text={label} color="#c7f465" size={100} />
        </div>

        {/* Logo — clean, no effects */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="LTC"
          style={{ width: 148, height: 148, objectFit: "contain", flexShrink: 0 }}
        />
      </section>

      {/* ── META BAR ── */}
      <section
        style={{
          height: 54,
          background: "#0b1220",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <Dot />
        <span style={{ fontFamily: "'Cubano', Impact, Arial, sans-serif", fontSize: 25, color: "#f9f9f9", letterSpacing: 3 }}>
          ATUALIZAÇÃO · {dateLabel}
        </span>
        <Dot />
      </section>

      {/* ── TABLE ── */}
      <section style={{ padding: "44px 52px" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e3e8ec",
            borderRadius: 9,
            overflow: "hidden",
          }}
        >
          {/* Card division header */}
          <header
            style={{
              height: 48,
              background: "#08a7cf",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 24px",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#c7f465", flexShrink: 0 }} />
            <span
              style={{
                fontFamily: "'Cubano', Impact, Arial, sans-serif",
                fontSize: 30,
                color: "#f9f9f9",
                letterSpacing: 2,
              }}
            >
              {label}
            </span>
          </header>

          {/* Column sub-header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              padding: "10px 24px",
              gap: 8,
              background: "#f0f4f7",
              borderBottom: "1px solid #e3e8ec",
            }}
          >
            {COL_HEADS.map((h, i) => (
              <span
                key={h}
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: "#9aaab5",
                  letterSpacing: 1,
                  textAlign: i <= 1 ? "left" : "center",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Data rows */}
          {tabela.length === 0 ? (
            <p style={{ padding: "40px 24px", textAlign: "center", color: "#aaa", fontSize: 24 }}>
              Nenhuma classificação extraída.
            </p>
          ) : (
            tabela.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  padding: "17px 24px",
                  gap: 8,
                  alignItems: "center",
                  borderTop: i === 0 ? "none" : "1px solid #edf0f2",
                  background: i % 2 === 0 ? "#ffffff" : "#fafbfc",
                }}
              >
                {/* Pos */}
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: row.pos <= 4 ? "#08a7cf" : "#b0bec5",
                    textAlign: "left",
                  }}
                >
                  {row.pos}
                </span>

                {/* Team name */}
                <span style={{ fontSize: 24, fontWeight: 800, color: "#07111d" }}>
                  {row.time}
                </span>

                {/* PTS */}
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#07111d",
                    textAlign: "center",
                  }}
                >
                  {row.pts}
                </span>

                {/* J, V, E, D */}
                {[row.j, row.v, row.e, row.d].map((val, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: "#7a8a95",
                      textAlign: "center",
                    }}
                  >
                    {val}
                  </span>
                ))}

                {/* SG */}
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    textAlign: "center",
                    color: row.sg > 0 ? "#1a9e3f" : row.sg < 0 ? "#c0392b" : "#7a8a95",
                  }}
                >
                  {row.sg > 0 ? `+${row.sg}` : row.sg}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
