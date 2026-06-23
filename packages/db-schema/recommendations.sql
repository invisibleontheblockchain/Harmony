-- ============================================================
-- HARMONY RECOMMENDATION ENGINE — Phase 1 Database Migration
-- Adds: pgvector, audio features, interaction events, ALS,
--       genre taxonomy, genre graph, recommendation cache,
--       A/B testing, evaluation tables
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- ENRICH TRACKS with recommendation columns
-- ============================================================
ALTER TABLE tracks
  ADD COLUMN IF NOT EXISTS stream_count BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS playlist_add_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS audio_processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS genre_l1 VARCHAR(100),
  ADD COLUMN IF NOT EXISTS genre_l2 VARCHAR(100),
  ADD COLUMN IF NOT EXISTS genre_l3 VARCHAR(100),
  ADD COLUMN IF NOT EXISTS genre_l4 VARCHAR(100),
  ADD COLUMN IF NOT EXISTS genre_confidence FLOAT,
  ADD COLUMN IF NOT EXISTS genre_level INTEGER;

CREATE INDEX IF NOT EXISTS idx_tracks_genre_l2 ON tracks(genre_l2);
CREATE INDEX IF NOT EXISTS idx_tracks_genre_l4 ON tracks(genre_l4);
CREATE INDEX IF NOT EXISTS idx_tracks_stream_count ON tracks(stream_count);
CREATE INDEX IF NOT EXISTS idx_tracks_audio_processed ON tracks(audio_processed);

