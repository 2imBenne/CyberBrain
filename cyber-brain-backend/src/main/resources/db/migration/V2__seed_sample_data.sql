--liquibase formatted sql

-- changeset cyberbrain:002-seed-sample-data

-- =====================================================================
-- CYBER-BRAIN — V2: Seed sample data (admin, tags, documents, graph)
-- Login admin: admin / Admin@123
-- =====================================================================

-- Admin user
INSERT INTO tb_users (id, username, email, password, role, created_at) VALUES
(1, 'admin', 'admin@cyberbrain.local', '$2b$10$MX8eRP3Ry4/r6fJfc28OS.sv0HA6qeryZ4BwLUkGQBvpu6x2yHfDy', 'ADMIN', NOW());
SELECT setval(pg_get_serial_sequence('tb_users', 'id'), (SELECT MAX(id) FROM tb_users));

-- Tags (màu hex dùng cho Node 3D)
INSERT INTO tb_tags (id, name, slug, color, icon, created_at) VALUES
(1,  'Artificial Intelligence', 'artificial-intelligence', '#00d4ff', 'brain',      NOW()),
(2,  'Machine Learning',         'machine-learning',        '#8b5cf6', 'cpu',        NOW()),
(3,  'Deep Learning',            'deep-learning',           '#39ff14', 'network',    NOW()),
(4,  'Backend',                  'backend',                 '#ff0080', 'server',     NOW()),
(5,  'Java',                     'java',                    '#f89820', 'coffee',     NOW()),
(6,  'Spring Boot',              'spring-boot',             '#6db33f', 'leaf',       NOW()),
(7,  'Frontend',                 'frontend',                '#61dafb', 'layout',     NOW()),
(8,  'React',                    'react',                   '#61dafb', 'atom',       NOW()),
(9,  'Three.js',                 'three-js',                '#ffffff', 'box',        NOW()),
(10, 'Algorithms',               'algorithms',              '#ffd700', 'git-branch', NOW());
SELECT setval(pg_get_serial_sequence('tb_tags', 'id'), (SELECT MAX(id) FROM tb_tags));

-- Sample documents (Markdown source; content_html sẽ do backend render ở Phase 1)
INSERT INTO tb_documents (id, title, slug, content, summary, author_id, is_published, created_at, updated_at) VALUES
(1, 'Neural Networks là gì?',
    'neural-networks-la-gi',
    E'# Neural Networks là gì?\n\nNeural network là mô hình toán học lấy cảm hứng từ **não bộ con người**, gồm nhiều lớp neuron kết nối với nhau.\n\n## Thành phần chính\n\n- **Input layer**: nhận dữ liệu đầu vào\n- **Hidden layers**: trích xuất đặc trưng\n- **Output layer**: đưa ra dự đoán\n\n> Mỗi connection có một *weight* — chính là thứ mô hình học được trong quá trình training.\n\n## Hàm kích hoạt\n\n```python\nimport numpy as np\n\ndef relu(x):\n    return np.maximum(0, x)\n```\n',
    'Tổng quan về mạng neuron nhân tạo: lớp, weight, hàm kích hoạt và cách chúng học.',
    1, TRUE, NOW(), NOW()),

(2, 'Spring Security với JWT',
    'spring-security-voi-jwt',
    E'# Spring Security với JWT\n\nKiến trúc **stateless auth** cho REST API sử dụng Access Token + Refresh Token.\n\n## Luồng chính\n\n1. `POST /api/auth/login` -> nhận access token (15 phút) + refresh token (7 ngày)\n2. Gửi `Authorization: Bearer <token>` ở mỗi request\n3. Token hết hạn -> gọi `/api/auth/refresh`\n\n## JwtAuthFilter\n\n```java\noncePerRequestFilter -> parse token -> set SecurityContext\n```\n\n> Refresh token lưu DB để có thể **revoke** khi cần.\n',
    'Thiết lập authentication stateless với Spring Security 6 và JWT cho CYBER-BRAIN.',
    1, TRUE, NOW(), NOW()),

(3, 'React Three Fiber — Khởi đầu',
    'react-three-fiber-khoi-dau',
    E'# React Three Fiber\n\n**R3F** là React renderer cho Three.js — viết scene 3D như viết component React.\n\n## Canvas\n\n```tsx\n<Canvas camera={{ fov: 60, position: [0, 0, 80] }}>\n  <ambientLight intensity={0.5} />\n  <KnowledgeNode color="#00d4ff" />\n</Canvas>\n```\n\n## Vì sao chọn R3F?\n\n- Declarative scene graph\n- Tự nhiên với React ecosystem (hooks, state)\n- Drei helpers: `Line`, `Html`, `Stars`\n',
    'Nhập môn React Three Fiber: Canvas, declarative scene và helpers từ Drei.',
    1, TRUE, NOW(), NOW()),

(4, 'Force-Directed Graph trong 3D',
    'force-directed-graph-trong-3d',
    E'# Force-Directed Graph 3D\n\nDùng **d3-force** để tính tọa độ `(x, y, z)` cho knowledge graph trước khi render bằng Three.js.\n\n## Các lực chính\n\n- *Repulsion*: node đẩy nhau ra xa\n- *Spring*: edge kéo các node liên quan lại gần\n- *Centering*: giữ cluster không bay vô tận\n\n> Edge `weight` càng lớn thì spring càng mạnh — hai document liên quan chặt sẽ nằm gần nhau trong không gian 3D.\n',
    'Nguyên lý layout force-directed và cách áp dụng d3-force cho đồ tri thức 3D.',
    1, TRUE, NOW(), NOW()),

(5, 'REST API Design Best Practices',
    'rest-api-design-best-practices',
    E'# REST API Design Best Practices\n\nQuy ước thiết kế API cho CYBER-BRAIN.\n\n## Nguyên tắc\n\n- Resource ở số nhiều: `/api/documents`\n- Phân trang: `?page=1&size=20`\n- Response envelope thống nhất: `{ status, data, message, timestamp }`\n\n## Status codes\n\n| Code | Ý nghĩa |\n|---|---|\n| 200 | OK |\n| 201 | Created |\n| 401 | Chưa đăng nhập |\n| 403 | Không đủ quyền |\n',
    'Quy ước thiết kế REST API: resource naming, phân trang, envelope và status codes.',
    1, TRUE, NOW(), NOW());
SELECT setval(pg_get_serial_sequence('tb_documents', 'id'), (SELECT MAX(id) FROM tb_documents));

-- Document <-> Tag
INSERT INTO tb_doc_tags (document_id, tag_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5), (2, 6),
(3, 7), (3, 8), (3, 9),
(4, 1), (4, 9), (4, 10),
(5, 4), (5, 5);

-- Knowledge graph edges (giữa các documents)
INSERT INTO tb_knowledge_graph (source_id, target_id, relation_type, weight, is_bidirectional, created_at) VALUES
(1, 4, 'RELATED_TO',      0.8, TRUE,  NOW()),
(1, 3, 'SEE_ALSO',        0.5, TRUE,  NOW()),
(2, 5, 'PREREQUISITE_OF', 0.9, FALSE, NOW()),
(3, 4, 'RELATED_TO',      0.7, TRUE,  NOW()),
(2, 1, 'SEE_ALSO',        0.4, TRUE,  NOW());
SELECT setval(pg_get_serial_sequence('tb_knowledge_graph', 'id'), (SELECT MAX(id) FROM tb_knowledge_graph));
