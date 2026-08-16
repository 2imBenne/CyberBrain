# 🚀 Hướng dẫn Deploy Chi tiết — Neon + Render + Vercel

> **Làm đúng theo thứ tự** — mỗi bước cần thông tin từ bước trước:
> GitHub → **Neon** (lấy connection string) → **Render** (lấy URL API) → **Vercel** (trỏ vào URL API).
>
> Tổng thời gian: ~20-30 phút (chủ yếu là chờ build lần đầu của Render).

---

## Bước 0 — Đẩy code lên GitHub

Render và Vercel đều deploy từ GitHub repo, nên phải có repo trước. Mạng cá nhân/private repo đều dùng được gói free.

1. Tạo repo trên <https://github.com/new>: tên `cyber-brain`, chọn **Private**, **không** tick thêm README/.gitignore (đã có sẵn).
2. Mở Git Bash tại thư mục dự án và chạy:

```bash
cd /d/Knowledge-Managememt
git init
git add .
git commit -m "Phase 0: CYBER-BRAIN foundation (Spring Boot backend + React frontend)"
git branch -M main
git remote add origin https://github.com/<tên-bạn>/cyber-brain.git
git push -u origin main
```

> `.gitignore` ở root đã tự loại `node_modules/`, `target/`, `.env` — yên tâm không push nhầm gì cồng kềnh hay bí mật.

---

## Bước 1 — Neon (PostgreSQL, free)

1. Vào <https://neon.tech> → **Sign Up** → chọn **Continue with GitHub**.
2. Sau khi vào dashboard: **Create project** với:
   - **Name**: `cyber-brain`
   - **Postgres Version**: để mặc định (17)
   - **Region**: `Singapore (ap-southeast-1)` — gần Việt Nam nhất, độ trễ thấp
3. Ngay sau khi tạo xong, Neon hiện hộp thoại **Connect** với connection string. Nếu không thấy, bấm nút **Connect** ở góc trên phải dashboard (hoặc vào **Dashboard → project → Connection Details**).
4. Trong hộp thoại Connect, chọn dropdown **Pooled connection** (host sẽ chứa `-pooler`) — loại này an toàn hơn với giới hạn số kết nối đồng thời của gói free. Copy chuỗi dạng:

```
postgresql://neondb_owner:xxxxxxx@ep-cool-name-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

5. Lưu tạm chuỗi này vào notepad — sẽ dán vào Render ở bước 2. **Đây là mật khẩu database, đừng commit vào repo, đừng chia sẻ.**

**Đặc điểm gói free (đối chiếu thêm tại neon.tech/pricing vì có thể thay đổi):**
- ~0.5GB dung lượng — quá đủ cho hàng chục nghìn documents.
- Compute **tự ngủ sau ~5 phút** không có kết nối và **tự thức dậy trong ~1-3 giây** khi có request — trong suốt với người dùng.

---

## Bước 2 — Render (Backend API, free)

### 2.1 Tạo Web Service

1. Vào <https://render.com> → **Get Started** / **Sign Up** → **Continue with GitHub** → approve quyền truy cập (nên chọn *Only select repositories* → chỉ đánh dấu repo `cyber-brain`).
2. Dashboard → **New +** (góc trên phải) → **Web Service**.
3. Trong list repo, chọn `cyber-brain` → **Connect**.

### 2.2 Cấu hình (các ô quan trọng)

| Ô | Giá trị | Ghi chú |
|:---|:---|:---|
| **Name** | `cyber-brain-api` | Sẽ thành URL `https://cyber-brain-api.onrender.com` |
| **Region** | `Singapore (Southeast Asia)` | Cùng region với Neon |
| **Branch** | `main` | |
| **Root Directory** | `cyber-brain-backend` | ⚠️ **Bắt buộc đúng** — vì repo chứa cả backend + frontend |
| **Runtime** | `Docker` | Tự nhận từ Dockerfile; nếu không thì bấm chọn Docker |
| **Instance Type** | `Free` | 512MB RAM |

### 2.3 Environment Variables

Trong trang tạo (mục **Advanced** → *Add Environment Variable*) hoặc sau khi tạo ở tab **Environment**:

| Key | Value |
|:---|:---|
| `DATABASE_URL` | Chuỗi kết nối Neon copy ở Bước 1 |
| `JWT_SECRET` | Chuỗi ngẫu nhiên ≥ 32 ký tự (xem cách sinh bên dưới) |
| `JWT_REFRESH_SECRET` | Chuỗi ngẫu nhiên **khác** ≥ 32 ký tự |
| `JAVA_OPTS` | `-XX:MaxRAMPercentage=75.0` |

Sinh chuỗi ngẫu nhiên trong Git Bash (chạy 2 lần, lấy 2 chuỗi khác nhau):

```bash
openssl rand -base64 48 | tr -d '=+/'
```

