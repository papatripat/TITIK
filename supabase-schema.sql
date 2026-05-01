-- ============================================
-- TITIK - Supabase Database Schema
-- Spatial Waste Mapping & Reporting System
-- ============================================

-- 1. Create the reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    severity INTEGER NOT NULL CHECK (severity IN (1, 2, 3)),
    waste_type TEXT NOT NULL CHECK (waste_type IN ('plastic', 'organic', 'mixed')),
    confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for anonymous access (for hackathon demo)
-- Allow anyone to read reports
CREATE POLICY "Allow public read access"
    ON reports
    FOR SELECT
    TO anon
    USING (true);

-- Allow anyone to insert reports
CREATE POLICY "Allow public insert access"
    ON reports
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anyone to delete reports (for admin panel in hackathon demo)
-- In production, restrict this to authenticated admin users only
CREATE POLICY "Allow public delete access"
    ON reports
    FOR DELETE
    TO anon
    USING (true);

-- 4. Create index for faster queries
CREATE INDEX idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX idx_reports_severity ON reports (severity);

-- ============================================
-- STORAGE SETUP (do this via Supabase Dashboard)
-- ============================================
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket called "report-images"
-- 3. Set it as PUBLIC
-- 4. Add storage policy:
--    - Policy name: "Allow public uploads"
--    - Operation: INSERT
--    - Target roles: anon
--    - Policy: true
-- 5. Add storage policy:
--    - Policy name: "Allow public reads"  
--    - Operation: SELECT
--    - Target roles: anon
--    - Policy: true
