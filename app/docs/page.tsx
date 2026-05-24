"use client";

import SwaggerUI from "swagger-ui-react";
import { openApiSpec } from "./openapi";

export default function DocsPage() {
  return (
    <main className="docs-page">
      <header className="docs-header">
        <p className="eyebrow">Music Player Backend</p>
        <h1>Swagger API Docs</h1>
        <p>
          Interactive OpenAPI documentation for every backend route under <span>/api</span>.
        </p>
      </header>
      <section className="swagger-shell">
        <SwaggerUI spec={openApiSpec} deepLinking docExpansion="list" defaultModelsExpandDepth={1} />
      </section>
      <style jsx>{`
        .docs-page {
          min-height: 100vh;
          padding: 32px;
          background:
            radial-gradient(circle at top left, rgba(231, 177, 100, 0.2), transparent 28%),
            radial-gradient(circle at top right, rgba(82, 112, 195, 0.18), transparent 24%),
            linear-gradient(180deg, #111116 0%, #17191f 100%);
          color: #f4efe7;
        }

        .docs-header {
          max-width: 980px;
          margin: 0 auto 20px;
          padding: 28px 28px 0;
        }

        .eyebrow {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.72rem;
          color: #d7a867;
        }

        h1 {
          margin: 10px 0 12px;
          font-size: clamp(2.4rem, 5vw, 4.5rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .docs-header p {
          max-width: 72ch;
          color: rgba(244, 239, 231, 0.74);
          line-height: 1.7;
        }

        .swagger-shell {
          max-width: 1240px;
          margin: 0 auto;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.24);
        }

        :global(.swagger-ui) {
          background: #fff;
        }

        :global(.swagger-ui .topbar) {
          display: none;
        }

        :global(.swagger-ui .info .title) {
          font-family: Inter, system-ui, sans-serif;
        }
      `}</style>
    </main>
  );
}