# 🧠 CYBER-BRAIN

Hệ thống "Second Brain" **multi-user** — backend Java Spring Boot + frontend React/Three.js, giao diện cyberpunk.

> Kế hoạch chi tiết: xem [`implementation_plan.md`](./implementation_plan.md)

## Cấu trúc

```
Knowledge-Managememt/
├── implementation_plan.md        # Kế hoạch triển khai 5 phase
├── cyber-brain-backend/          # Spring Boot 4.1 + PostgreSQL 16 + Liquibase
│   ├── docker-compose.yml        # PostgreSQL + pgAdmin (local dev)
│   ├── Dockerfile                # Build image cho Railway
│   └── src/main/resources/db/    # Migrations: V1 schema + V2 seed data
└── cyber-brain-frontend/         # Vite 5 + React 18 + TS + Tailwind 3 + shadcn-style UI
    ├── components.json           # Cấu hình shadcn/ui (thêm component: npx shadcn@latest add ...)
    └── src/services/api.ts       # Axios + JWT auto-refresh interceptor
```

## Trạng thái Phase 0 — Foundation Setup

| Hạng mục | Trạng thái |
|:---|:---|
| docker-compose (PostgreSQL 16 + pgAdmin) | ✅ Viết xong — **cần cài Docker Desktop để chạy** (máy chưa có) |
| Spring Boot project + Liquibase migrations | ✅ Compile pass (`BUILD SUCCESS`) |
| Vite + React + TS + Tailwind + shadcn-style | ✅ Build pass (`tsc -b && vite build`) |
| Axios client + JWT auto-refresh | ✅ |
| Railway + Vercel | ⏳ Cần thao tác thủ công trên web (xem bên dưới) |

## Yêu cầu môi trường

- **JDK 17** (đã có trên máy) — Boot 4 baseline là Java 17
- **Node 20+** (máy đang có Node 22)
- **Docker Desktop** — *chưa cài*; cần để chạy PostgreSQL local: <https://www.docker.com/products/docker-desktop/>

## Chạy local

```bash
# 1. Database (sau khi cài Docker Desktop)
cd cyber-brain-backend
docker compose up -d          # PostgreSQL :5432 + pgAdmin :5050

# 2. Backend (tự chạy Liquibase migration khi khởi động)
./mvnw spring-boot:run        # API tại http://localhost:8080

# 3. Frontend
cd ../cyber-brain-frontend
npm install                   # lần đầu
npm run dev                   # http://localhost:5173
```

pgAdmin: `http://localhost:5050` — đăng nhập `admin@cyberbrain.local` / `admin`.

**Tài khoản seed:** `admin` / `Admin@123` (role ADMIN, hash BCrypt trong `V2__seed_sample_data.sql`).

## Biến môi trường

Backend (`cyber-brain-backend/.env.example`, Railway set tương tự):

| Biến | Mặc định dev | Ý nghĩa |
|:---|:---|:---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `localhost` / `5432` / `cyberbrain` | Kết nối PostgreSQL |
| `DB_USERNAME` / `DB_PASSWORD` | `cyberbrain` / `cyberbrain_secret` | Xác thực DB |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | dev-only | **Bắt buộc đổi khi deploy** (chuỗi ≥ 32 ký tự ngẫu nhiên) |

Frontend (`cyber-brain-frontend/.env.example`):

| Biến | Mặc định dev | Ý nghĩa |
|:---|:---|:---|
| `VITE_API_URL` | `http://localhost:8080/api` | URL backend (đổi thành URL Railway khi production) |

## Deploy manual checklist (Railway + Vercel)

1. Push code lên GitHub repo (private hoặc public).
2. **Railway**: New Project → Deploy từ repo, root `cyber-brain-backend` (Railway tự nhận Dockerfile) → thêm PostgreSQL service → set env vars ở bảng trên (dùng `DATABASE_URL` public variables của Railway cho `DB_HOST/PORT/NAME/USERNAME/PASSWORD`).
3. **Vercel**: New Project → import cùng repo, root directory `cyber-brain-frontend`, framework preset **Vite** → set `VITE_API_URL` = URL Railway API (`https://...up.railway.app/api`).
4. Backend CORS sẽ whitelist domain Vercel ở Phase 1 (`CorsConfig.java`).

## Ghi chú kỹ thuật quan trọng

- **Spring Boot 4.1.0** thay cho 3.x trong kế hoạch gốc: Boot 3.5 đã hết OSS support (06/2026) và Spring Initializr không còn sinh project < 4.0. Kèm theo: `spring-boot-starter-webmvc` (tên mới), Spring Security 7, SpringDoc 3.x.
- **Java 17** thay cho 21: JDK hiện tại của máy; nâng `java.version` trong `pom.xml` lên 21 khi cài JDK mới (không cần sửa code).
- Migration SQL dạng **Liquibase formatted sql** — mọi file trong `db/migration/` phải bắt đầu bằng `--liquibase formatted sql` và `-- changeset <author>:<id>`.
- Thêm shadcn/ui component mới: `cd cyber-brain-frontend && npx shadcn@latest add dialog badge ...` (đã có `components.json`).
