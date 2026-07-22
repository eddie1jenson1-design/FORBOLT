
-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 500,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base text; final text; n int := 0;
BEGIN
  base := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''), split_part(NEW.email, '@', 1), 'player');
  base := regexp_replace(base, '[^a-zA-Z0-9_]', '', 'g');
  IF length(base) = 0 THEN base := 'player'; END IF;
  final := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final) LOOP
    n := n + 1;
    final := base || n::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, balance) VALUES (NEW.id, final, 500);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ITEMS ============
CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text NOT NULL,
  description text NOT NULL
);
GRANT SELECT ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items viewable by authenticated" ON public.items FOR SELECT TO authenticated USING (true);

INSERT INTO public.items (name, emoji, description) VALUES
('Haunted Toaster', '🍞', 'Toast comes out slightly damp and whispers your name.'),
('Rubber Duck of Wisdom', '🦆', 'Answers all coding questions with silence.'),
('Left Sock, Slightly Warm', '🧦', 'Its twin is missing. Forever.'),
('Cursed Rubik''s Cube', '🧊', 'Solves itself when you look away.'),
('Half-Eaten Sandwich', '🥪', 'Bite marks match no known species.'),
('Traffic Cone (Emotional)', '🚧', 'Has seen things. Terrible things.'),
('Suspicious Beige Mug', '☕', 'Contents unknown. Do not sniff.'),
('Discount Time Machine', '⏰', 'Only goes backward 4 seconds.'),
('Slightly Bent Spoon', '🥄', 'Bent by a mediocre psychic.'),
('One (1) Grape', '🍇', 'Just the one. It''s a very good grape.'),
('Fake Moustache', '🥸', 'Fools nobody, delights everybody.'),
('Pigeon Named Kevin', '🐦', 'Refuses to fly. Loves oats.'),
('Expired Coupon Book', '🎟️', 'All coupons expired in 1998.'),
('Screaming Alarm Clock', '⏰', 'Only screams. No numbers.'),
('Broken Umbrella', '☂️', 'Opens inward. Attracts rain.'),
('Mystery Box', '📦', 'Rattles. Don''t open it.'),
('Novelty Mug That Lies', '☕', 'Says "World''s Best Dad" to everyone.'),
('Tiny Cowboy Hat', '🤠', 'Fits only on hamsters.'),
('Left-Handed Screwdriver', '🪛', 'A proud tool.'),
('Emotional Support Rock', '🪨', 'Never judges. Very heavy.'),
('Bag of Air (Premium)', '💨', 'Sourced from a mountaintop, allegedly.'),
('Toenail Clipping Collection', '💅', 'Curated over 15 years.'),
('Slightly Used Wig', '💇', 'Has its own opinions.'),
('Antique Doorknob', '🚪', 'Opens no doors you own.'),
('Suspiciously Damp Blanket', '🛏️', 'Has been like that since forever.'),
('Retired Mall Santa Beard', '🎅', 'Smells like cinnamon and regret.'),
('Bucket of Nothing', '🪣', 'Contains 100% pure nothing.'),
('Cursed Yo-Yo', '🪀', 'Comes back. Never leaves.'),
('Pre-Chewed Gum', '🍬', 'Flavour: unknown. Owner: multiple.'),
('Autographed Sock', '🧦', 'Signed by someone you don''t know.'),
('Jar of Awkward Silence', '🫙', 'Uncork at parties for chaos.'),
('Miniature Ladder', '🪜', 'Goes up two inches.'),
('Ghost Pepper Ice Cream', '🍦', 'Cold and hot. Regret guaranteed.'),
('Very Angry Houseplant', '🪴', 'Hisses when watered.'),
('Slightly Melted Crayon Pack', '🖍️', 'Every color is now "brownish".'),
('Foghorn (Battery Operated)', '📢', 'Neighbours will love it.'),
('Broken Compass', '🧭', 'Always points at you.'),
('One Ancient Chicken Nugget', '🍗', 'Older than most nations.'),
('Fake Winning Lottery Ticket', '🎫', 'Worth exactly zero dollars.'),
('Sock Full of Sand', '🏖️', 'Weapon? Toy? Yes.'),
('Unicycle (One Wheel Missing)', '🚲', 'Now just a stick.'),
('Chair That Sighs', '🪑', 'Sighs when sat on.'),
('Backpack of Regrets', '🎒', 'Heavy. Do not open.'),
('Ticking Suitcase', '💼', 'Definitely not a bomb.'),
('Bootleg Trophy', '🏆', 'Awarded to no one, by no one.'),
('Weirdly Warm Rock', '🔥', 'Should not be warm. Is warm.'),
('Tiny Tiny Piano', '🎹', 'Plays only three notes.'),
('Chipped Fine China Cat', '🐈', 'Judges everyone silently.'),
('Bag of Marbles (Lost)', '🎱', 'You have found them.'),
('Snorkel for Land Use', '🤿', 'Ideal for dramatic breathing.'),
('Signed Photo of a Stranger', '📸', 'Best wishes, Kevin.');

-- ============ ROUNDS ============
CREATE TABLE public.rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'choosing', -- 'choosing' | 'bidding' | 'ended'
  choice_item_ids uuid[] NOT NULL DEFAULT '{}',
  item_id uuid REFERENCES public.items(id),
  current_bid integer NOT NULL DEFAULT 0,
  current_bidder_id uuid REFERENCES public.profiles(id),
  starting_bid integer NOT NULL DEFAULT 10,
  ends_at timestamptz,
  winner_id uuid REFERENCES public.profiles(id),
  winning_bid integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.rounds TO authenticated;
