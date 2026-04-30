'use client';

import dynamic from 'next/dynamic';

const MapDashboard = dynamic(() => import('@/components/MapDashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400">Memuat peta...</p>
      </div>
    </div>
  ),
});

export default function MapWrapper() {
  return <MapDashboard />;
}
