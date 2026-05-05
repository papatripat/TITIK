import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { classifyWaste } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, latitude, longitude, location_detail, description } = body;

    if (!image || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: image, latitude, longitude' },
        { status: 400 }
      );
    }

    // 1. Decode base64 and upload to Supabase Storage
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `report-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // 3. Classify waste using Gemini AI
    const classification = await classifyWaste(base64Data);

    // 4. Save report to database
    const { data: report, error: dbError } = await supabase
      .from('reports')
      .insert({
        image_url: imageUrl,
        latitude,
        longitude,
        location_detail: location_detail || null,
        description: description || null,
        severity: classification.severity,
        waste_type: classification.waste_type,
        confidence: classification.confidence,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
      classification,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reports: reports || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
