-- 006_constitution_fixes.sql
-- Constitution of India, Amendment Acts, Law History, and Verified Sources Schema Fixes
-- Recreates and upgrades tables previously initialized by 005_constitution.sql.
-- Note: Tables in 005 were empty, so dropping and recreating them guarantees a clean, pristine schema
-- matching the frontend Law History contracts and Part B specifications.

-- 1. Drop existing empty tables in reverse dependency order
DROP TABLE IF EXISTS public.law_history_entries CASCADE;
DROP TABLE IF EXISTS public.amendment_reasons CASCADE;
DROP TABLE IF EXISTS public.amendment_sections CASCADE;
DROP TABLE IF EXISTS public.amendment_acts CASCADE;
DROP TABLE IF EXISTS public.constitution_provisions CASCADE;
DROP TABLE IF EXISTS public.ingest_runs CASCADE;
DROP TABLE IF EXISTS public.source_documents CASCADE;

-- 2. Source Documents (PDF catalog & verification tracking)
CREATE TABLE public.source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL CHECK (kind IN ('constitution', 'amendment_act', 'statement_of_objects_and_reasons', 'preamble', 'other')),
    amendment_number INT,
    official_url TEXT,
    sha256 TEXT NOT NULL,
    page_count INT NOT NULL DEFAULT 0,
    extraction_type TEXT NOT NULL DEFAULT 'text' CHECK (extraction_type IN ('text', 'ocr')),
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'flagged')),
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_source_docs_filepath ON public.source_documents(file_path);
CREATE INDEX idx_source_docs_sha256 ON public.source_documents(sha256);
CREATE INDEX idx_source_docs_kind ON public.source_documents(kind);
CREATE INDEX idx_source_docs_ver_status ON public.source_documents(verification_status);

-- 3. Constitution Provisions (parsed articles, preamble, schedules)
CREATE TABLE public.constitution_provisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind TEXT NOT NULL DEFAULT 'article' CHECK (kind IN ('preamble', 'article', 'schedule')),
    article_no TEXT NOT NULL,
    article_number TEXT,  -- alias for query compatibility
    clause_number TEXT,
    subclause_number TEXT,
    part_no TEXT,
    part_number TEXT,     -- alias for query compatibility
    part_title TEXT,
    chapter_title TEXT,
    heading TEXT NOT NULL DEFAULT '',
    body_raw TEXT NOT NULL,
    content TEXT,         -- alias for query compatibility
    footnotes JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    page_start INT NOT NULL DEFAULT 1,
    page_end INT NOT NULL DEFAULT 1,
    source_page INT NOT NULL DEFAULT 1,
    as_on_date DATE NOT NULL DEFAULT CURRENT_DATE,
    parse_flags TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'verified', 'published')),
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_on TIMESTAMPTZ,
    search_tsv TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_const_prov_article_no ON public.constitution_provisions(article_no);
CREATE INDEX idx_const_prov_article_num ON public.constitution_provisions(article_number);
CREATE INDEX idx_const_prov_part_no ON public.constitution_provisions(part_no);
CREATE INDEX idx_const_prov_status ON public.constitution_provisions(status);
CREATE INDEX idx_const_prov_search_tsv ON public.constitution_provisions USING GIN (search_tsv);

-- Maintain search_tsv via standard Postgres trigger
CREATE TRIGGER trg_const_prov_search_tsv
BEFORE INSERT OR UPDATE ON public.constitution_provisions
FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(search_tsv, 'pg_catalog.english', heading, body_raw);

-- Trigger to sync aliases (article_no <-> article_number, body_raw <-> content, part_no <-> part_number)
CREATE OR REPLACE FUNCTION public.sync_constitution_provision_fields()
RETURNS TRIGGER AS 
BEGIN
    IF NEW.article_no IS NULL OR NEW.article_no = '' THEN
        NEW.article_no := coalesce(NEW.article_number, '');
    END IF;
    IF NEW.article_number IS NULL OR NEW.article_number = '' THEN
        NEW.article_number := NEW.article_no;
    END IF;

    IF NEW.body_raw IS NULL OR NEW.body_raw = '' THEN
        NEW.body_raw := coalesce(NEW.content, '');
    END IF;
    IF NEW.content IS NULL OR NEW.content = '' THEN
        NEW.content := NEW.body_raw;
    END IF;

    IF NEW.part_no IS NULL OR NEW.part_no = '' THEN
        NEW.part_no := coalesce(NEW.part_number, '');
    END IF;
    IF NEW.part_number IS NULL OR NEW.part_number = '' THEN
        NEW.part_number := NEW.part_no;
    END IF;

    IF NEW.source_page IS NULL OR NEW.source_page = 1 THEN
        NEW.source_page := coalesce(NEW.page_start, 1);
    END IF;

    RETURN NEW;
