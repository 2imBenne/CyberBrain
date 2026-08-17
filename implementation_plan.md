# 🧠 CYBER-BRAIN — Kế Hoạch Triển Khai (v2 — Đã Điều Chỉnh)

## Tổng quan

CYBER-BRAIN là hệ thống "Second Brain" **multi-user**, kết hợp backend Java Spring Boot với frontend React + Three.js, triển khai lên Cloud (Railway + Vercel). Giao diện sử dụng bộ thư viện UI hiện đại thay vì CSS thuần để tăng tốc phát triển và đảm bảo tính nhất quán.

---

## ✅ Quyết định đã chốt

| Vấn đề | Quyết định |
|:---|:---|
| User model | **Multi-user** — đầy đủ JWT Auth + RBAC |
| Thứ tự build | **Option A** — Backend trước, Frontend sau |
| Deploy | **Render** (Backend) + **Neon** (PostgreSQL) + **Vercel** (Frontend) — free tier |
| UI approach | **Tailwind CSS + shadcn/ui + Framer Motion** — không CSS thuần |

---

## ⚠️ Phân tích & Điều chỉnh Tài liệu Gốc

> [!WARNING]
> **Các điểm đã được điều chỉnh so với thiết kế gốc:**

### 🔴 Authentication Flow đầy đủ (Multi-user)
Multi-user yêu cầu JWT hoàn chỉnh: Access Token (15 phút) + Refresh Token (7 ngày), lưu Refresh Token vào DB để có thể revoke. Thêm bảng `tb_refresh_tokens`.

### 🔴 `tb_knowledge_graph` nâng cấp
Thêm `relation_type` (`RELATED_TO`, `PREREQUISITE_OF`, `PART_OF`, `SEE_ALSO`) và `weight` (float) để thuật toán Force-Directed layout 3D có ý nghĩa ngữ nghĩa thực sự.

### 🟡 Full-Text Search với PostgreSQL TSVECTOR
Dùng cột `search_vector` (TSVECTOR) + GIN index thay vì `LIKE '%keyword%'` để đạt hiệu năng và hỗ trợ tiếng Việt.

### 🟡 Thêm Phase 2.5 — Data Layer for 3D
Tách riêng bước chuẩn bị dữ liệu Graph (normalize, tính tọa độ 3D bằng d3-force) trước khi render, tránh Phase 3 bị ngợp.

### 🟢 UI Library Stack mới (Thay CSS thuần)
Dùng **Tailwind CSS** (utility classes) + **shadcn/ui** (headless components) + **Framer Motion** (animations) thay vì viết CSS thủ công.

---

## 🗂️ Kiến trúc Hệ thống

```
┌──────────────────────────────────────────────────────────────────┐
│                        CYBER-BRAIN STACK                         │
├──────────────────────────────┬───────────────────────────────────┤
│          FRONTEND            │             BACKEND               │
│                              │                                   │
│  React 18 + Vite             │  Java 17 + Spring Boot 4.1.x     │
│  Tailwind CSS                │  Spring Security 6 + JWT         │
│  shadcn/ui (Radix-based)     │  Spring Data JPA                 │
│  Framer Motion               │  PostgreSQL 16 (FTS)             │
│  React Three Fiber + Drei    │  Liquibase (Migrations)          │
│  GSAP + ScrollTrigger        │  MapStruct + Lombok               │
│  Zustand                     │  flexmark-java (MD→HTML)         │
│  TipTap Editor               │  SpringDoc OpenAPI (Swagger)     │
│  Prism.js / Shiki            │  Docker (local dev)              │
│  Howler.js (sound FX)        │                                   │
├──────────────────────────────┴───────────────────────────────────┤
│                         CLOUD DEPLOY                             │
│  Render (Backend API) + Neon (PostgreSQL) │ Vercel (React SPA)   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Library Stack Chi Tiết

> [!NOTE]
> Đây là thay đổi lớn nhất so với tài liệu gốc — thay toàn bộ CSS thuần bằng bộ thư viện sau:

| Thư viện | Vai trò | Lý do chọn |
|:---|:---|:---|
| **Tailwind CSS v3** | Utility-first styling | Tốc độ phát triển nhanh, nhất quán, treeshake tốt |
| **shadcn/ui** | Component primitives (Dialog, Dropdown, Tooltip...) | Headless (không style cứng), tích hợp hoàn hảo với Tailwind, dễ theme cyberpunk |
| **Framer Motion** | Page transitions, micro-animations | API đơn giản, performant, thay thế phần lớn GSAP cho UI thông thường |
| **GSAP + ScrollTrigger** | 3D camera scroll animations | Chuyên biệt cho animation phức tạp của Three.js |
| **Radix UI** (qua shadcn) | Accessibility primitives | Keyboard nav, ARIA tự động |
| **clsx + tailwind-merge** | Conditional class merging | Tránh class conflict khi dùng Tailwind dynamic |

### Ví dụ: GlassCard Component (shadcn + Tailwind)
```tsx
// components/ui/GlassCard.tsx
import { cn } from "@/lib/utils"

