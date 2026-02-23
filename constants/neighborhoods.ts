import { Neighborhood, NeighborhoodId } from '@/types';

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'all',
    label: 'All Berkeley',
    emoji: '🏙️',
    description: 'Show everything nearby',
    center: { latitude: 37.8716, longitude: -122.2727 },
    latRange: [37.84, 37.90],
    lngRange: [-122.32, -122.23],
  },
  {
    id: 'southside',
    label: 'Southside',
    emoji: '🎓',
    description: 'Telegraph Ave, Dwight Way, near campus',
    center: { latitude: 37.8665, longitude: -122.2575 },
    latRange: [37.860, 37.872],
    lngRange: [-122.268, -122.248],
  },
  {
    id: 'northside',
    label: 'Northside',
    emoji: '🌲',
    description: 'North of campus, Euclid Ave area',
    center: { latitude: 37.877, longitude: -122.265 },
    latRange: [37.873, 37.882],
    lngRange: [-122.275, -122.255],
  },
  {
    id: 'downtown',
    label: 'Downtown',
    emoji: '🏢',
    description: 'Shattuck Ave, BART area',
    center: { latitude: 37.8705, longitude: -122.272 },
    latRange: [37.865, 37.876],
    lngRange: [-122.282, -122.262],
  },
  {
    id: 'elmwood',
    label: 'Elmwood',
    emoji: '🌳',
    description: 'College Ave, Telegraph south',
    center: { latitude: 37.856, longitude: -122.252 },
    latRange: [37.850, 37.862],
    lngRange: [-122.260, -122.244],
  },
  {
    id: 'west-berkeley',
    label: 'West Berkeley',
    emoji: '🏭',
    description: '4th St, San Pablo Ave, Aquatic Park',
    center: { latitude: 37.869, longitude: -122.294 },
    latRange: [37.860, 37.878],
    lngRange: [-122.310, -122.280],
  },
  {
    id: 'north-hills',
    label: 'North Hills',
    emoji: '⛰️',
    description: 'Panoramic Hill, Claremont area',
    center: { latitude: 37.879, longitude: -122.248 },
    latRange: [37.873, 37.888],
    lngRange: [-122.260, -122.235],
  },
];

export const NEIGHBORHOOD_MAP: Record<NeighborhoodId, Neighborhood> = Object.fromEntries(
  NEIGHBORHOODS.map((n) => [n.id, n])
) as Record<NeighborhoodId, Neighborhood>;

export function getNeighborhoodForCoords(lat: number, lng: number): NeighborhoodId {
  for (const neighborhood of NEIGHBORHOODS) {
    if (neighborhood.id === 'all') continue;
    const [latMin, latMax] = neighborhood.latRange;
    const [lngMin, lngMax] = neighborhood.lngRange;
    if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
      return neighborhood.id;
    }
  }
  return 'all';
}
