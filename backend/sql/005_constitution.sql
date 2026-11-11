-- 005_constitution.sql
-- Constitution of India, Amendments, Law History, and Source Verification schema

-- 1. Source Documents (PDF catalog & verification tracking)
CREATE TABLE IF NOT EXISTS public.source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL CHECK (kind IN ('constitution', 'amendment_act', 'statement_of_objects_and_reasons', 'preamble', 'other')),
    amendment_number INT,
    official_url TEXT,
    sha256 TEXT NOT NULL,
    page_count INT NOT NULL,
    extraction_type TEXT NOT NULL CHECK (extraction_type IN ('text', 'ocr')),
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'flagged')),
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_docs_filepath ON public.source_documents(file_path);
CREATE INDEX IF NOT EXISTS idx_source_docs_sha256 ON public.source_documents(sha256);
CREATE INDEX IF NOT EXISTS idx_source_docs_kind ON public.source_documents(kind);

-- 2. Constitution Provisions (parsed articles, clauses, parts)
CREATE TABLE IF NOT EXISTS public.constitution_provisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_number TEXT NOT NULL,
    clause_number TEXT,
    subclause_number TEXT,
    title TEXT,
    content TEXT NOT NULL,
    part_number TEXT,
    part_title TEXT,
    source_document_id UUID NOT NULL REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    source_page INT NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_const_prov_article ON public.constitution_provisions(article_number);
CREATE INDEX IF NOT EXISTS idx_const_prov_part ON public.constitution_provisions(part_number);
CREATE INDEX IF NOT EXISTS idx_const_prov_current ON public.constitution_provisions(is_current);

-- 3. Amendment Acts (1..106)
CREATE TABLE IF NOT EXISTS public.amendment_acts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INT NOT NULL UNIQUE,
    year INT NOT NULL,
    title TEXT NOT NULL,
    assent_date DATE,
    enforcement_date TEXT,
    source_document_id UUID NOT NULL REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amendment_acts_number ON public.amendment_acts(number);

-- 3b. Amendment Sections (Individual sections of each Amendment Act)
CREATE TABLE IF NOT EXISTS public.amendment_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amendment_number INT NOT NULL REFERENCES public.amendment_acts(number) ON DELETE CASCADE,
    section_number TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    article_refs TEXT[] NOT NULL DEFAULT '{}',
    action_type TEXT NOT NULL CHECK (action_type IN ('amendment', 'insertion', 'substitution', 'omission', 'other')),
    source_document_id UUID REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    source_page INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amendment_sections_num ON public.amendment_sections(amendment_number);
CREATE INDEX IF NOT EXISTS idx_amendment_sections_art_refs ON public.amendment_sections USING GIN (article_refs);
CREATE INDEX IF NOT EXISTS idx_amendment_sections_action ON public.amendment_sections(action_type);

-- 4. Amendment Reasons (Statements of Objects and Reasons)
CREATE TABLE IF NOT EXISTS public.amendment_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amendment_number INT NOT NULL REFERENCES public.amendment_acts(number) ON DELETE CASCADE,
    article_ref TEXT,
    topic TEXT NOT NULL,
    statement_text TEXT NOT NULL,
    source_document_id UUID NOT NULL REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    source_page INT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amendment_reasons_number ON public.amendment_reasons(amendment_number);
CREATE INDEX IF NOT EXISTS idx_amendment_reasons_art ON public.amendment_reasons(article_ref);

-- 5. Law History Entries (Strictly verified history matching frontend law history card)
CREATE TABLE IF NOT EXISTS public.law_history_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_ref TEXT NOT NULL,
    older_law_text TEXT NOT NULL,
    when_changed TEXT NOT NULL,
    why_changed TEXT NOT NULL,
    who_changed TEXT NOT NULL,
    official_source_url TEXT NOT NULL,
    source_document_id UUID NOT NULL REFERENCES public.source_documents(id) ON DELETE RESTRICT,
    source_page INT NOT NULL,
    amendment_number INT REFERENCES public.amendment_acts(number) ON DELETE SET NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_published_requires_verified CHECK (published = FALSE OR source_document_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_law_hist_art ON public.law_history_entries(article_ref);
CREATE INDEX IF NOT EXISTS idx_law_hist_pub ON public.law_history_entries(published);

-- 6. Ingest Runs (Audit & telemetry for pipeline runs)
CREATE TABLE IF NOT EXISTS public.ingest_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Ensure constitution_topics has article_refs
ALTER TABLE public.constitution_topics ADD COLUMN IF NOT EXISTS article_refs TEXT[] NOT NULL DEFAULT '{}';

-- 7. Enable Row Level Security (RLS) on all tables with no public access policies
ALTER TABLE public.source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constitution_provisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendment_acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendment_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_history_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingest_runs ENABLE ROW LEVEL SECURITY;
