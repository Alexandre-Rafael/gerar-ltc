"use client";

import { Divisao, Jogo } from "@/types";

interface Props {
  divisoes: Divisao[];
  rodada: string;
}

/* ── helpers ────────────────────────────────────────────────── */

function GameRow({ jogo, isFirst }: { jogo: Jogo; isFirst: boolean }) {
  return (
    <div
      style={{
        padding: "15px 26px 14px",
        borderTop: isFirst ? "none" : "1px solid #edf0f2",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 54px 1fr",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 25,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.2px",
            textAlign: "left",
            color: "#07111d",
          }}
        >
          {jogo.casa}
        </span>
        <span
          style={{
            fontFamily: "'Cubano', Impact, Arial, sans-serif",
            fontSize: 21,
            color: "#08a7cf",
            opacity: 0.65,
            textAlign: "center",
          }}
        >
          VS
        </span>
        <span
          style={{
            fontSize: 25,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.2px",
            textAlign: "right",
            color: "#07111d",
          }}
        >
          {jogo.fora}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: "#969fa9" }}>
          {jogo.campo}
        </span>
        <span
          style={{
            fontFamily: "'Cubano', Impact, Arial, sans-serif",
            fontSize: 22,
            color: "#f9f9f9",
            background: "#0b1220",
            borderRadius: 7,
            padding: "5px 15px",
            letterSpacing: "1.2px",
            whiteSpace: "nowrap",
          }}
        >
          {jogo.data.toUpperCase()} · {jogo.hora}
        </span>
      </div>
    </div>
  );
}

function DivCard({ divisao }: { divisao: Divisao }) {
  if (divisao.jogos.length === 0) return null;
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e3e8ec",
        borderRadius: 9,
        overflow: "hidden",
      }}
    >
      <header
        style={{
          height: 44,
          background: "#08a7cf",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 24px",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#c7f465",
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            fontFamily: "'Cubano', Impact, Arial, sans-serif",
            fontSize: 30,
            color: "#f9f9f9",
            letterSpacing: 2,
            fontWeight: "normal",
          }}
        >
          {divisao.label}
        </h2>
      </header>
      {divisao.jogos.map((j, i) => (
        <GameRow key={i} jogo={j} isFirst={i === 0} />
      ))}
    </article>
  );
}

/* ── main component ─────────────────────────────────────────── */

export function StoryPreview({ divisoes, rodada }: Props) {
  const activeDivisoes = divisoes.filter((d) => d.jogos.length > 0);

  return (
    <div
      id="story-capture"
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
          height: 390,
          background: "#08a7cf",
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: "0 76px",
          gap: 34,
        }}
      >
        {/* lime stripe */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 7,
            background: "#c7f465",
          }}
        />

        {/* title */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 0.88 }}>
          {(
            [
              { text: "JOGOS", color: "#f9f9f9", size: 112 },
              { text: "DA", color: "#c7f465", size: 108 },
              { text: "RODADA", color: "#f9f9f9", size: 100 },
            ] as const
          ).map(({ text, color, size }) => (
            <TitleLine key={text} text={text} color={color} size={size} />
          ))}
        </div>

        {/* logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="LTC"
          style={{ width: 140, height: 140, objectFit: "contain" }}
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
        <span
          style={{
            fontFamily: "'Cubano', Impact, Arial, sans-serif",
            fontSize: 25,
            color: "#f9f9f9",
            letterSpacing: 3,
          }}
        >
          {rodada.toUpperCase()}
        </span>
        <Dot />
      </section>

      {/* ── CARDS ── */}
      <section
        style={{
          padding: "34px 52px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {activeDivisoes.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#aaa",
              fontSize: 28,
              marginTop: 60,
            }}
          >
            Nenhum jogo extraído ainda.
          </p>
        ) : (
          activeDivisoes.map((d) => <DivCard key={d.key} divisao={d} />)
        )}
      </section>
    </div>
  );
}

/* ── tiny helpers ───────────────────────────────────────────── */

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

function TitleLine({
  text,
  color,
  size,
}: {
  text: string;
  color: string;
  size: number;
}) {
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
          // paint-order and webkit-text-stroke applied via CSS class below
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  );
}
