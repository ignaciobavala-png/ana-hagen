-- Álbumes para la galería de fotos
CREATE TABLE IF NOT EXISTS albums (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Las fotos sin album_id no aparecen en la galería pública
ALTER TABLE photos ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES albums(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read albums" ON albums
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage albums" ON albums
  FOR ALL USING (auth.role() = 'authenticated');
