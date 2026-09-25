# GhostPDF

Anonymous, privacy-first PDF sharing. Upload a PDF, get a secure link. The document self-destructs after being opened once or after 10 minutes.

## Features

- **Client-side encryption**: AES-256-GCM encryption happens in the browser. Plaintext PDFs never reach the server.
- **Self-destructing**: Files are permanently deleted after first view or 10 minutes.
- **Zero tracking**: No accounts, no sessions, no user analytics.
- **Fast**: The entire upload experience takes under 15 seconds.
- **Privacy-first**: Only encrypted bytes and temporary metadata are ever stored.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL (via Prisma ORM) |
| Storage | Cloudflare R2 (S3-compatible) |
| PDF Rendering | Mozilla PDF.js |
| Encryption | Web Crypto API (AES-256-GCM) |
| Deployment | Docker, Vercel-ready |

## Architecture

```
Browser (sender)
  │
  ├── Generate AES-256 key
  ├── Generate 12-byte IV
  ├── Encrypt PDF in-memory (Web Crypto API)
  └── Upload encrypted bytes + wrapped key + IV
                       │
                       ▼
POST /api/upload ──► Store encrypted blob in R2
                  └── Store metadata in PostgreSQL
                       │
                       ▼
                  Generate UUID-based URL (/v/{id})
                       │
                       ▼
Browser (recipient) opens /v/{id}
                  │
                  ├── GET /api/view/{id}  → validate
                  ├── GET /api/key/{id}   → atomically claim (ACTIVE→OPENED)
                  ├── GET /api/data/{id}  → download encrypted blob
                  ├── Decrypt in browser memory (Web Crypto API)
                  └── Render with PDF.js
                       │
                       ▼
            Server immediately deletes:
             - Encrypted blob from R2
             - Metadata row from PostgreSQL
```

## Database Schema

```sql
CREATE TABLE temp_files (
  id         UUID PRIMARY KEY,
  object_key TEXT NOT NULL,
  wrapped_key BYTEA NOT NULL,
  iv         BYTEA NOT NULL,
  status     ENUM('ACTIVE', 'OPENED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  opened_at  TIMESTAMP NULL
);
```

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Cloudflare R2 account (for production)

### 2. Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Fill in your environment variables in .env:
# - DATABASE_URL: PostgreSQL connection string
# - R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
# - INTERNAL_API_KEY: Random string for the cleanup API
# - NEXT_PUBLIC_APP_URL: Your app's public URL

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

> For local development without R2, you can use any S3-compatible service or
> configure a local dev store. The app will fail R2 uploads if credentials are missing.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production

```bash
npm run build
npm start
```

Or with Docker:

```bash
docker compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Upload encrypted PDF blob |
| GET | `/api/view/{id}` | Validate document status |
| GET | `/api/key/{id}` | Atomically claim document & return decryption key |
| GET | `/api/data/{id}` | Download encrypted blob |
| POST | `/api/cleanup` | Trigger cleanup job (requires Bearer auth) |
| GET | `/api/health` | Health check |

## Security

- **AES-256-GCM** encryption performed client-side
- Encrypted blobs are stored in R2 with no-store cache headers
- Rate limiting (10 uploads/minute/IP)
- Input validation on every request (MIME type, magic bytes, file size)
- Atomic status transitions prevent race conditions on concurrent opens
- Keys are zeroed from browser memory after decryption
- No permanent user data stored
- Path traversal prevention via filename sanitization

## Testing

```bash
npm test
```

Coverage includes:
- Upload validation
- Client-side encryption parameters
- Expiry logic
- Delete-after-open cleanup
- Race condition handling
- Cleanup service
- API validation

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/       # Upload endpoint
│   │   ├── view/[id]/    # View validation
│   │   ├── key/[id]/     # Key issuance + atomic claim
│   │   ├── data/[id]/    # Encrypted blob streaming
│   │   ├── cleanup/      # Cron-triggered cleanup
│   │   └── health/       # Health check
│   ├── v/[id]/           # View page
│   ├── expired/          # Expired page
│   ├── page.tsx          # Landing page
│   ├── not-found.tsx
│   └── error.tsx         # Error boundary
├── components/
│   ├── ui/               # Reusable UI components
│   ├── upload-box.tsx    # Drag & drop upload UI
│   ├── share-link.tsx    # Share link UI
│   ├── pdf-viewer.tsx    # PDF.js viewer
│   ├── viewer-page.tsx   # View flow
│   └── expired-page.tsx  # Expired state
├── hooks/
│   ├── use-upload.ts     # Upload hook with progress
│   └── use-viewer.ts     # View/decrypt flow hook
├── lib/
│   ├── crypto.ts         # Web Crypto API wrapper
│   ├── prisma.ts         # DB client
│   ├── utils.ts          # Utilities
│   ├── constants.ts      # Configuration
│   ├── rate-limit.ts     # Rate limiting
│   ├── api-response.ts   # API response helpers
│   ├── repositories/     # Data access layer
│   └── services/         # Business logic layer
tests/                    # Unit tests
```

## License

MIT