END;
 LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_constitution_provisions
BEFORE INSERT OR UPDATE ON public.constitution_provisions
FOR EACH ROW
EXECUTE FUNCTION public.sync_constitution_provision_fields();

-- 4. Amendment Acts (1..106)
CREATE TABLE public.amendment_acts (
    number INT PRIMARY KEY,
    title TEXT NOT NULL,
    year INT NOT NULL,
    assent_date DATE,
    enacting_formula TEXT,
    commencement_notes TEXT,
    text_extracted TEXT,
    ocr BOOLEAN NOT NULL DEFAULT FALSE,
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'verified', 'published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amendment_acts_year ON public.amendment_acts(year);
CREATE INDEX idx_amendment_acts_status ON public.amendment_acts(status);

-- 4b. Amendment Sections (Operative sections of each Amendment Act)
CREATE TABLE public.amendment_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amendment_number INT NOT NULL REFERENCES public.amendment_acts(number) ON DELETE CASCADE,
    section_number TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    article_refs TEXT[] NOT NULL DEFAULT '{}',
    action_type TEXT NOT NULL CHECK (action_type IN ('amendment', 'insertion', 'substitution', 'omission', 'other')),
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    source_page INT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'verified', 'published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amendment_sections_num ON public.amendment_sections(amendment_number);
CREATE INDEX idx_amendment_sections_art_refs ON public.amendment_sections USING GIN (article_refs);
CREATE INDEX idx_amendment_sections_action ON public.amendment_sections(action_type);

-- 5. Amendment Reasons (Statements of Objects and Reasons)
CREATE TABLE public.amendment_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amendment_number INT NOT NULL REFERENCES public.amendment_acts(number) ON DELETE CASCADE,
    article_ref TEXT,
    topic TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'statement_of_objects_and_reasons' CHECK (kind IN ('statement_of_objects_and_reasons', 'other')),
    text TEXT NOT NULL,
    ocr BOOLEAN NOT NULL DEFAULT FALSE,
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    source_page INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'verified', 'published')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amendment_reasons_number ON public.amendment_reasons(amendment_number);
CREATE INDEX idx_amendment_reasons_art ON public.amendment_reasons(article_ref);
CREATE INDEX idx_amendment_reasons_status ON public.amendment_reasons(status);

-- 6. Law History Entries (Strictly verified history matching frontend LawHistoryEntry)
CREATE TABLE public.law_history_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    provision_id UUID REFERENCES public.constitution_provisions(id) ON DELETE CASCADE,
    article_ref TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('original', 'amended', 'inserted', 'omitted', 'replaced', 'proposed', 'substituted')),
    effective_date TEXT NOT NULL DEFAULT '',
    when_changed TEXT,               -- alias for compatibility
    what_changed TEXT NOT NULL DEFAULT '',
    old_text TEXT,
    older_law_text TEXT,             -- alias for compatibility
    new_text TEXT,
    reason TEXT NOT NULL DEFAULT '',
    why_changed TEXT,                -- alias for compatibility
    reason_candidate TEXT,           -- verbatim excerpt from SOR (reviewer only)
    reason_source TEXT,
    changed_by TEXT NOT NULL DEFAULT 'Parliament of India',
    who_changed TEXT,                -- alias for compatibility
    authority TEXT NOT NULL DEFAULT 'Parliament of India',
    source_label TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    official_source_url TEXT,        -- alias for compatibility
    verified_on DATE,
    amendment_number INT REFERENCES public.amendment_acts(number) ON DELETE SET NULL,
    footnote_ref TEXT,               -- evidence footnote
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    source_page INT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'verified', 'published')),
    published BOOLEAN NOT NULL DEFAULT FALSE,
    flags TEXT[] NOT NULL DEFAULT '{}',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Strict CHECK constraint: published entries MUST be complete and properly formatted
    CONSTRAINT check_published_entry_complete CHECK (
        status != 'published' OR (
            source_document_id IS NOT NULL AND
            what_changed <> '' AND
            reason <> '' AND
            reason_source IS NOT NULL AND reason_source <> '' AND
            changed_by <> '' AND
            authority <> '' AND
            source_label <> '' AND
            source_url LIKE 'https://%' AND
            effective_date ~ '^\d{4}(-\d{2}(-\d{2})?)?$' AND
            verified_on IS NOT NULL
        )
    )
);

CREATE INDEX idx_law_hist_art ON public.law_history_entries(article_ref);
CREATE INDEX idx_law_hist_prov_id ON public.law_history_entries(provision_id);
CREATE INDEX idx_law_hist_status ON public.law_history_entries(status);
CREATE INDEX idx_law_hist_pub ON public.law_history_entries(published);
CREATE INDEX idx_law_hist_amd_num ON public.law_history_entries(amendment_number);

