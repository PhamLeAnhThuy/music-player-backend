"use client";

type Endpoint = {
  method: string;
  path: string;
  description: string;
  auth: string;
  request?: string;
  response?: string;
};

type Section = {
  title: string;
  summary: string;
  endpoints: Endpoint[];
};

const sections: Section[] = [
  {
    title: "Authentication",
    summary: "Session and account endpoints for sign-in, sign-up, logout, and password reset.",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/login",
        description: "Create a session with email and password.",
        auth: "Public",
        request: `{
  "email": "user@example.com",
  "password": "secret"
}`,
        response: `{
  "session": { ... }
}`,
      },
      {
        method: "POST",
        path: "/api/auth/signup",
        description: "Create a new account and user record.",
        auth: "Public",
        request: `{
  "email": "user@example.com",
  "password": "secret",
  "name": "Ava"
}`,
        response: `{
  "user": { ... }
}`,
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        description: "Invalidate the active access token.",
        auth: "Authorization: Bearer <token>",
        request: `Authorization: Bearer <access-token>`,
        response: `{
  "success": true
}`,
      },
      {
        method: "POST",
        path: "/api/auth/reset-password",
        description: "Send a password reset email to the supplied address.",
        auth: "Public",
        request: `{
  "email": "user@example.com"
}`,
        response: `{
  "success": true
}`,
      },
    ],
  },
  {
    title: "Playlists",
    summary: "CRUD operations for playlists and their song ordering.",
    endpoints: [
      {
        method: "GET",
        path: "/api/playlists",
        description: "List playlists for the current user.",
        auth: "x-user-id header required",
        response: `{
  "playlists": [ ... ]
}`,
      },
      {
        method: "POST",
        path: "/api/playlists",
        description: "Create a playlist for the current user.",
        auth: "x-user-id header required",
        request: `{
  "name": "Favorites",
  "description": "Daily rotation",
  "cover_url": "https://..."
}`,
        response: `{
  "playlist": { ... }
}`,
      },
      {
        method: "GET",
        path: "/api/playlists/[id]",
        description: "Fetch one playlist by id.",
        auth: "x-user-id header required",
        response: `{
  "playlist": { ... }
}`,
      },
      {
        method: "PATCH",
        path: "/api/playlists/[id]",
        description: "Update playlist fields.",
        auth: "x-user-id header required",
        request: `{
  "name": "Updated name",
  "description": null,
  "cover_url": null
}`,
        response: `{
  "playlist": { ... }
}`,
      },
      {
        method: "DELETE",
        path: "/api/playlists/[id]",
        description: "Delete a playlist.",
        auth: "x-user-id header required",
        response: `{
  "success": true
}`,
      },
      {
        method: "GET",
        path: "/api/playlists/[id]/songs",
        description: "List songs inside a playlist.",
        auth: "x-user-id header required",
        response: `{
  "songs": [ ... ]
}`,
      },
      {
        method: "POST",
        path: "/api/playlists/[id]/songs",
        description: "Add a song to a playlist.",
        auth: "x-user-id header required",
        request: `{
  "spotifyTrackId": "3n3Ppam7vgaVa1iaRUc9Lp",
  "position": 0
}`,
        response: `{
  "alreadyExists": false,
  "...": "..."
}`,
      },
      {
        method: "PATCH",
        path: "/api/playlists/[id]/songs",
        description: "Reorder songs in a playlist.",
        auth: "x-user-id header required",
        request: `{
  "orders": [
    { "spotifyTrackId": "track-1", "position": 0 },
    { "spotifyTrackId": "track-2", "position": 1 }
  ]
}`,
        response: `{
  "success": true
}`,
      },
      {
        method: "DELETE",
        path: "/api/playlists/[id]/songs/[trackId]",
        description: "Remove one song from a playlist.",
        auth: "x-user-id header required",
        response: `{
  "success": true
}`,
      },
    ],
  },
  {
    title: "Songs",
    summary: "Search and lookup endpoints for Spotify-backed track data.",
    endpoints: [
      {
        method: "GET",
        path: "/api/songs/search?q=...&limit=20",
        description: "Search songs by query string.",
        auth: "Public",
        response: `{
  "...": "search results"
}`,
      },
      {
        method: "GET",
        path: "/api/songs/[spotifyTrackId]",
        description: "Fetch one song by Spotify track id.",
        auth: "Public",
        response: `{
  "...": "song details"
}`,
      },
      {
        method: "GET",
        path: "/api/recommendations",
        description: "Return personalized recommendations.",
        auth: "x-user-id header required",
        response: `{
  "...": "recommendation payload"
}`,
      },
    ],
  },
  {
    title: "User",
    summary: "Profile and listening stats for the active user.",
    endpoints: [
      {
        method: "GET",
        path: "/api/user/profile",
        description: "Fetch the current profile.",
        auth: "x-user-id header required",
        response: `{
  "profile": { ... }
}`,
      },
      {
        method: "PATCH",
        path: "/api/user/profile",
        description: "Update the current profile name or avatar.",
        auth: "x-user-id header required",
        request: `{
  "name": "Ava",
  "avatar_url": "https://..."
}`,
        response: `{
  "profile": { ... }
}`,
      },
      {
        method: "GET",
        path: "/api/user/profile/stats",
        description: "Fetch listening stats for the current user.",
        auth: "x-user-id header required",
        response: `{
  "stats": { ... }
}`,
      },
    ],
  },
];

