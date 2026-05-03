import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID laporan tidak ditemukan' },
        { status: 400 }
      );
    }

    // Attempt to delete the report from the database and return the deleted row
    const { data, error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Gagal menghapus laporan' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      // If no data is returned, it means RLS prevented the delete or ID doesn't exist
      console.error('Delete blocked by RLS or ID not found');
      return NextResponse.json(
        { error: 'Akses ditolak (Policy RLS DELETE belum diaktifkan di Supabase)' },
        { status: 403 }
      );
    }

    // Revalidate the dashboard and API paths to clear Next.js cache
    revalidatePath('/dashboard');
    revalidatePath('/api/reports');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