-- Trigger to synchronize compatibility aliases and status <-> published flag
CREATE OR REPLACE FUNCTION public.sync_law_history_entry_fields()
RETURNS TRIGGER AS 
BEGIN
    -- Sync what_changed <-> why_changed
    IF NEW.what_changed IS NULL OR NEW.what_changed = '' THEN
        NEW.what_changed := coalesce(NEW.why_changed, '');
    END IF;
    IF NEW.why_changed IS NULL OR NEW.why_changed = '' THEN
        NEW.why_changed := NEW.what_changed;
    END IF;

    -- Sync effective_date <-> when_changed
    IF NEW.effective_date IS NULL OR NEW.effective_date = '' THEN
        NEW.effective_date := coalesce(NEW.when_changed, '');
    END IF;
    IF NEW.when_changed IS NULL OR NEW.when_changed = '' THEN
        NEW.when_changed := NEW.effective_date;
    END IF;

    -- Sync changed_by <-> who_changed
    IF NEW.changed_by IS NULL OR NEW.changed_by = '' THEN
        NEW.changed_by := coalesce(NEW.who_changed, 'Parliament of India');
    END IF;
    IF NEW.who_changed IS NULL OR NEW.who_changed = '' THEN
        NEW.who_changed := NEW.changed_by;
    END IF;

    -- Sync old_text <-> older_law_text
    IF NEW.old_text IS NULL OR NEW.old_text = '' THEN
        NEW.old_text := NEW.older_law_text;
    END IF;
    IF NEW.older_law_text IS NULL OR NEW.older_law_text = '' THEN
        NEW.older_law_text := NEW.old_text;
    END IF;

    -- Sync source_url <-> official_source_url
    IF NEW.source_url IS NULL OR NEW.source_url = '' THEN
        NEW.source_url := coalesce(NEW.official_source_url, '');
    END IF;
    IF NEW.official_source_url IS NULL OR NEW.official_source_url = '' THEN
        NEW.official_source_url := NEW.source_url;
    END IF;

    IF NEW.reason IS NULL OR NEW.reason = '' THEN
        NEW.reason := coalesce(NEW.why_changed, NEW.what_changed, '');
    END IF;

    -- Sync status <-> published flag
    IF NEW.published = TRUE AND NEW.status = 'draft' THEN
        NEW.status := 'published';
    ELSIF NEW.status = 'published' THEN
        NEW.published := TRUE;
    ELSE
        NEW.published := FALSE;
    END IF;

    RETURN NEW;
END;
 LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_law_history_entries
BEFORE INSERT OR UPDATE ON public.law_history_entries
FOR EACH ROW
EXECUTE FUNCTION public.sync_law_history_entry_fields();

-- Trigger to verify source document is verified before publishing an entry
CREATE OR REPLACE FUNCTION public.check_law_history_published_source()
RETURNS TRIGGER AS 
DECLARE
    v_source_status TEXT;
BEGIN
    IF NEW.status = 'published' THEN
        IF NEW.source_document_id IS NULL THEN
            RAISE EXCEPTION 'Cannot publish law_history_entry %: source_document_id is required', NEW.id;
        END IF;

        SELECT verification_status INTO v_source_status
        FROM public.source_documents
        WHERE id = NEW.source_document_id;

        IF v_source_status IS NULL OR v_source_status != 'verified' THEN
            RAISE EXCEPTION 'Cannot publish law_history_entry %: referenced source document % is not verified (current status: %)',
                NEW.id, NEW.source_document_id, coalesce(v_source_status, 'NOT FOUND');
        END IF;
    END IF;
    RETURN NEW;
END;
 LANGUAGE plpgsql;

CREATE TRIGGER trg_check_law_history_published_source
BEFORE INSERT OR UPDATE ON public.law_history_entries
FOR EACH ROW
EXECUTE FUNCTION public.check_law_history_published_source();

-- 7. Ingest Runs (Audit & telemetry for pipeline runs)
CREATE TABLE public.ingest_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_type TEXT NOT NULL,
    kind TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE SET NULL,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    report TEXT,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ingest_runs_status ON public.ingest_runs(status);
CREATE INDEX idx_ingest_runs_type ON public.ingest_runs(run_type);

-- 8. Add article_refs to constitution_topics if table exists
DO 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'constitution_topics'
    ) THEN
        ALTER TABLE public.constitution_topics ADD COLUMN IF NOT EXISTS article_refs TEXT[] NOT NULL DEFAULT '{}';
    END IF;
END ;

-- 9. Enable Row Level Security (RLS) on all tables (Deny by default for anon/authenticated)
ALTER TABLE public.source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constitution_provisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendment_acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendment_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_history_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingest_runs ENABLE ROW LEVEL SECURITY;