GRANT ALL ON public.rounds TO service_role;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rounds viewable by authenticated" ON public.rounds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create rounds as host" ON public.rounds FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Anyone authenticated can update rounds" ON public.rounds FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============ BIDS ============
CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bids_round_idx ON public.bids(round_id, created_at DESC);
GRANT SELECT, INSERT ON public.bids TO authenticated;
GRANT ALL ON public.bids TO service_role;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bids viewable by authenticated" ON public.bids FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own bids" ON public.bids FOR INSERT TO authenticated WITH CHECK (auth.uid() = bidder_id);

-- ============ INVENTORY ============
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id),
  acquired_price integer NOT NULL,
  listed_price integer,
  acquired_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inventory_owner_idx ON public.inventory(owner_id);
CREATE INDEX inventory_listed_idx ON public.inventory(listed_price) WHERE listed_price IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory viewable by authenticated" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can insert own inventory" ON public.inventory FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own inventory" ON public.inventory FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own inventory" ON public.inventory FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;

-- ============ RPC: place_bid (atomic) ============
CREATE OR REPLACE FUNCTION public.place_bid(_round_id uuid, _amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.rounds; bal integer; uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO r FROM public.rounds WHERE id = _round_id FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Round not found'; END IF;
  IF r.status <> 'bidding' THEN RAISE EXCEPTION 'Round not accepting bids'; END IF;
  IF r.ends_at IS NULL OR r.ends_at <= now() THEN RAISE EXCEPTION 'Bidding closed'; END IF;
  IF r.host_id = uid THEN RAISE EXCEPTION 'Host cannot bid on own round'; END IF;
  IF _amount < GREATEST(r.starting_bid, r.current_bid + 1) THEN
    RAISE EXCEPTION 'Bid must be at least %', GREATEST(r.starting_bid, r.current_bid + 1);
  END IF;
  SELECT balance INTO bal FROM public.profiles WHERE id = uid;
  IF bal < _amount THEN RAISE EXCEPTION 'Insufficient BET MONEY'; END IF;
  UPDATE public.rounds SET current_bid = _amount, current_bidder_id = uid,
    ends_at = GREATEST(ends_at, now() + interval '10 seconds')
    WHERE id = _round_id;
  INSERT INTO public.bids(round_id, bidder_id, amount) VALUES(_round_id, uid, _amount);
END;
$$;
GRANT EXECUTE ON FUNCTION public.place_bid(uuid, integer) TO authenticated;

-- ============ RPC: settle_round (atomic) ============
CREATE OR REPLACE FUNCTION public.settle_round(_round_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.rounds;
BEGIN
  SELECT * INTO r FROM public.rounds WHERE id = _round_id FOR UPDATE;
  IF r.id IS NULL OR r.status <> 'bidding' THEN RETURN; END IF;
  IF r.ends_at IS NULL OR r.ends_at > now() THEN RETURN; END IF;
  IF r.current_bidder_id IS NOT NULL AND r.current_bid > 0 THEN
    -- deduct bid from winner, insert into inventory
    UPDATE public.profiles SET balance = balance - r.current_bid WHERE id = r.current_bidder_id AND balance >= r.current_bid;
    IF FOUND THEN
      INSERT INTO public.inventory(owner_id, item_id, acquired_price)
        VALUES(r.current_bidder_id, r.item_id, r.current_bid);
      UPDATE public.rounds SET status='ended', winner_id=r.current_bidder_id, winning_bid=r.current_bid WHERE id=_round_id;
    ELSE
      UPDATE public.rounds SET status='ended' WHERE id=_round_id;
    END IF;
  ELSE
    UPDATE public.rounds SET status='ended' WHERE id=_round_id;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.settle_round(uuid) TO authenticated;

-- ============ RPC: pick_item (host chooses one of 3) ============
CREATE OR REPLACE FUNCTION public.pick_item(_round_id uuid, _item_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.rounds;
BEGIN
  SELECT * INTO r FROM public.rounds WHERE id = _round_id FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Round not found'; END IF;
  IF r.host_id <> auth.uid() THEN RAISE EXCEPTION 'Only host can pick'; END IF;
  IF r.status <> 'choosing' THEN RAISE EXCEPTION 'Already picked'; END IF;
  IF NOT (_item_id = ANY(r.choice_item_ids)) THEN RAISE EXCEPTION 'Invalid choice'; END IF;
  UPDATE public.rounds SET item_id=_item_id, status='bidding', ends_at = now() + interval '45 seconds'
    WHERE id = _round_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.pick_item(uuid, uuid) TO authenticated;

-- ============ RPC: buy_listed (resale) ============
CREATE OR REPLACE FUNCTION public.buy_listed(_inventory_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.inventory; buyer uuid := auth.uid(); bal integer;
BEGIN
  IF buyer IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO inv FROM public.inventory WHERE id = _inventory_id FOR UPDATE;
  IF inv.id IS NULL OR inv.listed_price IS NULL THEN RAISE EXCEPTION 'Not for sale'; END IF;
  IF inv.owner_id = buyer THEN RAISE EXCEPTION 'Cannot buy own item'; END IF;
  SELECT balance INTO bal FROM public.profiles WHERE id = buyer;
  IF bal < inv.listed_price THEN RAISE EXCEPTION 'Insufficient BET MONEY'; END IF;
  UPDATE public.profiles SET balance = balance - inv.listed_price WHERE id = buyer;
  UPDATE public.profiles SET balance = balance + inv.listed_price WHERE id = inv.owner_id;
  UPDATE public.inventory SET owner_id = buyer, acquired_price = inv.listed_price, listed_price = NULL, acquired_at = now()
    WHERE id = _inventory_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.buy_listed(uuid) TO authenticated;
