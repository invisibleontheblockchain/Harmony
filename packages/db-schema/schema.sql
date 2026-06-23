-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 0: USERS (core identity — artists, listeners, admins)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) CHECK (role IN ('listener', 'artist', 'admin')) DEFAULT 'listener',
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role ON users(role);

-- TABLE 1: TRACKS
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  file_url_hls TEXT NOT NULL,
  file_url_raw TEXT NOT NULL,
  fingerprint_id TEXT UNIQUE,
  status VARCHAR(50) CHECK (status IN ('processing', 'active', 'dmca_hold', 'deleted')) DEFAULT 'processing',
  genre VARCHAR(100),
  bpm INTEGER,
  key_signature VARCHAR(10),
  isrc_code VARCHAR(15) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_status ON tracks(status);

-- TABLE 2: RIGHTS_HOLDERS
CREATE TABLE rights_holders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  display_name VARCHAR(255) NOT NULL,
  stripe_connect_account_id VARCHAR(255) UNIQUE,
  wallet_address VARCHAR(255) UNIQUE,
  kyc_status VARCHAR(50) DEFAULT 'pending',
  payout_threshold_cents INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: ROYALTY_SPLITS (with 100% enforcement trigger)
CREATE TABLE royalty_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  rights_holder_id UUID REFERENCES rights_holders(id),
  split_percentage NUMERIC(5,2) NOT NULL CHECK (split_percentage > 0 AND split_percentage <= 100),
  role VARCHAR(50) CHECK (role IN ('primary_artist', 'producer', 'featuring', 'label')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(track_id, rights_holder_id)
);

CREATE INDEX idx_royalty_splits_track_id ON royalty_splits(track_id);

CREATE OR REPLACE FUNCTION check_split_sum() RETURNS TRIGGER AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT SUM(split_percentage) INTO total FROM royalty_splits WHERE track_id = NEW.track_id;
  IF total != 100.00 THEN
    RAISE EXCEPTION 'Royalty splits for track % must sum to exactly 100. Current sum: %', NEW.track_id, total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ensure_100_percent_split
AFTER INSERT OR UPDATE ON royalty_splits
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_split_sum();

-- TABLE 4: STREAM_EVENTS (Partitioned by Range)
CREATE TABLE stream_events (
  id UUID DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id),
  listener_id UUID NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  royalty_credited BOOLEAN DEFAULT FALSE,
  ip_hash VARCHAR(64) NOT NULL,
  stream_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_stream_events_uncredited ON stream_events(track_id) WHERE royalty_credited = FALSE;
CREATE TABLE stream_events_y2026m06 PARTITION OF stream_events FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE stream_events_y2026m07 PARTITION OF stream_events FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE stream_events_y2026m08 PARTITION OF stream_events FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE stream_events_y2026m09 PARTITION OF stream_events FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE stream_events_y2026m10 PARTITION OF stream_events FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE stream_events_y2026m11 PARTITION OF stream_events FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE stream_events_y2026m12 PARTITION OF stream_events FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE TABLE stream_events_y2027m01 PARTITION OF stream_events FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');
CREATE TABLE stream_events_y2027m02 PARTITION OF stream_events FOR VALUES FROM ('2027-02-01') TO ('2027-03-01');
CREATE TABLE stream_events_y2027m03 PARTITION OF stream_events FOR VALUES FROM ('2027-03-01') TO ('2027-04-01');
CREATE TABLE stream_events_y2027m04 PARTITION OF stream_events FOR VALUES FROM ('2027-04-01') TO ('2027-05-01');
CREATE TABLE stream_events_y2027m05 PARTITION OF stream_events FOR VALUES FROM ('2027-05-01') TO ('2027-06-01');
CREATE TABLE stream_events_y2027m06 PARTITION OF stream_events FOR VALUES FROM ('2027-06-01') TO ('2027-07-01');
CREATE TABLE stream_events_y2027m07 PARTITION OF stream_events FOR VALUES FROM ('2027-07-01') TO ('2027-08-01');
CREATE TABLE stream_events_y2027m08 PARTITION OF stream_events FOR VALUES FROM ('2027-08-01') TO ('2027-09-01');
CREATE TABLE stream_events_y2027m09 PARTITION OF stream_events FOR VALUES FROM ('2027-09-01') TO ('2027-10-01');
CREATE TABLE stream_events_y2027m10 PARTITION OF stream_events FOR VALUES FROM ('2027-10-01') TO ('2027-11-01');
CREATE TABLE stream_events_y2027m11 PARTITION OF stream_events FOR VALUES FROM ('2027-11-01') TO ('2027-12-01');
CREATE TABLE stream_events_y2027m12 PARTITION OF stream_events FOR VALUES FROM ('2027-12-01') TO ('2028-01-01');

-- Helper function to create a new partition
CREATE OR REPLACE FUNCTION create_stream_partition(year INT, month INT) RETURNS VOID AS $$
DECLARE
  partition_name TEXT;
  start_date TEXT;
  end_date TEXT;
