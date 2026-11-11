-- ============================================================================
-- 003_functions.sql: Automated triggers and helper functions
-- ============================================================================

-- Function to handle new user signup from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_name TEXT;
    base_code TEXT;
    rand_suffix TEXT;
    final_referral TEXT;
BEGIN
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    
    -- Generate unique uppercase referral code (e.g. MAY2026X4A)
    base_code := UPPER(REGEXP_REPLACE(user_name, '[^A-Za-z]', '', 'g'));
    IF LENGTH(base_code) < 3 THEN
        base_code := 'SAM';
    ELSE
        base_code := SUBSTRING(base_code FROM 1 FOR 4);
    END IF;
    rand_suffix := UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 4));
    final_referral := base_code || TO_CHAR(NOW(), 'YYYY') || rand_suffix;

    -- Create profile
    INSERT INTO public.profiles (id, email, name, role, status, referral_code)
    VALUES (NEW.id, NEW.email, user_name, 'learner', 'Active', final_referral)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = CASE WHEN profiles.name = '' THEN EXCLUDED.name ELSE profiles.name END;

    -- Create settings
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create progress
    INSERT INTO public.user_progress (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create default free subscription
    INSERT INTO public.subscriptions (user_id, tier, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Trigger firing on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