const responseEnvelope = `Success
{
  "...": "payload"
}

Error
{
  "error": "message"
}`;

export default function HomePage() {
  return (
    <main className="docs-shell">
      <section className="hero card">
        <div className="hero-copy">
          <p className="eyebrow">Music Player Backend</p>
          <h1>API Docs</h1>
          <p className="lead">
            A compact reference for the backend routes that power auth, playlists,
            song lookup, recommendations, and user profile data.
          </p>
        </div>
        <div className="hero-panel">
          <div className="panel-title">Base URL</div>
          <div className="mono">/api</div>
          <div className="panel-title">Protected routes</div>
          <div className="mono">x-user-id: &lt;user-id&gt;</div>
          <div className="panel-title">Auth logout</div>
          <div className="mono">Authorization: Bearer &lt;token&gt;</div>
        </div>
      </section>

      <section className="info-grid">
        <article className="card">
          <p className="card-label">Response envelope</p>
          <h2>JSON responses</h2>
          <pre>{responseEnvelope}</pre>
        </article>
        <article className="card">
          <p className="card-label">Protected access</p>
          <h2>Header contract</h2>
          <p>
            Most user-specific routes require the <span className="mono">x-user-id</span>{" "}
            header. Authentication routes are public except logout, which expects a bearer
            token in <span className="mono">Authorization</span>.
          </p>
        </article>
      </section>

      <section className="sections">
        {sections.map((section) => (
          <section className="section card" key={section.title}>
            <div className="section-heading">
              <div>
                <p className="card-label">{section.title}</p>
                <h2>{section.summary}</h2>
              </div>
            </div>

            <div className="endpoint-list">
              {section.endpoints.map((endpoint) => (
                <article className="endpoint" key={`${endpoint.method}-${endpoint.path}`}>
                  <div className="endpoint-top">
                    <div>
                      <p className="method">{endpoint.method}</p>
                      <h3>{endpoint.path}</h3>
                    </div>
                    <span className="auth-pill">{endpoint.auth}</span>
                  </div>
                  <p className="description">{endpoint.description}</p>

                  <div className="endpoint-details">
                    {endpoint.request ? (
                      <div>
                        <p className="detail-label">Request</p>
                        <pre>{endpoint.request}</pre>
                      </div>
                    ) : null}
                    {endpoint.response ? (
                      <div>
                        <p className="detail-label">Response</p>
                        <pre>{endpoint.response}</pre>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>

      <style jsx>{`
        .docs-shell {
          min-height: 100vh;
          padding: 32px;
          color: #f4efe7;
          background:
            radial-gradient(circle at top left, rgba(231, 177, 100, 0.18), transparent 28%),
            radial-gradient(circle at top right, rgba(82, 112, 195, 0.18), transparent 24%),
            linear-gradient(180deg, #111116 0%, #17191f 100%);
        }

        .card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 12, 16, 0.72);
          backdrop-filter: blur(18px);
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.24);
        }

        .hero {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
          gap: 24px;
          border-radius: 28px;
          padding: 32px;
        }

        .hero-copy h1,
        .section h2,
        .endpoint h3 {
          margin: 0;
          letter-spacing: -0.03em;
        }

        .hero-copy h1 {
          font-size: clamp(2.8rem, 6vw, 5.4rem);
          line-height: 0.95;
          margin-top: 8px;
        }

        .lead {
          max-width: 62ch;
          margin: 18px 0 0;
          color: rgba(244, 239, 231, 0.76);
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .eyebrow,
        .card-label,
        .panel-title,
        .detail-label {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.72rem;
          color: #d7a867;
        }

        .hero-panel,
        .info-grid,
        .sections {
          display: grid;
          gap: 20px;
        }

        .hero-panel {
          align-content: start;
          padding: 20px;
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
        }

        .panel-title {
          margin-top: 12px;
          color: rgba(244, 239, 231, 0.58);
        }

        .mono,
        pre {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        }

        .mono {
          font-size: 0.96rem;
          color: #fff2cb;
        }

        .info-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-top: 20px;
        }

        .info-grid .card,
        .section.card {
          border-radius: 24px;
          padding: 24px;
        }

        .info-grid h2,
        .section h2 {
          font-size: 1.2rem;
          margin-top: 8px;
        }

        .info-grid p,
        .description {
          color: rgba(244, 239, 231, 0.76);
          line-height: 1.65;
        }

        pre {
          overflow: auto;
          margin: 14px 0 0;
          padding: 16px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: #f6f0e4;
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.55;
          font-size: 0.92rem;
        }

        .sections {
          margin-top: 20px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: start;
          margin-bottom: 18px;
        }

        .endpoint-list {
          display: grid;
          gap: 16px;
        }

        .endpoint {
          padding: 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .endpoint-top {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 16px;
        }

        .method {
          margin: 0 0 6px;
          color: #8dd4ff;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.16em;
        }

        .auth-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(215, 168, 103, 0.12);
          color: #f2c98d;
          font-size: 0.82rem;
          white-space: nowrap;
        }

        .endpoint-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 14px;
        }

        @media (max-width: 900px) {
          .hero,
          .info-grid,
          .endpoint-details {
            grid-template-columns: 1fr;
          }

          .docs-shell {
            padding: 16px;
          }

          .hero {
            padding: 24px;
          }

          .section-heading,
          .endpoint-top {
            flex-direction: column;
          }

          .auth-pill {
            align-self: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
