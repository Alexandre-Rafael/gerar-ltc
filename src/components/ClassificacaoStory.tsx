"use client";

import { ClassificacaoItem } from "@/types";

interface Props {
  label: string;
  tabela: ClassificacaoItem[];
}

function Dot() {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#c7f465",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function TitleLine({ text, color, size }: { text: string; color: string; size: number }) {
  return (
    <span
      className="story-title-line"
      style={
        {
          display: "block",
          fontFamily: "'Cubano', Impact, Arial, sans-serif",
          fontSize: size,
          color,
          letterSpacing: "0.5px",
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  );
}

const COLS = ["#", "TIME", "PTS", "J", "V", "E", "D", "SG"] as const;
const GRID = "52px 1fr 68px 48px 48px 48px 48px 60px";

export function ClassificacaoStory({ label, tabela }: Props) {
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
      {/* HERO */}
      <section
        style={{
          height: 390,
          background: "#08a7cf",
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: "0 76px",
          gap: 34,
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 7, background: "#c7f465" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 0.88 }}>
          <TitleLine text="CLASSI" color="#f9f9f9" size={118} />
          <TitleLine text="FICA" color="#c7f465" size={118} />
          <TitleLine text="ÇÃO" color="#f9f9f9" size={110} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="LTC" style={{ width: 140, height: 140, objectFit: "contain" }} />
      </section>

      {/* META BAR */}
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
          {label.toUpperCase()}
        </span>
        <Dot />
      </section>

      {/* TABLE */}
      <section style={{ padding: "44px 52px" }}>
        <div style={{ background: "#fff", border: "1px solid #e3e8ec", borderRadius: 9, overflow: "hidden" }}>
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              background: "#08a7cf",
              padding: "14px 20px",
              gap: 8,
              alignItems: "center",
            }}
          >
            {COLS.map((h, i) => (
              <span
                key={h}
                style={{
                  fontFamily: "'Cubano', Impact, Arial, sans-serif",
                  fontSize: 22,
                  color: "#f9f9f9",
                  letterSpacing: 1,
                  textAlign: i === 1 ? "left" : "center",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Data rows */}
          {tabela.length === 0 ? (
            <p style={{ padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: 24 }}>
              Nenhuma classificação extraída.
            </p>
          ) : (
            tabela.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  padding: "15px 20px",
                  gap: 8,
                  alignItems: "center",
                  borderTop: i === 0 ? "none" : "1px solid #edf0f2",
                  background: i % 2 === 0 ? "#fff" : "#fafbfc",
                }}
              >
                {/* Pos */}
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: row.pos <= 4 ? "#08a7cf" : "#07111d",
                    textAlign: "center",
                  }}
                >
                  {row.pos}
                </span>
                {/* Time */}
                <span style={{ fontSize: 23, fontWeight: 800, color: "#07111d" }}>{row.time}</span>
                {/* PTS */}
                <span
                  style={{
                    fontFamily: "'Cubano', Impact, Arial, sans-serif",
                    fontSize: 24,
                    color: "#f9f9f9",
                    background: "#0b1220",
                    borderRadius: 6,
                    padding: "3px 0",
                    textAlign: "center",
                    display: "block",
                  }}
                >
                  {row.pts}
                </span>
                {/* J, V, E, D */}
                {[row.j, row.v, row.e, row.d].map((val, j) => (
                  <span key={j} style={{ fontSize: 21, fontWeight: 700, color: "#666", textAlign: "center" }}>
                    {val}
                  </span>
                ))}
                {/* SG */}
                <span
                  style={{
                    fontSize: 21,
                    fontWeight: 700,
                    textAlign: "center",
                    color: row.sg > 0 ? "#1a9e3f" : row.sg < 0 ? "#c0392b" : "#666",
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
