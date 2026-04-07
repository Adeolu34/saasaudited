import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "SaasAudited";
  const subtitle =
    searchParams.get("subtitle") || "Unbiased B2B SaaS Reviews & Comparisons";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "6px",
            height: "100%",
            background: "linear-gradient(180deg, #f97316, #ea580c, #c2410c)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#a3a3a3",
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            SaasAudited
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: title.length > 60 ? "42px" : "52px",
            fontWeight: 800,
            color: "#fafafa",
            lineHeight: 1.15,
            margin: "0 0 20px 0",
            maxWidth: "900px",
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "22px",
            color: "#a3a3a3",
            margin: 0,
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#737373" }}>
            saasaudited.com
          </span>
          <span style={{ fontSize: "14px", color: "#525252" }}>|</span>
          <span style={{ fontSize: "14px", color: "#737373" }}>
            Data-driven software reviews
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