### 2.4 Deploy & kiểm tra

1. Bấm **Create Web Service** (hoặc **Deploy Web Service**). Build lần đầu mất **5-15 phút** (phải tải toàn bộ Maven dependencies; các lần sau nhanh hơn nhờ Docker layer cache).
2. Mở tab **Events**/**Logs** và chờ:
   - Log Spring Boot chạy Liquibase: `Successfully applied changeSet...` (migration V1, V2 chạy vào Neon)
   - Dòng `Started CyberBrainBackendApplication in ... seconds`
   - Trạng thái service chuyển **Live** / `Successfully deployed`
3. Mở `https://cyber-brain-api.onrender.com/` trên trình duyệt:
   - Thấy **lỗi 401/404 hoặc trang lỗi trắng** của Spring Security → **chính xác** — mọi endpoint đang bị khóa vì chưa mở API công khai (Phase 1 sẽ có Swagger). Điều quan trọng là nó *phản hồi*, không phải treo.
4. Kiểm tra data đã vào Neon: dashboard Neon → tab **SQL Editor** → chạy:

```sql
SELECT username, role FROM tb_users;
SELECT title FROM tb_documents;
```

   → phải thấy `admin` và 5 documents seed.

**Từ giờ:** mỗi lần `git push` lên `main`, Render tự build + deploy lại (auto-deploy mặc định bật).

---

## Bước 3 — Vercel (Frontend, free)

1. Vào <https://vercel.com> → **Sign Up** → **Continue with GitHub**.
2. Dashboard → **Add New…** → **Project** → trong list repo tìm `cyber-brain` → **Import**.
3. Cấu hình:
   - **Framework Preset**: `Vite` (tự nhận; nếu không thì chọn tay)
   - **Root Directory**: bấm **Edit** → chọn `cyber-brain-frontend` ⚠️ **bắt buộc đúng**
   - Build Command / Output Directory: để mặc định (`npm run build`, `dist`)
4. Mục **Environment Variables** → thêm:

| Key | Value |
|:---|:---|
| `VITE_API_URL` | `https://cyber-brain-api.onrender.com/api` |

   Tick áp dụng cho **Production** (và Preview nếu muốn).

5. Bấm **Deploy** → ~1-2 phút.
6. Mở URL Vercel cấp (`https://cyber-brain.vercel.app`) → thấy trang landing **CYBER-BRAIN** với thẻ GlassCard, các NeonBadge và 2 nút neon → xong.

> Lưu ý: nếu sau này **sửa** environment variable trên Vercel, phải bấm **Redeploy** thì frontend mới nhận giá trị mới (env được nhúng lúc build).

---

## Bước 4 (tuỳ chọn) — Chống backend ngủ

Gói free của Render **ngủ sau 15 phút** không có request → lần gọi tiếp theo chờ ~30-60 giây khởi động lại (cold start). Muốn luôn thức:

1. Vào <https://cron-job.org> (free) → tạo account.
2. **Create Cronjob**:
   - **URL**: `https://cyber-brain-api.onrender.com/` (bất kỳ path nào cũng được, miễn trả về phản hồi)
   - **Schedule**: Every **10 minutes**
   - **Title**: `keep cyber-brain awake`
3. **Create** — xong. Mỗi 10 phút cron-job ping một phát, Render thấy "có hoạt động" và không ngủ.

---

## Xử lý sự cố thường gặp

| Triệu chứng | Nguyên nhân & cách xử lý |
|:---|:---|
| Render build fail, log có `Connection to ... refused` hoặc Liquibase lỗi | `DATABASE_URL` dán sai/sai một ký tự — copy lại từ Neon, đảm bảo còn `?sslmode=require`, không có xuống dòng/space thừa |
| Vào URL Render thấy 502 / quay lâu | Cold start — đợi 1-2 phút rồi refresh; xem tab Logs xác nhận đang restart |
| Mở URL Render xong không thấy gì ngoài lỗi 401/404 | **Bình thường** — Spring Security khóa hết; API công khai có từ Phase 1 |
| Frontend gọi API báo lỗi CORS trong console | Đã biết trước — Phase 1 thêm `CorsConfig.java` whitelist domain Vercel |
| Neon dashboard ghi `Suspended` | Bình thường với gói free — compute tự ngủ, tự thức khi có kết nối |
| Vercel deploy xong mà vẫn gọi localhost | Đổi `VITE_API_URL` xong chưa **Redeploy** |

---

## Tóm tắt kiến trúc sau khi xong

```
Trình duyệt ──> Vercel (React SPA, cyber-brain.vercel.app)
                    │  HTTPS
                    └──> Render (Spring Boot API, cyber-brain-api.onrender.com)
                              │  DATABASE_URL (sslmode=require)
                              └──> Neon (PostgreSQL, ap-southeast-1)

git push origin main ──> Render + Vercel tự build lại
```
