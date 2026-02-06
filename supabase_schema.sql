
-- HostFlow CRM: Production Vault Schema
-- This table stores the entire application state as a JSONB blob per user.

-- Enable Row Level Security
ALTER DATABASE postgres SET "search_path" TO public, auth;

CREATE TABLE IF NOT EXISTS public.vaults (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    app_version TEXT NOT NULL DEFAULT 'v39',
    last_synced TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only view their own vault." 
    ON public.vaults FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own vault." 
    ON public.vaults FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own vault." 
    ON public.vaults FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vault_updated_at
    BEFORE UPDATE ON public.vaults
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
