-- Auto-confirm emails on signup so username-based auth works without email verification.
-- This is safe because users only sign up with fake @betmoney.game emails (no real inbox).
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Confirm the email immediately so signUp returns a session
  NEW.email_confirmed_at := now();
  NEW.confirmed_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_email();