export function GlassCard({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-cyan-500/20",
        "bg-white/5 backdrop-blur-md",
        "shadow-[0_0_30px_rgba(0,212,255,0.05)]",
        "transition-all duration-300",
        "hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### Ví dụ: Framer Motion Page Transition
```tsx
// pages/DocumentPage.tsx
import { motion } from "framer-motion"

export function DocumentPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* content */}
    </motion.div>
  )
}
```

---

## 🗄️ Schema Database Hoàn chỉnh (Multi-user)

```sql
-- Người dùng
CREATE TABLE tb_users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- BCrypt hash
    role        VARCHAR(20) DEFAULT 'USER', -- USER | ADMIN
    avatar_url  VARCHAR(500),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens (để có thể revoke)
CREATE TABLE tb_refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES tb_users(id) ON DELETE CASCADE,
    token       VARCHAR(500) UNIQUE NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Tài liệu chính
CREATE TABLE tb_documents (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) UNIQUE NOT NULL,
    content         TEXT NOT NULL,          -- Markdown source
    content_html    TEXT,                   -- Rendered HTML (cache)
    summary         VARCHAR(1000),
    author_id       BIGINT REFERENCES tb_users(id),
    view_count      INT DEFAULT 0,
    is_published    BOOLEAN DEFAULT FALSE,
    is_pinned       BOOLEAN DEFAULT FALSE,
    -- Full-text search (PostgreSQL)
    search_vector   TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('simple', title || ' ' || coalesce(content, ''))
    ) STORED,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_docs_fts ON tb_documents USING GIN(search_vector);
CREATE INDEX idx_docs_author ON tb_documents(author_id);

-- Tags phân cấp với màu sắc cho Node 3D
CREATE TABLE tb_tags (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    color       VARCHAR(7) DEFAULT '#00d4ff',  -- Hex cho Node 3D
    icon        VARCHAR(50),
    parent_id   BIGINT REFERENCES tb_tags(id),
    node_x      FLOAT,  -- Tọa độ 3D (lưu để layout nhất quán)
    node_y      FLOAT,
    node_z      FLOAT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- N-N: Document ↔ Tag
CREATE TABLE tb_doc_tags (
    document_id BIGINT REFERENCES tb_documents(id) ON DELETE CASCADE,
    tag_id      BIGINT REFERENCES tb_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);

-- Knowledge Graph với Edge Weight và Relation Type
CREATE TABLE tb_knowledge_graph (
    id               BIGSERIAL PRIMARY KEY,
    source_id        BIGINT REFERENCES tb_documents(id) ON DELETE CASCADE,
    target_id        BIGINT REFERENCES tb_documents(id) ON DELETE CASCADE,
    relation_type    VARCHAR(50) NOT NULL,
    -- RELATED_TO | PREREQUISITE_OF | PART_OF | SEE_ALSO
    weight           FLOAT DEFAULT 1.0,
    is_bidirectional BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT NOW(),
    UNIQUE (source_id, target_id, relation_type)
);

-- Lịch sử đọc
CREATE TABLE tb_reading_history (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES tb_users(id),
    document_id  BIGINT REFERENCES tb_documents(id) ON DELETE CASCADE,
    read_at      TIMESTAMP DEFAULT NOW(),
    duration_sec INT
);

-- Bookmarks
CREATE TABLE tb_bookmarks (
    user_id      BIGINT REFERENCES tb_users(id),
    document_id  BIGINT REFERENCES tb_documents(id) ON DELETE CASCADE,
    created_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY  (user_id, document_id)
);
```

---

## 📁 Cấu trúc Project

### Backend
```
cyber-brain-backend/
├── src/main/java/com/cyberbrain/
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   ├── CorsConfig.java             # Cho phép Vercel domain
│   │   └── OpenApiConfig.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── DocumentController.java
│   │   ├── TagController.java
│   │   ├── SearchController.java
│   │   └── GraphController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── DocumentService.java
│   │   ├── TagService.java
│   │   ├── SearchService.java
│   │   ├── GraphService.java           # BFS/DFS + layout
│   │   └── MarkdownService.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── DocumentRepository.java
│   │   ├── TagRepository.java
│   │   ├── RefreshTokenRepository.java
│   │   └── KnowledgeGraphRepository.java
│   ├── entity/ (JPA Entities)
│   ├── dto/
│   │   ├── request/
│   │   └── response/
│   ├── mapper/                         # MapStruct interfaces
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthFilter.java
│   │   └── CustomUserDetailsService.java
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── ResourceNotFoundException.java
├── src/main/resources/
│   ├── db/migration/
│   │   ├── V1__init_schema.sql
│   │   └── V2__seed_sample_data.sql
│   └── application.yml                 # Env vars cho Railway
└── docker-compose.yml                  # Local dev
```

### Frontend
```
cyber-brain-frontend/
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── NexusScene.tsx          # R3F Canvas chính
│   │   │   ├── KnowledgeNode.tsx       # Sphere 3D mỗi tag
│   │   │   ├── NodeEdge.tsx            # Đường kết nối
│   │   │   ├── ParticleField.tsx       # Nền vũ trụ (stars)
│   │   │   └── CameraController.tsx    # GSAP ScrollTrigger
│   │   ├── editor/
│   │   │   ├── MarkdownEditor.tsx      # TipTap
│   │   │   └── CodeBlock.tsx           # Prism.js + Copy button
│   │   ├── search/
│   │   │   ├── CommandPalette.tsx      # Ctrl+K (dùng shadcn Dialog)
│   │   │   └── SearchResult.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   └── ui/                         # shadcn/ui generated components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── tooltip.tsx
│   │       └── GlassCard.tsx           # Custom cyberpunk card
│   ├── pages/
│   │   ├── NexusPage.tsx               # Homepage 3D
│   │   ├── DocumentPage.tsx
│   │   ├── EditorPage.tsx
│   │   ├── TagPage.tsx
│   │   └── AuthPage.tsx                # Login/Register
│   ├── store/ (Zustand)
│   │   ├── graphStore.ts
│   │   ├── documentStore.ts
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── hooks/
│   │   ├── useKeyboardShortcut.ts
│   │   ├── useGraphData.ts
│   │   └── useScrollCamera.ts
│   ├── services/
│   │   └── api.ts                      # Axios + interceptors (auto-refresh JWT)
│   └── lib/
│       └── utils.ts                    # cn() helper (clsx + tailwind-merge)
├── tailwind.config.ts                  # Custom cyberpunk theme
├── components.json                     # shadcn/ui config
└── vite.config.ts
```

---

## 🚀 Lộ Trình Chi Tiết (5 Phase)

### Phase 0: Foundation Setup *(~1 ngày)*

- [x] Tạo `docker-compose.yml` (PostgreSQL 16 + pgAdmin) — *cần cài Docker Desktop để chạy*
- [x] Khởi tạo Spring Boot (Spring Initializr): `Web, JPA, Security, Validation, Lombok, Liquibase` — thực tế là **Boot 4.1.0**, xem ghi chú dưới
- [x] Viết `V1__init_schema.sql` — toàn bộ schema multi-user (+ luôn cả `V2__seed_sample_data.sql`)
- [x] Khởi tạo `Vite + React + TypeScript` project
- [x] Setup shadcn/ui theo cấu trúc Zinc base + custom cyberpunk (`components.json` + `ui/button`, `GlassCard`, `NeonBadge`; CLI Tailwind-v4 không tương thích TW3 nên scaffolding thủ công)
- [x] Cấu hình `tailwind.config.ts` với cyberpunk color palette:
  ```ts
  colors: {
    neon: {
      cyan:   '#00d4ff',
      purple: '#8b5cf6',
      green:  '#39ff14',
      pink:   '#ff0080',
    },
    glass: {
      bg:     'rgba(255,255,255,0.05)',
      border: 'rgba(0,212,255,0.2)',
    }
  }
  ```
- [x] Setup Axios client với JWT auto-refresh interceptor (`src/services/api.ts`)
- [x] Cấu hình Render + Neon + Vercel project — *deploy thành công 16/08/2026 (backend Live trên Render, DB Neon đã migrate V1+V2, frontend trên Vercel)*

**✅ Deliverable (16/08/2026):** Backend compile pass (`./mvnw compile` → BUILD SUCCESS). Frontend build pass (`npm run build` → tsc + vite, Tailwind CSS sinh đúng). `docker-compose up` chờ Docker Desktop (máy chưa cài).

> [!NOTE]
> **Điều chỉnh phát sinh khi triển khai:**
> - **Spring Boot 4.1.0** thay vì 3.x: Boot 3.5 hết OSS support (06/2026), Initializr chỉ sinh ≥ 4.0 → kèm theo `spring-boot-starter-webmvc` (tên mới), Spring Security 7.x, SpringDoc 3.x.
> - **Java 17** thay vì 21: JDK trên máy là 17 (baseline Boot 4); nâng sau khi cài JDK 21 chỉ cần sửa `java.version`.
> - Migration SQL dùng định dạng **Liquibase formatted sql** (`--liquibase formatted sql` + `-- changeset` ở đầu mỗi file).
> - Seed data gồm admin (`admin` / `Admin@123`), 10 tags màu hex, 5 documents mẫu và edges Knowledge Graph.

---

### Phase 1: Core API Backend *(~3 ngày)*

#### 1.1 Authentication (Multi-user JWT)
- [x] `POST /api/auth/register` — BCrypt hash password, trả Access + Refresh token
- [x] `POST /api/auth/login` — Validate credentials, issue tokens
- [x] `POST /api/auth/refresh` — Validate Refresh token từ DB, issue Access token mới
- [x] `POST /api/auth/logout` — Revoke Refresh token (set `revoked=true`)
- [x] `JwtAuthFilter`: Intercept mọi request, validate Access Token, set SecurityContext
- [x] `ApiResponse<T>` wrapper: `{ status, data, message, timestamp }`

#### 1.2 Document CRUD
- [x] `POST /api/documents` — Tạo mới, auto-generate `slug`, render MD→HTML qua `flexmark-java`
- [x] `GET /api/documents?page&size&tag&sort` — Phân trang + filter
- [x] `GET /api/documents/{slug}` — Chi tiết, tăng `view_count`
- [x] `PUT /api/documents/{id}` — Chỉ author hoặc ADMIN
- [x] `DELETE /api/documents/{id}` — Soft delete (thêm `deleted_at`)
- [x] `PATCH /api/documents/{id}/publish` — Publish/Unpublish
- [x] `GET /api/documents/mine` — (thêm) tài liệu của tôi kèm draft

#### 1.3 Tag Management
- [x] CRUD Tags (`/api/tags`) — write ops yêu cầu ADMIN
- [x] `POST /api/documents/{id}/tags` — Gán tags vào document
- [x] `GET /api/tags/{slug}/documents` — Tài liệu theo tag

#### 1.4 Knowledge Graph API
- [x] `GET /api/graph` — Toàn bộ graph (nodes = tags với `node_x/y/z`, edges = quan hệ)
- [x] `GET /api/graph/document/{id}` — Subgraph (BFS depth=2) xung quanh 1 doc
- [x] `POST /api/graph/edges` — Tạo liên kết giữa 2 documents
- [x] Layout fallback fibonacci-sphere khi chưa có tọa độ + `PATCH /api/graph/layout` lưu tọa độ d3-force từ client

#### 1.5 Search
- [x] `GET /api/search?q=&tags=&limit=` — PostgreSQL FTS với snippet highlight (`ts_headline` + `<mark>`)
- [x] `GET /api/search/suggestions?q=` — Autocomplete (lấy title matching)

> Lưu ý: config `'simple'` khớp token **có dấu** (search "kiểm thử" match; "kiem thu" không). Phase 4 có thể thêm extension `unaccent` để khớp cả không dấu.

#### 1.6 User Profile
- [x] `GET /api/users/me` — Profile hiện tại
- [x] `GET /api/users/me/history` — Reading history
- [x] `GET /api/users/me/bookmarks` — Bookmarks
- [x] `POST /api/documents/{id}/bookmark` — Toggle bookmark

**✅ Deliverable (16/08/2026): Hoàn thành và đã verify end-to-end trên production Render + Neon** — 71 source files, 26 endpoints. Smoke test pass: register (201/409 trùng), login seed admin, JWT filter (401 không token), tạo document (auto-slug tiếng Việt + flexmark MD→HTML), FTS search "kiểm thử" với `<mark>` highlight, graph nodes có tọa độ + docCount, bookmark toggle. Swagger UI: `https://cyber-brain-api.onrender.com/swagger-ui.html`.

---

### Phase 2: Frontend — Standard UI *(~3 ngày)*

#### 2.1 Design System (Tailwind + shadcn/ui)
- [x] shadcn-style components: `button`, `dialog`, `input`, `badge`, `tooltip`, `dropdown-menu`, `separator`, `sheet`, `skeleton`, `popover`, `command` (cmdk)
- [x] Custom `GlassCard.tsx` (Tailwind + backdrop-blur)
- [x] Custom `NeonBadge.tsx` (tag badges với màu hex từ API)
- [x] Import fonts: Inter + JetBrains Mono qua `@fontsource`
- [x] AnimatePresence wrapper (Framer Motion) ở root cho page transitions

#### 2.2 Auth Flow
- [x] `AuthPage.tsx`: Login/Register form với shadcn/ui `Input`, `Button`
- [x] `authStore.ts` (Zustand): Lưu Access Token, user info, auto-logout khi expired (event `cb:unauthorized`)
- [x] Protected routes với `PrivateRoute` component

#### 2.3 Layout & Navigation
- [x] `AppShell.tsx`: Sidebar (left) + TopBar + Main content
- [x] `Sidebar.tsx`: Tags với màu, badge số lượng doc (tree phân cấp để Phase 3)
- [x] `TopBar.tsx`: Logo + Ctrl+K hint + User avatar dropdown (shadcn DropdownMenu)
- [x] Framer Motion sidebar collapse animation

#### 2.4 Document Reader
- [x] Render `content_html` với Tailwind Typography (`@tailwindcss/typography`)
- [x] `CodeBlock`: Prism.js highlight + nút Copy với hiệu ứng LED xanh khi copy xong
- [x] Table of Contents auto-generated từ H1-H4 + scrollspy
- [x] "Reading progress" indicator (thanh gradient neon trên cùng, spring animation)

#### 2.5 Markdown Editor (TipTap)
- [x] Editor layout 2 cột (split view): Editor | Preview
- [x] TipTap extensions: `StarterKit`, `CodeBlockLowlight` (lowlight), `Image`, `Table` family, `Placeholder`, `tiptap-markdown` (xuất Markdown vì backend lưu MD)
- [x] Tag picker: Combobox (Popover + Command) gán/bỏ tags
- [x] Auto-save (debounce 2s) với Framer Motion "Saving.../Đã lưu" indicator
- [x] Publish/Draft toggle

#### 2.6 Command Palette (Ctrl+K)
- [x] `Dialog` + Command (cmdk) với animation scale-in, backdrop blur
- [x] Debounce 300ms → gọi `/api/search`
- [x] Kết quả nhóm "Tài liệu" + "Tags", highlight từ khóa qua `<mark>` của ts_headline
- [x] Điều hướng ↑↓ + Enter bằng keyboard (cmdk xử lý native)

**✅ Deliverable (16/08/2026): Hoàn thành** — ứng dụng đọc/viết/tìm kiếm đầy đủ trên API thật: 7 trang (Auth, Nexus, Documents, Document reader, Tag, Mine, Editor), build pass `tsc -b && vite build` (419KB gzip), page transitions + micro-animations toàn cục. **Lưu ý khi dùng production: set `VITE_API_URL` trên Vercel + `CORS_ALLOWED_ORIGINS` trên Render (xem README/DEPLOYMENT).**

---

### Phase 2.5: Data Layer for 3D *(~1 ngày)* — ✅ HOÀN THÀNH 16/08/2026

- [x] `graphStore.ts`: Fetch `GET /api/graph`, normalize thành `{ nodes: Node3D[], edges: Edge3D[] }`
- [x] Tích hợp `d3-force-3d` (biến thể 3 chiều của d3-force) tính tọa độ `(x, y, z)` — seed từ tọa độ server, 120 iterations, deterministic
- [x] Gọi `PATCH /api/graph/layout` để lưu tọa độ vào DB (nhất quán giữa sessions, fire-and-forget)
- [x] Helper: `getConnectedNodes(nodeId)`, `fetchDocumentSubgraph(docId, depth)` (gọi `GET /api/graph/document/{id}`)
- [x] Verify dữ liệu: render thẳng vào scene 3D thật (bỏ qua bước `<pre>` thủ công)

**✅ Deliverable:** `graphStore.nodes` có tọa độ `(x,y,z)` hợp lệ, sẵn sàng cho Three.js.

---

### Phase 3: The 3D Magic *(~4 ngày)* — ✅ HOÀN THÀNH 16/08/2026

#### 3.1 Scene Setup (R3F)
- [x] `NexusScene.tsx`: `<Canvas>` với `camera={{ fov: 60 }}`, `fog`, màu nền `#04060c`, `dpr` clamp [1, 1.5]
- [x] `ParticleField.tsx`: 3000 particles (mobile 1200) dùng `Points` + `BufferGeometry`, additive blending cyan/purple
- [x] Post-processing: `Bloom` (glow neon, mipmapBlur) + `Vignette` — *bỏ ChromaticAberration để tiết kiệm GPU gói free*
- [x] Ambient + Point lights cyan/purple (decay theo khoảng cách)

#### 3.2 Knowledge Nodes
- [x] `KnowledgeNode.tsx`: `SphereGeometry` + `MeshStandardMaterial` emissive từ `tag.color`, bán kính theo docCount
- [x] Hover: spring scale + tăng emissive bằng `@react-spring/three`
- [x] Hover: PointLight màu tag bật sáng quanh node
- [x] Nhãn node bằng `Html` (Drei) — tên + số doc khi hover, pointer-events none
- [x] Click node: GSAP camera fly-to (1.2s power2.inOut, cập nhật cả OrbitControls target) + `Sheet` phải chứa tài liệu của tag, click tài liệu → navigate `/doc/:slug`; click nền = bỏ chọn (`onPointerMissed`)

#### 3.3 Node Edges
- [x] `NodeEdge.tsx`: `Line` từ Drei, mặc định opacity 0.16
- [x] Hover/select node: `useFrame` damp opacity edges liên quan lên 0.8, còn lại mờ
- [x] Line width theo `weight`; edge `PREREQUISITE_OF` nét đứt

#### 3.4 Camera & Scroll (GSAP)
- [x] Intro: camera bay từ `[0, 26, 165]` vào `[0, 0, 95]` (2.4s power2.out)
- [x] Click node: `gsap.to(camera.position)` + `controls.target`
- [x] Điều hướng zoom bằng OrbitControls (enableDamping) thay ScrollTrigger page-scroll vì homepage là canvas full-screen không có page scroll — *chủ đích thay đổi cho hợp bối cảnh*
- [x] Transition sang DocumentPage qua NodeDetailSheet

#### 3.5 Responsive 3D
- [x] Giảm particles trên mobile (detect `window.innerWidth < 768` → 1200)
- [x] Touch: OrbitControls hỗ trợ native (xoay 1 ngón, pinch zoom) — không cần thêm `@use-gesture`

**✅ Deliverable (16/08/2026):** Homepage là vũ trụ 3D cyberpunk hoàn chỉnh: bụi sao additive, node phát sáng theo màu tag, edges theo weight, Bloom + Vignette, camera intro/fly-to GSAP. Three.js tách lazy chunk riêng (`NexusScene-*.js` ~294KB gzip) không ảnh hưởng bundle chính. Build pass `tsc + vite`.

---

### Phase 4: Polish & Production *(~2 ngày)*

#### 4.1 Performance Optimization
- [ ] R3F: `instancedMesh` nếu > 50 nodes để giảm draw calls
- [ ] `React.lazy` + `Suspense` cho DocumentPage, EditorPage
- [ ] Backend: Response caching headers (`Cache-Control: max-age=60`) cho GET APIs
- [ ] Vite bundle analysis: `rollup-plugin-visualizer` → xử lý chunk lớn
- [ ] Lighthouse score target ≥ 90

#### 4.2 Sound FX (Howler.js)
- [ ] Hover node: subtle electronic beep
- [ ] Click node: chime / swoosh
- [ ] Search open: sci-fi activation sound
- [ ] Mute toggle trong TopBar (lưu preference vào localStorage)

#### 4.3 UX Enhancements
- [ ] shadcn `Skeleton` loading cho DocumentPage và 3D loading
- [ ] Empty states với cyberpunk illustrations
- [ ] Framer Motion `AnimatePresence` cho toast notifications
- [ ] Error boundary với UI thân thiện
- [ ] Keyboard shortcuts hoàn chỉnh: `Ctrl+K`, `Ctrl+N`, `Escape`

#### 4.4 Cloud Deployment Checklist
- [ ] Backend: `application.yml` đọc env vars (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`)
- [ ] Render: Set env vars (`DATABASE_URL` từ Neon, `JWT_SECRET`, `JWT_REFRESH_SECRET`), auto-deploy từ GitHub `main`
- [ ] Frontend: `VITE_API_URL` trỏ vào Render URL
- [ ] Vercel: Set env vars, enable auto-deploy
- [ ] CORS: Backend whitelist Vercel production domain
- [ ] GitHub Actions: CI pipeline (lint → build → test) trước khi merge

**✅ Deliverable:** Production live trên Railway + Vercel, performance tốt, UX hoàn chỉnh.

---

## 📊 Tổng Thời Gian Ước Lượng

| Phase | Nội dung | Thời gian |
|:---|:---:|:---:|
| Phase 0 | Foundation Setup | 1 ngày |
| Phase 1 | Core API Backend | 3 ngày |
| Phase 2 | Standard UI Frontend | 3 ngày |
| Phase 2.5 | Data Layer for 3D | 1 ngày |
| Phase 3 | 3D Magic | 4 ngày |
| Phase 4 | Polish & Production | 2 ngày |
| **Tổng** | | **~14 ngày** |

> [!TIP]
> **MVP nhanh (không 3D):** Dừng sau Phase 2 → ~7 ngày, đã có hệ thống hoàn toàn dùng được và deploy cloud.

---

## 🛠️ Tech Stack Đầy Đủ

### Backend
| Công nghệ | Version | Mục đích |
|:---|:---:|:---|
| Java | 17 LTS | Ngôn ngữ chính |
| Spring Boot | 4.1.x | Framework |
| Spring Security | 7.x | Authentication/Authorization |
| JJWT | 0.12.x | JWT library |
| Spring Data JPA | 3.x | ORM |
| PostgreSQL | 16 | Database + Full-Text Search |
| Liquibase | 4.x | DB schema migration |
| flexmark-java | 0.64.x | Markdown → HTML |
| MapStruct | 1.5.x | DTO mapping |
| Lombok | latest | Boilerplate reduction |
| SpringDoc OpenAPI | 3.x | Swagger UI |

### Frontend
| Công nghệ | Version | Mục đích |
|:---|:---:|:---|
| React | 18 | UI Framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| **Tailwind CSS** | **3.x** | **Utility-first styling** |
| **shadcn/ui** | **latest** | **Headless UI components** |
| **Framer Motion** | **11.x** | **UI animations & transitions** |
| React Three Fiber | 8.x | 3D rendering |
| @react-three/drei | 9.x | 3D helpers |
| @react-three/postprocessing | 2.x | Bloom, Aberration effects |
| @react-spring/three | 9.x | Spring animations cho 3D objects |
| GSAP + ScrollTrigger | 3.x | Camera scroll animation |
| Zustand | 4.x | State management |
| TipTap | 2.x | Rich text editor |
| Prism.js | 1.x | Syntax highlighting |
| Axios | 1.x | HTTP client |
| React Router | 6.x | Routing |
| d3-force | 3.x | Force-directed graph layout |
| Howler.js | 2.x | Sound effects |
| @use-gesture/react | 10.x | Touch/gesture support |
| clsx + tailwind-merge | latest | Safe class merging |
| @fontsource/inter | latest | Self-hosted fonts |

### DevOps & Deploy
| Công nghệ | Mục đích |
|:---|:---|
| Docker + Docker Compose | Local development environment |
| Render | Backend API hosting (free tier) |
| Neon | PostgreSQL hosting (free tier) |
| Vercel | Frontend SPA hosting (free tier) |
| GitHub Actions | CI pipeline (lint → build → test) |
