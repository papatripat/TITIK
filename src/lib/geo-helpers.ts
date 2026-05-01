// Helper functions for GeoJSON choropleth — works with any FeatureCollection
import type { FeatureCollection, Feature, Polygon } from 'geojson';

export type DistrictProperties = {
  name: string;
  id: string;
};

// Point-in-polygon using ray casting algorithm
export function isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1]; // lng, lat (GeoJSON order)
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Count reports per district/region
export function countReportsPerDistrict(
  reports: Array<{ latitude: number; longitude: number }>,
  districts: FeatureCollection<Polygon, DistrictProperties>
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const feature of districts.features) {
    counts[feature.properties.id] = 0;
  }

  for (const report of reports) {
    for (const feature of districts.features) {
      const coords = feature.geometry.coordinates[0]; // outer ring
      if (isPointInPolygon(report.latitude, report.longitude, coords)) {
        counts[feature.properties.id]++;
        break;
      }
    }
  }

  return counts;
}

// Choropleth color scale
export function getZoneColor(count: number): string {
  if (count === 0) return '#1e293b';
  if (count <= 2) return '#22c55e';
  if (count <= 5) return '#eab308';
  if (count <= 10) return '#f97316';
  return '#ef4444';
}

export function getZoneOpacity(count: number): number {
  if (count === 0) return 0.12;
  if (count <= 2) return 0.35;
  if (count <= 5) return 0.45;
  if (count <= 10) return 0.55;
  return 0.65;
}

export function getZoneLabel(count: number): string {
  if (count === 0) return 'Belum ada data';
  if (count <= 2) return 'Aman';
  if (count <= 5) return 'Waspada';
  if (count <= 10) return 'Siaga';
  return 'Kritis';
}

export function getZoneLabelColor(count: number): string {
  if (count === 0) return '#64748b';
  if (count <= 2) return '#22c55e';
  if (count <= 5) return '#eab308';
  if (count <= 10) return '#f97316';
  return '#ef4444';
}
