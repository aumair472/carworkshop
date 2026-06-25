-- Service location map: which services are available at which locations
CREATE TABLE IF NOT EXISTS service_location_map (
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  custom_price NUMERIC(10, 2) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (service_id, location_id)
);

-- Enable RLS
ALTER TABLE service_location_map ENABLE ROW LEVEL SECURITY;

-- Public read for published data
CREATE POLICY "service_location_map_public_read" ON service_location_map
  FOR SELECT USING (is_active = true);

-- Service role full access
CREATE POLICY "service_location_map_service_all" ON service_location_map
  FOR ALL USING (auth.role() = 'service_role');

-- Index for location lookups
CREATE INDEX IF NOT EXISTS idx_service_location_map_location ON service_location_map(location_id);
CREATE INDEX IF NOT EXISTS idx_service_location_map_service ON service_location_map(service_id);