BEGIN
  partition_name := format('stream_events_y%sm%s', to_char(year, 'FM0000'), to_char(month, 'FM00'));
  start_date := format('%s-%s-01', to_char(year, 'FM0000'), to_char(month, 'FM00'));
  
  IF month = 12 THEN
    end_date := format('%s-01-01', to_char(year + 1, 'FM0000'));
  ELSE
    end_date := format('%s-%s-01', to_char(year, 'FM0000'), to_char(month + 1, 'FM00'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF stream_events FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-create partition on insert
CREATE OR REPLACE FUNCTION auto_partition_stream_events() RETURNS TRIGGER AS $$
DECLARE
  next_month_val TIMESTAMPTZ;
  next_year INT;
  next_month INT;
BEGIN
  -- Get the target partition details for the current record
  PERFORM create_stream_partition(EXTRACT(YEAR FROM NEW.created_at)::INT, EXTRACT(MONTH FROM NEW.created_at)::INT);

  -- Get partition details for 30 days ahead to auto-create future partitions
  next_month_val := NEW.created_at + INTERVAL '30 days';
  next_year := EXTRACT(YEAR FROM next_month_val);
  next_month := EXTRACT(MONTH FROM next_month_val);
  
  PERFORM create_stream_partition(next_year, next_month);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_auto_partition_stream_events
BEFORE INSERT ON stream_events
FOR EACH ROW
EXECUTE FUNCTION auto_partition_stream_events();


-- TABLE 5: ROYALTY_LEDGER (Append-Only)
CREATE TABLE royalty_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rights_holder_id UUID REFERENCES rights_holders(id),
  track_id UUID REFERENCES tracks(id),
  stream_event_id UUID,
  amount_cents INTEGER NOT NULL,
  ledger_type VARCHAR(50) CHECK (ledger_type IN ('stream_credit', 'nft_sale', 'tip', 'payout_debit', 'adjustment')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_royalty_ledger_rights_holder ON royalty_ledger(rights_holder_id);
REVOKE UPDATE, DELETE ON royalty_ledger FROM PUBLIC;

-- TABLE 6: PAYOUT_BATCHES
CREATE TABLE payout_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rights_holder_id UUID REFERENCES rights_holders(id),
  total_amount_cents INTEGER NOT NULL,
  stripe_transfer_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payout_batches_status ON payout_batches(status);

-- TABLE 7: ALBUMS / EPS
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  album_type VARCHAR(50) CHECK (album_type IN ('album', 'ep', 'single')) DEFAULT 'album',
  cover_art_url TEXT,
  release_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_albums_artist_id ON albums(artist_id);

-- TABLE 8: PLAYLISTS
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  cover_art_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);

-- TABLE 9: PLAYLIST_TRACKS (junction)
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);

-- TABLE 10: FOLLOWS (social graph)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- TABLE 11: LIKES
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_track_id ON likes(track_id);

-- TABLE 12: PLAY_HISTORY (for continue listening + recommendations training)
CREATE TABLE play_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  track_id UUID NOT NULL REFERENCES tracks(id),
  played_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_play_history_user_id ON play_history(user_id);
CREATE INDEX idx_play_history_track_id ON play_history(track_id);

-- TABLE 13: USER_PREFERENCES
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audio_quality VARCHAR(20) DEFAULT 'high' CHECK (audio_quality IN ('low', 'medium', 'high', 'lossless')),
  autoplay BOOLEAN DEFAULT TRUE,
  explicit_content BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 14: SUBSCRIPTION_TIERS (fan subscriptions)
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  benefits JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_tiers_artist_id ON subscription_tiers(artist_id);

-- TABLE 15: FAN_SUBSCRIPTIONS (junction)
CREATE TABLE fan_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fan_id, artist_id)
);

CREATE INDEX idx_fan_subscriptions_fan ON fan_subscriptions(fan_id);
CREATE INDEX idx_fan_subscriptions_artist ON fan_subscriptions(artist_id);

-- TABLE 16: PENDING_MINTS (lazy minting flow)
CREATE TABLE pending_mints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  seller_user_id UUID NOT NULL REFERENCES users(id),
  edition_type VARCHAR(50) CHECK (edition_type IN ('open', 'limited')) DEFAULT 'open',
  edition_count INTEGER,
  price_cents INTEGER NOT NULL,
  metadata_url TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'minted', 'cancelled', 'sold')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pending_mints_track_id ON pending_mints(track_id);
CREATE INDEX idx_pending_mints_seller ON pending_mints(seller_user_id);

-- TABLE 17: NFT_LISTINGS (marketplace)
CREATE TABLE nft_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES tracks(id),
  seller_user_id UUID NOT NULL REFERENCES users(id),
  edition_type VARCHAR(50) CHECK (edition_type IN ('1/1', 'limited')) DEFAULT '1/1',
  edition_count INTEGER,
  price_cents INTEGER NOT NULL,
  arweave_metadata_url TEXT,
  status VARCHAR(50) CHECK (status IN ('listed', 'sold', 'delisted')) DEFAULT 'listed',
  mint_address VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nft_listings_track_id ON nft_listings(track_id);
CREATE INDEX idx_nft_listings_seller ON nft_listings(seller_user_id);
CREATE INDEX idx_nft_listings_status ON nft_listings(status);

-- TABLE 18: DAO_PROPOSALS
CREATE TABLE dao_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposer_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  voting_ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) CHECK (status IN ('active', 'passed', 'failed', 'executed')) DEFAULT 'active',
  quorum INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dao_proposals_status ON dao_proposals(status);
CREATE INDEX idx_dao_proposals_proposer ON dao_proposals(proposer_id);

-- TABLE 19: DAO_VOTES
CREATE TABLE dao_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES dao_proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES users(id),
  choice VARCHAR(20) CHECK (choice IN ('for', 'against', 'abstain')) NOT NULL,
  voting_power INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

CREATE INDEX idx_dao_votes_proposal ON dao_votes(proposal_id);
CREATE INDEX idx_dao_votes_voter ON dao_votes(voter_id);

-- TABLE 20: NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL CHECK (type IN ('follow', 'stream_milestone', 'nft_sold', 'payout_processed', 'new_release', 'proposal', 'message', 'system')),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- TABLE 21: MESSAGE_THREADS
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_one UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_one, participant_two)
);

CREATE INDEX idx_message_threads_participants ON message_threads(participant_one, participant_two);

-- TABLE 22: MESSAGES
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  track_share_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- TABLE 23: COMMENTS
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_track_id ON comments(track_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);