--liquibase formatted sql

-- changeset cyberbrain:001-init-schema splitStatements:false
-- splitStatements:false: gửi nguyên file as-is, giữ khối dollar-quote $$...$$ của plpgsql
-- CYBER-BRAIN — V1: Multi-user schema (users, auth, docs, tags, graph)
-- =====================================================================

-- Người dùng
CREATE TABLE tb_users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,            -- BCrypt hash
    role        VARCHAR(20)  DEFAULT 'USER',      -- USER | ADMIN
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
CREATE INDEX idx_refresh_tokens_user ON tb_refresh_tokens(user_id);

-- Tài liệu chính
CREATE TABLE tb_documents (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) UNIQUE NOT NULL,
    content         TEXT NOT NULL,                -- Markdown source
    content_html    TEXT,                         -- Rendered HTML (cache)
    summary         VARCHAR(1000),
    author_id       BIGINT REFERENCES tb_users(id),
    view_count      INT DEFAULT 0,
    is_published    BOOLEAN DEFAULT FALSE,
    is_pinned       BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMP,                    -- Soft delete
    search_vector   TSVECTOR GENERATED ALWAYS AS (
                    to_tsvector('simple'::regconfig, title || ' ' || coalesce(content, ''))
                ) STORED,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_docs_fts    ON tb_documents USING GIN(search_vector);
CREATE INDEX idx_docs_author ON tb_documents(author_id);

-- Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON tb_documents
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Tags phân cấp với màu sắc cho Node 3D
CREATE TABLE tb_tags (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    color       VARCHAR(7) DEFAULT '#00d4ff',     -- Hex cho Node 3D
    icon        VARCHAR(50),
    parent_id   BIGINT REFERENCES tb_tags(id),
    node_x      FLOAT,                            -- Tọa độ 3D (layout nhất quán)
    node_y      FLOAT,
    node_z      FLOAT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- N-N: Document <-> Tag
CREATE TABLE tb_doc_tags (
    document_id BIGINT REFERENCES tb_documents(id) ON DELETE CASCADE,
    tag_id      BIGINT REFERENCES tb_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);
CREATE INDEX idx_doc_tags_tag ON tb_doc_tags(tag_id);

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
CREATE INDEX idx_graph_source ON tb_knowledge_graph(source_id);
CREATE INDEX idx_graph_target ON tb_knowledge_graph(target_id);

-- Lịch sử đọc
CREATE TABLE tb_reading_history (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES tb_users(id),
    document_id  BIGINT REFERENCES tb_documents(id) ON DELETE CASCADE,
    read_at      TIMESTAMP DEFAULT NOW(),
    duration_sec INT
);
CREATE INDEX idx_history_user ON tb_reading_history(user_id);

-- Bookmarks
CREATE TABLE tb_bookmarks (
    user_id      BIGINT REFERENCES tb_users(id),
    document_id  BIGINT REFERENCES tb_documents(id) ON DELETE CASCADE,
    created_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY  (user_id, document_id)
);