-- ============================================================
-- AUDIO FEATURES (CLAP + Essentia + Genre Classification)
-- ============================================================
CREATE TABLE IF NOT EXISTS track_audio_features (
  track_id UUID PRIMARY KEY REFERENCES tracks(id) ON DELETE CASCADE,
  clap_embedding VECTOR(512),
  bpm FLOAT,
  beat_strength FLOAT,
  onset_rate FLOAT,
  danceability FLOAT,
  rhythm_strength FLOAT,
  beat_loudness FLOAT,
  key VARCHAR(10),
  scale VARCHAR(10),
  key_strength FLOAT,
  hpcp_mean FLOAT[],
  chord_complexity FLOAT,
  tuning_frequency FLOAT,
  mfcc_mean FLOAT[],
  mfcc_var FLOAT[],
  mfcc_delta_mean FLOAT[],
  mfcc_delta2_mean FLOAT[],
  spectral_centroid FLOAT,
  spectral_spread FLOAT,
  spectral_rolloff FLOAT,
  spectral_flux FLOAT,
  zero_crossing_rate FLOAT,
  loudness_lufs FLOAT,
  dynamic_range FLOAT,
  rms_energy FLOAT,
  loudness_range FLOAT,
  dissonance FLOAT,
  roughness FLOAT,
  inharmonicity FLOAT,
  spectral_complexity FLOAT,
  mood_valence FLOAT,
  mood_arousal FLOAT,
  voice_instrumental_ratio FLOAT,
  gender VARCHAR(20),
  acoustic_electric FLOAT,
  essentia_features JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clap_embedding_hnsw
  ON track_audio_features USING hnsw (clap_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================
-- INTERACTION EVENTS (for ALS training + recommendation signals)
-- ============================================================
CREATE TABLE IF NOT EXISTS interaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  play_duration_seconds INTEGER,
  track_duration_seconds INTEGER,
  completion_rate FLOAT GENERATED ALWAYS AS (
    CASE WHEN track_duration_seconds > 0
    THEN play_duration_seconds::float / track_duration_seconds
    ELSE NULL END
  ) STORED,
  interaction_weight FLOAT GENERATED ALWAYS AS (
    CASE event_type
      WHEN 'stream_complete' THEN 1.0
      WHEN 'replay' THEN 2.0
      WHEN 'like' THEN 3.0
      WHEN 'playlist_add' THEN 4.0
      WHEN 'share' THEN 5.0
      WHEN 'skip_early' THEN -1.0
      WHEN 'skip_mid' THEN -0.3
      ELSE 0.0
    END
  ) STORED,
  session_id UUID,
  device_type VARCHAR(50),
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS interaction_events_y2026m06
  PARTITION OF interaction_events FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2026m07
  PARTITION OF interaction_events FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2026m08
  PARTITION OF interaction_events FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2026m09
  PARTITION OF interaction_events FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2026m10
  PARTITION OF interaction_events FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2026m11
  PARTITION OF interaction_events FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2026m12
  PARTITION OF interaction_events FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m01
  PARTITION OF interaction_events FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m02
  PARTITION OF interaction_events FOR VALUES FROM ('2027-02-01') TO ('2027-03-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m03
  PARTITION OF interaction_events FOR VALUES FROM ('2027-03-01') TO ('2027-04-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m04
  PARTITION OF interaction_events FOR VALUES FROM ('2027-04-01') TO ('2027-05-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m05
  PARTITION OF interaction_events FOR VALUES FROM ('2027-05-01') TO ('2027-06-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m06
  PARTITION OF interaction_events FOR VALUES FROM ('2027-06-01') TO ('2027-07-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m07
  PARTITION OF interaction_events FOR VALUES FROM ('2027-07-01') TO ('2027-08-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m08
  PARTITION OF interaction_events FOR VALUES FROM ('2027-08-01') TO ('2027-09-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m09
  PARTITION OF interaction_events FOR VALUES FROM ('2027-09-01') TO ('2027-10-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m10
  PARTITION OF interaction_events FOR VALUES FROM ('2027-10-01') TO ('2027-11-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m11
  PARTITION OF interaction_events FOR VALUES FROM ('2027-11-01') TO ('2027-12-01');
CREATE TABLE IF NOT EXISTS interaction_events_y2027m12
  PARTITION OF interaction_events FOR VALUES FROM ('2027-12-01') TO ('2028-01-01');

CREATE INDEX IF NOT EXISTS idx_interactions_user ON interaction_events(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_track ON interaction_events(track_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON interaction_events(created_at);
CREATE INDEX IF NOT EXISTS idx_interactions_event_type ON interaction_events(event_type);

-- ============================================================
-- COLLABORATIVE FILTERING — ALS Factor Tables
-- ============================================================
CREATE TABLE IF NOT EXISTS als_user_factors (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  factors VECTOR(128),
  training_loss FLOAT,
  trained_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS als_item_factors (
  track_id UUID PRIMARY KEY REFERENCES tracks(id) ON DELETE CASCADE,
  factors VECTOR(128),
  training_loss FLOAT,
  trained_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_als_user_factors_hnsw
  ON als_user_factors USING hnsw (factors vector_ip_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_als_item_factors_hnsw
  ON als_item_factors USING hnsw (factors vector_ip_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================
-- COLD START — User Catalog Embeddings (ACARec)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_catalog_embeddings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mean_clap_embedding VECTOR(512),
  mean_als_factors VECTOR(128),
  genre_distribution JSONB DEFAULT '{}',
  track_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_catalog_clap_hnsw
  ON user_catalog_embeddings USING hnsw (mean_clap_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================
-- USER EMBEDDINGS (taste centroid + genre affinity)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_embeddings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  taste_centroid VECTOR(512),
  genre_affinity JSONB DEFAULT '{}',
  preferred_valence_range FLOAT[],
  preferred_arousal_range FLOAT[],
  preferred_bpm_range FLOAT[],
  exploration_score FLOAT DEFAULT 0.5,
  track_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_embeddings_taste_hnsw
  ON user_embeddings USING hnsw (taste_centroid vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================
-- GENRE TAXONOMY (6,000+ nodes, L1–L5)
-- ============================================================
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES genres(id),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  description TEXT,
  discogs_style_tags TEXT[],
  musicbrainz_ids TEXT[],
  everynoise_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_genres_parent ON genres(parent_id);
CREATE INDEX IF NOT EXISTS idx_genres_level ON genres(level);

CREATE TABLE IF NOT EXISTS genre_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias VARCHAR(100) NOT NULL,
  canonical_genre_id UUID NOT NULL REFERENCES genres(id),
  source VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_genre_aliases_alias ON genre_aliases(alias);

CREATE TABLE IF NOT EXISTS genre_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genre_a_id UUID NOT NULL REFERENCES genres(id),
  genre_b_id UUID NOT NULL REFERENCES genres(id),
  similarity_score FLOAT NOT NULL CHECK (similarity_score BETWEEN 0 AND 1),
  edge_type VARCHAR(50),
  UNIQUE(genre_a_id, genre_b_id)
);

CREATE TABLE IF NOT EXISTS genre_embeddings (
  genre_id UUID PRIMARY KEY REFERENCES genres(id),
  embedding VECTOR(128),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_genre_embeddings_hnsw
  ON genre_embeddings USING hnsw (embedding vector_cosine_ops);

-- ============================================================
-- RECOMMENDATION CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendation_cache (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  recommendations JSONB NOT NULL,
  algorithm_version VARCHAR(50),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '6 hours'
);

CREATE INDEX IF NOT EXISTS idx_rec_cache_expires ON recommendation_cache(expires_at);

-- ============================================================
-- A/B TESTING FRAMEWORK
-- ============================================================
CREATE TABLE IF NOT EXISTS ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  variants JSONB NOT NULL,
  traffic_allocation JSONB NOT NULL,
  primary_metric VARCHAR(100),
  secondary_metrics TEXT[],
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id),
  variant VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, experiment_id)
);

CREATE TABLE IF NOT EXISTS ab_test_exposures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  test_name VARCHAR(100) NOT NULL,
  variant VARCHAR(50) NOT NULL,
  exposed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, test_name)
);

CREATE INDEX IF NOT EXISTS idx_ab_assignments_user ON ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_experiment ON ab_test_assignments(experiment_id);

-- ============================================================
-- EVALUATION TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_version VARCHAR(50) NOT NULL,
  ndcg_at_10 FLOAT,
  precision_at_10 FLOAT,
  serendipity_at_10 FLOAT,
  diversity_at_10 FLOAT,
  independent_artist_discovery_rate FLOAT,
  cold_start_ndcg FLOAT,
  genre_depth_score FLOAT,
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HELPER: auto-create future interaction partitions
-- ============================================================
CREATE OR REPLACE FUNCTION create_interaction_partition(year INT, month INT) RETURNS VOID AS $$
DECLARE
  partition_name TEXT;
  start_date TEXT;
  end_date TEXT;
BEGIN
  partition_name := format('interaction_events_y%sm%s', to_char(year, 'FM0000'), to_char(month, 'FM00'));
  start_date := format('%s-%s-01', to_char(year, 'FM0000'), to_char(month, 'FM00'));
  IF month = 12 THEN
    end_date := format('%s-01-01', to_char(year + 1, 'FM0000'));
  ELSE
    end_date := format('%s-%s-01', to_char(year, 'FM0000'), to_char(month + 1, 'FM00'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF interaction_events FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_partition_interaction_events() RETURNS TRIGGER AS $$
DECLARE
  next_month_val TIMESTAMPTZ;
  next_year INT;
  next_month INT;
BEGIN
  PERFORM create_interaction_partition(
    EXTRACT(YEAR FROM NEW.created_at)::INT,
    EXTRACT(MONTH FROM NEW.created_at)::INT
  );
  next_month_val := NEW.created_at + INTERVAL '30 days';
  next_year := EXTRACT(YEAR FROM next_month_val)::INT;
  next_month := EXTRACT(MONTH FROM next_month_val)::INT;
  PERFORM create_interaction_partition(next_year, next_month);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_auto_partition_interaction_events
  BEFORE INSERT ON interaction_events
  FOR EACH ROW
  EXECUTE FUNCTION auto_partition_interaction_events();
