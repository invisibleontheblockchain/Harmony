-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 1: TRACKS
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
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
  user_id UUID UNIQUE NOT NULL,
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