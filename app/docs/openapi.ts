export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Music Player Backend API",
    version: "1.0.0",
    description: "Swagger documentation for the Music Player backend routes.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Authentication" },
    { name: "Playlists" },
    { name: "Songs" },
    { name: "User" },
  ],
  components: {
    securitySchemes: {
      UserIdHeader: {
        type: "apiKey",
        in: "header",
        name: "x-user-id",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string" },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
        },
      },
    },
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Create a session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "user@example.com",
                password: "secret",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Session created",
            content: {
              "application/json": {
                example: {
                  session: {
                    access_token: "...",
                    refresh_token: "...",
                  },
                },
              },
            },
          },
          400: { description: "Missing credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Create an account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "user@example.com",
                password: "secret",
                name: "Ava",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Account created",
            content: {
              "application/json": {
                example: { user: { id: "...", email: "user@example.com" } },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Invalidate the active access token",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Logged out",
            content: {
              "application/json": {
                example: { success: true },
              },
            },
          },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request a password reset",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { email: "user@example.com" },
            },
          },
        },
        responses: {
          200: {
            description: "Reset requested",
            content: {
              "application/json": {
                example: { success: true },
              },
            },
          },
        },
      },
    },
    "/api/playlists": {
      get: {
        tags: ["Playlists"],
        summary: "List playlists for the current user",
        security: [{ UserIdHeader: [] }],
        responses: {
          200: {
            description: "Playlist list",
            content: {
              "application/json": {
                example: { playlists: [] },
              },
            },
          },
        },
      },
      post: {
        tags: ["Playlists"],
        summary: "Create a playlist",
        security: [{ UserIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Favorites",
                description: "Daily rotation",
                cover_url: "https://...",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Playlist created",
            content: {
              "application/json": {
                example: { playlist: { id: "...", name: "Favorites" } },
              },
            },
          },
        },
      },
    },
    "/api/playlists/{id}": {
      get: {
        tags: ["Playlists"],
        summary: "Fetch a playlist",
        security: [{ UserIdHeader: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Playlist found" },
          404: { description: "Playlist not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      patch: {
        tags: ["Playlists"],
        summary: "Update a playlist",
        security: [{ UserIdHeader: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { name: "Updated name", description: null, cover_url: null },
            },
          },
        },
        responses: { 200: { description: "Playlist updated" } },
      },
      delete: {
        tags: ["Playlists"],
        summary: "Delete a playlist",
        security: [{ UserIdHeader: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Playlist deleted",
            content: {
              "application/json": {
                example: { success: true },
              },
            },
          },
        },
      },
    },
    "/api/playlists/{id}/songs": {
      get: {
        tags: ["Playlists"],
        summary: "List songs in a playlist",
        security: [{ UserIdHeader: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Songs listed" } },
      },
      post: {
        tags: ["Playlists"],
        summary: "Add a song to a playlist",
        security: [{ UserIdHeader: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { spotifyTrackId: "3n3Ppam7vgaVa1iaRUc9Lp", position: 0 },
            },
          },
        },
        responses: {
          200: { description: "Song already existed" },
          201: { description: "Song added" },
        },
      },
      patch: {
        tags: ["Playlists"],
        summary: "Reorder songs in a playlist",
        security: [{ UserIdHeader: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                orders: [
                  { spotifyTrackId: "track-1", position: 0 },
                  { spotifyTrackId: "track-2", position: 1 },
                ],
              },
            },
          },
        },
        responses: { 200: { description: "Songs reordered" } },
      },
    },
    "/api/playlists/{id}/songs/{trackId}": {
      delete: {
        tags: ["Playlists"],
        summary: "Remove a song from a playlist",
        security: [{ UserIdHeader: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "trackId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Song removed",
            content: {
              "application/json": {
                example: { success: true },
              },
            },
          },
        },
      },
    },
    "/api/songs/search": {
      get: {
        tags: ["Songs"],
        summary: "Search songs",
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" } },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 20 } },
        ],
        responses: { 200: { description: "Search results" } },
      },
    },
    "/api/songs/{spotifyTrackId}": {
      get: {
        tags: ["Songs"],
        summary: "Fetch a song by Spotify track id",
        parameters: [{ name: "spotifyTrackId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Song details" } },
      },
    },
    "/api/recommendations": {
      get: {
        tags: ["Songs"],
        summary: "Get personalized recommendations",
        security: [{ UserIdHeader: [] }],
        responses: { 200: { description: "Recommendations returned" } },
      },
    },
    "/api/user/profile": {
      get: {
        tags: ["User"],
        summary: "Fetch the current profile",
        security: [{ UserIdHeader: [] }],
        responses: { 200: { description: "Profile returned" }, 404: { description: "Profile not found" } },
      },
      patch: {
        tags: ["User"],
        summary: "Update the current profile",
        security: [{ UserIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { name: "Ava", avatar_url: "https://..." },
            },
          },
        },
        responses: { 200: { description: "Profile updated" } },
      },
    },
    "/api/user/profile/stats": {
      get: {
        tags: ["User"],
        summary: "Fetch listening stats",
        security: [{ UserIdHeader: [] }],
        responses: { 200: { description: "Stats returned" } },
      },
    },
  },
} as const;