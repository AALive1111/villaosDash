import React, { useState, useMemo } from 'react';
import { 
  Layers, Eye, EyeOff, Bed, Waves, Utensils, Wifi, Sparkles, 
  MapPin, CheckCircle2, Lock, Info, ZoomIn, ZoomOut, RotateCcw, 
  ChevronRight, Building, Sun, Droplets, Wrench, Shield, Check, 
  DoorOpen, Users, Compass, Maximize2, Minimize2, Search, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';

export interface EstateRoom {
  id: string;
  name: string;
  pavilion: string;
  type: 'master' | 'suite' | 'deluxe' | 'family';
  status: 'occupied' | 'vacant' | 'cleaning' | 'inspected';
  guestName?: string;
  bedType: string;
  bathType: string;
  acTemp?: number;
  doorLockStatus: 'locked' | 'unlocked';
  x: number; // percentage on map
  y: number;
  width: number;
  height: number;
  pinX: number;
  pinY: number;
  sqm: number;
  notes: string;
}

export interface EstateAmenity {
  id: string;
  name: string;
  category: 'pool' | 'wellness' | 'dining' | 'lounge' | 'garden' | 'utility';
  status: 'operational' | 'in_use' | 'cleaning' | 'maintenance';
  icon: 'waves' | 'utensils' | 'wifi' | 'sun' | 'sparkles' | 'wrench' | 'shield';
  x: number;
  y: number;
  width: number;
  height: number;
  pinX: number;
  pinY: number;
  spec: string;
  details: string;
  lastCleaned?: string;
}

interface EstateLayout {
  propertyId: string;
  propertyName: string;
  totalAreaSqm: number;
  architecturalStyle: string;
  rooms: EstateRoom[];
  amenities: EstateAmenity[];
}

const ESTATE_LAYOUTS: Record<string, EstateLayout> = {
  'prop-1': {
    propertyId: 'prop-1',
    propertyName: 'Villa Seminyak 04',
    totalAreaSqm: 850,
    architecturalStyle: 'Contemporary Balinese Tropical Minimalist',
    rooms: [
      {
        id: 'room-101',
        name: 'Master Sanctuary Pavilion',
        pavilion: 'North Pavilion',
        type: 'master',
        status: 'occupied',
        guestName: 'Oliver Thorne',
        bedType: 'King Four-Poster Teak Bed',
        bathType: 'Open-Air Terrazzo Stone Tub & Dual Rain Shower',
        acTemp: 22,
        doorLockStatus: 'locked',
        x: 18,
        y: 12,
        width: 26,
        height: 24,
        pinX: 31,
        pinY: 24,
        sqm: 85,
        notes: 'Direct sunken pool access, custom Sonos sound bar, pool view'
      },
      {
        id: 'room-102',
        name: 'Lotus Suite (Bedroom 2)',
        pavilion: 'East Garden Wing',
        type: 'suite',
        status: 'occupied',
        guestName: 'Oliver Thorne (Party)',
        bedType: 'King Teak Bed',
        bathType: 'En-Suite Garden Shower',
        acTemp: 23,
        doorLockStatus: 'locked',
        x: 62,
        y: 12,
        width: 24,
        height: 22,
        pinX: 74,
        pinY: 23,
        sqm: 55,
        notes: 'Overlooks water lily pond and frangipani grove'
      },
      {
        id: 'room-103',
        name: 'Frangipani Suite (Bedroom 3)',
        pavilion: 'East Garden Wing',
        type: 'suite',
        status: 'vacant',
        bedType: 'Queen Bed / Twin Convertibles',
        bathType: 'Semi-Open Travertine Bath',
        acTemp: 24,
        doorLockStatus: 'locked',
        x: 62,
        y: 40,
        width: 24,
        height: 22,
        pinX: 74,
        pinY: 51,
        sqm: 50,
        notes: 'Prepared and inspected for next guest arrival'
      },
      {
        id: 'room-104',
        name: 'Breeze Poolside Suite (Bedroom 4)',
        pavilion: 'South Pool Pavilion',
        type: 'deluxe',
        status: 'cleaning',
        bedType: 'King Bed',
        bathType: 'Sunken Marble Bathroom',
        acTemp: 23,
        doorLockStatus: 'unlocked',
        x: 18,
        y: 64,
        width: 26,
        height: 22,
        pinX: 31,
        pinY: 75,
        sqm: 60,
        notes: 'Turnover in progress: fresh linen & eucalyptus scent replenishment'
      }
    ],
    amenities: [
      {
        id: 'amenity-pool',
        name: '14m Terrazzo Infinity Pool',
        category: 'pool',
        status: 'operational',
        icon: 'waves',
        x: 34,
        y: 38,
        width: 24,
        height: 24,
        pinX: 46,
        pinY: 50,
        spec: '14m x 4.5m • Depth 1.2m - 1.8m • Saltwater System',
        details: 'Filtration pump active, auto-chlorinator calibrated, water temp 28.5°C',
        lastCleaned: 'Today, 07:30 WITA'
      },
      {
        id: 'amenity-deck',
        name: 'Teak Sun Deck & Floating Daybeds',
        category: 'lounge',
        status: 'in_use',
        icon: 'sun',
        x: 48,
        y: 30,
        width: 12,
        height: 20,
        pinX: 54,
        pinY: 38,
        spec: '4 Double Sun Loungers • UV Sun Umbrellas',
        details: 'Direct pool access with organic sunscreen and fresh towel station',
        lastCleaned: 'Today, 08:00 WITA'
      },
      {
        id: 'amenity-living',
        name: 'Open-Air Sunken Living Bale',
        category: 'lounge',
        status: 'in_use',
        icon: 'sparkles',
        x: 18,
        y: 40,
        width: 14,
        height: 20,
        pinX: 25,
        pinY: 50,
        spec: 'Seating for 12 • 4.5m Soaring Alang-Alang Thatched Ceiling',
        details: 'Natural cross-breeze airflow, ceiling fans, integrated Sonos audio',
        lastCleaned: 'Today, 09:15 WITA'
      },
      {
        id: 'amenity-kitchen',
        name: 'Bespoke Chef & Dining Pavilion',
        category: 'dining',
        status: 'operational',
        icon: 'utensils',
        x: 46,
        y: 66,
        width: 20,
        height: 20,
        pinX: 56,
        pinY: 76,
        spec: 'Sub-Zero Fridge • 8-Seater Suar Wood Dining Table • Wine Chiller',
        details: 'Ready for in-villa chef dinner and floating breakfast preparation',
        lastCleaned: 'Today, 10:00 WITA'
      },
      {
        id: 'amenity-spa',
        name: 'Private Spa & Massage Bale',
        category: 'wellness',
        status: 'operational',
        icon: 'sparkles',
        x: 74,
        y: 68,
        width: 14,
        height: 18,
        pinX: 81,
        pinY: 77,
        spec: '2 Heated Massage Beds • Flower Petal Bath',
        details: 'Essential oil diffuser active, organic lemongrass and frangipani oils',
        lastCleaned: 'Yesterday, 18:00 WITA'
      },
      {
        id: 'amenity-wifi',
        name: 'High-Speed Biznet Fiber Mesh Hotspot',
        category: 'utility',
        status: 'operational',
        icon: 'wifi',
        x: 43,
        y: 20,
        width: 6,
        height: 6,
        pinX: 46,
        pinY: 22,
        spec: '250 Mbps Symmetric • Low Latency UniFi 6 Pro Access Points',
        details: 'Seamless coverage across pool, gardens, and indoor pavilions',
        lastCleaned: 'Live Diagnostic: Healthy (18ms ping)'
      },
      {
        id: 'amenity-gate',
        name: 'Estate Entrance & Private Carport',
        category: 'utility',
        status: 'operational',
        icon: 'shield',
        x: 8,
        y: 42,
        width: 8,
        height: 16,
        pinX: 12,
        pinY: 50,
        spec: 'Automated Teak Gate • 2 Car & 4 Scooter Covered Parking',
        details: '24/7 Security camera, digital PIN smart lock gate',
        lastCleaned: 'Checked Today 06:00'
      }
    ]
  },
  'prop-2': {
    propertyId: 'prop-2',
    propertyName: 'Villa Ubud 02',
    totalAreaSqm: 1200,
    architecturalStyle: 'Organic Bamboo & Ironwood Jungle Sanctuary',
    rooms: [
      {
        id: 'ubud-room-1',
        name: 'Canyon View Master Sanctuary',
        pavilion: 'Cliffside Pavilion',
        type: 'master',
        status: 'occupied',
        guestName: 'Elena Rostova',
        bedType: 'Organic Bamboo Canopy King Bed',
        bathType: 'Volcanic River Stone Tub overlooking jungle',
        acTemp: 23,
        doorLockStatus: 'locked',
        x: 20,
        y: 15,
        width: 28,
        height: 25,
        pinX: 34,
        pinY: 27,
        sqm: 90,
        notes: 'Panoramic views of Petanu River valley and morning mist'
      },
      {
        id: 'ubud-room-2',
        name: 'Rice Terrace Pavilion (Bedroom 2)',
        pavilion: 'Terrace Wing',
        type: 'suite',
        status: 'vacant',
        bedType: 'King Teak Platform Bed',
        bathType: 'Private Open Sky Shower',
        acTemp: 24,
        doorLockStatus: 'locked',
        x: 60,
        y: 18,
        width: 24,
        height: 24,
        pinX: 72,
        pinY: 30,
        sqm: 65,
        notes: 'Inspected and air-conditioned for Liam O’Connor arrival'
      },
      {
        id: 'ubud-room-3',
        name: 'Valley Breeze Suite (Bedroom 3)',
        pavilion: 'River Walk Pavilion',
        type: 'suite',
        status: 'inspected',
        bedType: 'Twin Convertibles / King',
        bathType: 'Garden Stone Bath',
        acTemp: 24,
        doorLockStatus: 'locked',
        x: 60,
        y: 55,
        width: 24,
        height: 24,
        pinX: 72,
        pinY: 67,
        sqm: 55,
        notes: 'Full fresh floral setup and artisan welcome teas placed'
      }
    ],
    amenities: [
      {
        id: 'ubud-pool',
        name: 'Natural River-Stone Plunge Pool',
        category: 'pool',
        status: 'operational',
        icon: 'waves',
        x: 36,
        y: 44,
        width: 20,
        height: 22,
        pinX: 46,
        pinY: 55,
        spec: 'Mineral Water • 10m x 4m • Infinity Valley Edge',
        details: 'Filtered spring water system, temperature 26°C natural cooling',
        lastCleaned: 'Today, 06:30 WITA'
      },
      {
        id: 'ubud-shala',
        name: 'Canopy Yoga & Meditation Shala',
        category: 'wellness',
        status: 'operational',
        icon: 'sparkles',
        x: 18,
        y: 55,
        width: 20,
        height: 22,
        pinX: 28,
        pinY: 66,
        spec: 'Manduka Cork Mats • Singing Bowls • Sound Bath Gear',
        details: 'Open-sided teak deck suspended over rainforest ravine',
        lastCleaned: 'Today, 08:00 WITA'
      },
      {
        id: 'ubud-starlink',
        name: 'Starlink Gen 3 Satellite Hub',
        category: 'utility',
        status: 'operational',
        icon: 'wifi',
        x: 48,
        y: 20,
        width: 8,
        height: 8,
        pinX: 52,
        pinY: 24,
        spec: 'Starlink Business • 220 Mbps • Battery UPS Backup',
        details: 'Uninterrupted power supply with solar generator backup',
        lastCleaned: 'Online: 0 dropped packets'
      }
    ]
  },
  'prop-3': {
    propertyId: 'prop-3',
    propertyName: 'Villa Canggu 08',
    totalAreaSqm: 1100,
    architecturalStyle: 'Modern Mediterranean Coastal Luxury',
    rooms: [
      {
        id: 'canggu-room-1',
        name: 'Ocean Sunset Master Penthouse',
        pavilion: 'Upper Master Wing',
        type: 'master',
        status: 'occupied',
        guestName: 'Marcus Vance',
        bedType: 'Custom Oak Emperor Bed',
        bathType: 'Freestanding Stone Tub with Sea View',
        acTemp: 21,
        doorLockStatus: 'locked',
        x: 20,
        y: 12,
        width: 28,
        height: 25,
        pinX: 34,
        pinY: 24,
        sqm: 95,
        notes: 'Private rooftop terrace and spiral staircase to pool'
      },
      {
        id: 'canggu-room-2',
        name: 'Surfside Suite 2',
        pavilion: 'Pool Pavilion East',
        type: 'suite',
        status: 'occupied',
        guestName: 'Marcus Vance (Family)',
        bedType: 'King Bed',
        bathType: 'Limestone En-Suite',
        acTemp: 22,
        doorLockStatus: 'locked',
        x: 62,
        y: 15,
        width: 24,
        height: 22,
        pinX: 74,
        pinY: 26,
        sqm: 52,
        notes: 'Custom surf rack and outdoor wetsuit rinse shower'
      },
      {
        id: 'canggu-room-3',
        name: 'Garden Suite 3',
        pavilion: 'Pool Pavilion East',
        type: 'suite',
        status: 'vacant',
        bedType: 'King Bed',
        bathType: 'Outdoor Tropical Bath',
        acTemp: 23,
        doorLockStatus: 'locked',
        x: 62,
        y: 42,
        width: 24,
        height: 22,
        pinX: 74,
        pinY: 53,
        sqm: 52,
        notes: 'Ready for check-in'
      },
      {
        id: 'canggu-room-4',
        name: 'Courtyard Bedroom 4',
        pavilion: 'West Wing',
        type: 'family',
        status: 'vacant',
        bedType: '2 Queen Beds',
        bathType: 'Double Vanity Shower',
        acTemp: 23,
        doorLockStatus: 'locked',
        x: 20,
        y: 65,
        width: 26,
        height: 22,
        pinX: 33,
        pinY: 76,
        sqm: 58,
        notes: 'Family setup with games and smart TV'
      },
      {
        id: 'canggu-room-5',
        name: 'Studio Bedroom 5',
        pavilion: 'South Garden Wing',
        type: 'deluxe',
        status: 'cleaning',
        bedType: 'Queen Bed',
        bathType: 'En-Suite Shower',
        acTemp: 24,
        doorLockStatus: 'unlocked',
        x: 58,
        y: 68,
        width: 26,
        height: 20,
        pinX: 71,
        pinY: 78,
        sqm: 45,
        notes: 'Housekeeping changing beach towels & aroma reed diffusers'
      }
    ],
    amenities: [
      {
        id: 'canggu-pool',
        name: '16m White Sand Horizon Pool',
        category: 'pool',
        status: 'operational',
        icon: 'waves',
        x: 36,
        y: 36,
        width: 24,
        height: 26,
        pinX: 48,
        pinY: 49,
        spec: '16m x 5m • Submerged Bar Stools & Shallow Tanning Shelf',
        details: 'White terrazzo with turquoise reflection, underwater lighting',
        lastCleaned: 'Today 07:00 WITA'
      },
      {
        id: 'canggu-bbq',
        name: 'Sunset Outdoor Grill & Bar Lounge',
        category: 'dining',
        status: 'operational',
        icon: 'utensils',
        x: 20,
        y: 42,
        width: 14,
        height: 20,
        pinX: 27,
        pinY: 52,
        spec: 'Weber Genesis Gas Grill • Teak Bar Counter • Ice Machine',
        details: 'Fully stocked cocktail glassware and organic coconut charcoal',
        lastCleaned: 'Yesterday 21:00'
      }
    ]
  }
};

export const PropertyGroundsMap: React.FC = () => {
  const { properties, setSelectedPropertyId, setActiveTab } = useApp();

  // Active property selection
  const [selectedPropId, setSelectedPropId] = useState<string>(properties[0]?.id || 'prop-1');

  // Layer Visibility Toggles (Amenities & Guest Rooms)
  const [showAmenities, setShowAmenities] = useState<boolean>(true);
  const [showGuestRooms, setShowGuestRooms] = useState<boolean>(true);
  const [showUtilities, setShowUtilities] = useState<boolean>(true);

  // Selected item on map for details drawer
  const [selectedItem, setSelectedItem] = useState<{
    type: 'room' | 'amenity';
    data: EstateRoom | EstateAmenity;
  } | null>(null);

  // Search/Filter query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Get active layout or fallback to prop-1
  const layout = useMemo<EstateLayout>(() => {
    return ESTATE_LAYOUTS[selectedPropId] || ESTATE_LAYOUTS['prop-1'];
  }, [selectedPropId]);

  // Active selected property from app context
  const activeProperty = useMemo<Property | undefined>(() => {
    return properties.find(p => p.id === selectedPropId) || properties[0];
  }, [properties, selectedPropId]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (!showGuestRooms) return [];
    if (!searchQuery.trim()) return layout.rooms;
    const q = searchQuery.toLowerCase();
    return layout.rooms.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.pavilion.toLowerCase().includes(q) || 
      (r.guestName && r.guestName.toLowerCase().includes(q))
    );
  }, [layout.rooms, showGuestRooms, searchQuery]);

  // Filtered amenities
  const filteredAmenities = useMemo(() => {
    if (!showAmenities) return [];
    let list = layout.amenities;
    if (!showUtilities) {
      list = list.filter(a => a.category !== 'utility');
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(a => 
      a.name.toLowerCase().includes(q) || 
      a.category.toLowerCase().includes(q) || 
      a.details.toLowerCase().includes(q)
    );
  }, [layout.amenities, showAmenities, showUtilities, searchQuery]);

  // Counts for layer badges
  const roomCount = layout.rooms.length;
  const occupiedRoomCount = layout.rooms.filter(r => r.status === 'occupied').length;
  const amenityCount = layout.amenities.length;

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 1.6));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.9));
  const handleResetZoom = () => setZoomLevel(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-400',
          text: 'text-amber-800',
          dot: 'bg-amber-500'
        };
      case 'vacant':
      case 'inspected':
      case 'operational':
        return {
          bg: 'bg-emerald-100',
          border: 'border-emerald-400',
          text: 'text-emerald-800',
          dot: 'bg-emerald-500'
        };
      case 'cleaning':
      case 'in_use':
        return {
          bg: 'bg-sky-100',
          border: 'border-sky-400',
          text: 'text-sky-800',
          dot: 'bg-sky-500'
        };
      case 'maintenance':
        return {
          bg: 'bg-rose-100',
          border: 'border-rose-400',
          text: 'text-rose-800',
          dot: 'bg-rose-500'
        };
      default:
        return {
          bg: 'bg-stone-100',
          border: 'border-stone-300',
          text: 'text-stone-700',
          dot: 'bg-stone-400'
        };
    }
  };

  return (
    <div 
      id="property-grounds-map-module"
      className="bg-white rounded-3xl border border-[#E8E6E1] p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#F2F1ED] pb-4">
        {/* Module Title & Property Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FEFAE0] border border-[#F1EDD4] flex items-center justify-center text-[#606C38] shrink-0">
            <Compass className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-lg text-[#2D2926]">
                Villa Grounds & Estate Map
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEFAE0] text-[#606C38] border border-[#F1EDD4]">
                Interactive Site Plan
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Architectural layout of pavilions, guest suites, private pool, and outdoor amenities
            </p>
          </div>
        </div>

        {/* Property Selector & Quick Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Villa Selector */}
          <div className="relative">
            <select
              id="select-map-villa"
              value={selectedPropId}
              onChange={(e) => {
                setSelectedPropId(e.target.value);
                setSelectedItem(null);
              }}
              className="bg-[#FAF9F6] border border-[#E8E6E1] text-xs font-bold text-[#2D2926] rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38] cursor-pointer"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.area})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find suite or amenity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl text-xs text-[#2D2926] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38] w-40 sm:w-48 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Layer Visibility Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F6] p-3 rounded-2xl border border-[#E8E6E1]">
        {/* Layer Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center space-x-1.5 mr-1">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>Map Layers:</span>
          </span>

          {/* Toggle Guest Rooms */}
          <button
            id="toggle-layer-rooms"
            onClick={() => setShowGuestRooms(!showGuestRooms)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              showGuestRooms 
                ? 'bg-white text-[#2D2926] shadow-2xs border border-[#606C38]' 
                : 'bg-stone-200/50 text-stone-400 border border-transparent line-through'
            }`}
          >
            {showGuestRooms ? <Eye className="w-3.5 h-3.5 text-[#606C38]" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
            <Bed className="w-3.5 h-3.5 text-[#BC6C25]" />
            <span>Guest Rooms ({roomCount})</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FEFAE0] text-[#606C38]">
              {occupiedRoomCount} Occ
            </span>
          </button>

          {/* Toggle Amenities */}
          <button
            id="toggle-layer-amenities"
            onClick={() => setShowAmenities(!showAmenities)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              showAmenities 
                ? 'bg-white text-[#2D2926] shadow-2xs border border-[#606C38]' 
                : 'bg-stone-200/50 text-stone-400 border border-transparent line-through'
            }`}
          >
            {showAmenities ? <Eye className="w-3.5 h-3.5 text-[#606C38]" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
            <Waves className="w-3.5 h-3.5 text-sky-600" />
            <span>Amenities ({amenityCount})</span>
          </button>

          {/* Toggle Utilities (Hotspots, Gate, Power) */}
          <button
            id="toggle-layer-utilities"
            onClick={() => setShowUtilities(!showUtilities)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
              showUtilities 
                ? 'bg-white text-stone-700 border border-stone-200' 
                : 'bg-stone-200/50 text-stone-400 border border-transparent'
            }`}
          >
            <Wifi className="w-3 h-3 text-stone-500" />
            <span>Utilities & Gate</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-mono text-stone-400 mr-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-white border border-[#E8E6E1] text-stone-600 hover:text-stone-900 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-white border border-[#E8E6E1] text-stone-600 hover:text-stone-900 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg bg-white border border-[#E8E6E1] text-stone-600 hover:text-stone-900 transition-colors"
            title="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Stage & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Interactive Architectural Canvas */}
        <div className="lg:col-span-2 relative bg-[#F7F6F2] rounded-2xl border border-[#E8E6E1] overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col justify-between select-none">
          {/* Subtle Estate Grounds Coordinate Grid & Orientation Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
            <div className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-xs border border-stone-200 shadow-2xs text-[11px] font-bold text-stone-700 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-[#BC6C25]" />
              <span>North (Facing Ocean / Canyon)</span>
            </div>
            <div className="px-2 py-1 rounded-xl bg-white/90 backdrop-blur-xs border border-stone-200 shadow-2xs text-[10px] text-stone-500 font-mono">
              {layout.totalAreaSqm} m² Grounds
            </div>
          </div>

          {/* Map Canvas with Scaling */}
          <div 
            className="relative w-full h-full flex-1 flex items-center justify-center p-4 transition-transform duration-200 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* SVG Architectural Estate Plan Representation */}
            <svg 
              viewBox="0 0 1000 650" 
              className="w-full h-full max-h-[440px] drop-shadow-xs"
            >
              <defs>
                {/* Grass & Tropical Garden Pattern */}
                <pattern id="gardenPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="40" height="40" fill="#EAECE1" />
                  <circle cx="8" cy="8" r="1.5" fill="#D2DAC1" opacity="0.6" />
                  <circle cx="28" cy="24" r="1.5" fill="#D2DAC1" opacity="0.6" />
                  <path d="M 16,32 Q 20,24 24,32" stroke="#C5D0B1" strokeWidth="1" fill="none" opacity="0.5" />
                </pattern>

                {/* Pool Turquoise Gradient */}
                <linearGradient id="poolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#48CAE4" />
                  <stop offset="50%" stopColor="#0096C7" />
                  <stop offset="100%" stopColor="#023E8A" />
                </linearGradient>

                {/* Teak Wood Decking Pattern */}
                <pattern id="teakDeck" width="10" height="40" patternUnits="userSpaceOnUse">
                  <rect width="10" height="40" fill="#E2C799" />
                  <line x1="0" y1="0" x2="0" y2="40" stroke="#C4A470" strokeWidth="0.75" />
                  <line x1="10" y1="0" x2="10" y2="40" stroke="#C4A470" strokeWidth="0.75" />
                </pattern>

                {/* Volcanic Stone Pathway Pattern */}
                <pattern id="stonePath" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#DCDAD5" />
                  <circle cx="6" cy="6" r="4" fill="#CCC9C2" stroke="#B8B5AE" strokeWidth="0.5" />
                  <circle cx="16" cy="14" r="4.5" fill="#CCC9C2" stroke="#B8B5AE" strokeWidth="0.5" />
                </pattern>

                {/* Pavilion Roof Pattern */}
                <pattern id="alangAlang" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#F4EAD4" />
                  <line x1="0" y1="0" x2="20" y2="20" stroke="#E2D4B6" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Estate Perimeter Wall / Boundary */}
              <rect 
                x="40" y="30" width="920" height="590" rx="20" 
                fill="url(#gardenPattern)" 
                stroke="#C7C4BC" 
                strokeWidth="4" 
              />

              {/* Garden Stone Pathways Connecting Pavilions */}
              <path 
                d="M 120,320 L 220,320 L 320,320 L 460,320 L 600,320 L 750,320 M 320,160 L 320,480 M 740,160 L 740,480 M 460,200 L 460,480" 
                stroke="url(#stonePath)" 
                strokeWidth="24" 
                strokeLinecap="round" 
                fill="none" 
              />

              {/* Natural Terrazzo Infinity Pool Zone */}
              <g className="cursor-pointer" onClick={() => {
                const poolAmenity = layout.amenities.find(a => a.category === 'pool');
                if (poolAmenity) setSelectedItem({ type: 'amenity', data: poolAmenity });
              }}>
                {/* Teak Wood Deck Around Pool */}
                <rect 
                  x="330" y="210" width="260" height="200" rx="14" 
                  fill="url(#teakDeck)" 
                  stroke="#A88B58" 
                  strokeWidth="2" 
                />
                {/* Water Basin */}
                <rect 
                  x="350" y="235" width="220" height="150" rx="10" 
                  fill="url(#poolGrad)" 
                  stroke="#0077B6" 
                  strokeWidth="2" 
                  opacity="0.95"
                />
                {/* Pool Ripple Water Lines */}
                <path d="M 370,270 Q 420,260 480,270 T 540,270" stroke="#90E0EF" strokeWidth="1.5" fill="none" opacity="0.7" />
                <path d="M 390,320 Q 440,310 500,320 T 530,320" stroke="#90E0EF" strokeWidth="1.5" fill="none" opacity="0.7" />
                <text x="460" y="315" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" letterSpacing="1" opacity="0.85">
                  INFINITY POOL
                </text>
              </g>

              {/* Architectural Pavilion Ground Prints */}
              {/* North Master Pavilion Base */}
              <rect x="170" y="70" width="260" height="160" rx="8" fill="#FDFBF7" stroke="#9C9588" strokeWidth="2.5" />
              {/* East Wing Suites Base */}
              <rect x="610" y="70" width="260" height="150" rx="8" fill="#FDFBF7" stroke="#9C9588" strokeWidth="2.5" />
              <rect x="610" y="250" width="260" height="150" rx="8" fill="#FDFBF7" stroke="#9C9588" strokeWidth="2.5" />
              {/* South Pavilion Base */}
              <rect x="170" y="410" width="260" height="150" rx="8" fill="#FDFBF7" stroke="#9C9588" strokeWidth="2.5" />
              {/* Dining & Chef Pavilion Base */}
              <rect x="450" y="430" width="210" height="130" rx="8" fill="#FBF8EE" stroke="#A88B58" strokeWidth="2" />
              {/* Spa Bale Base */}
              <rect x="730" y="440" width="150" height="120" rx="8" fill="#FBF8EE" stroke="#606C38" strokeWidth="2" />
              {/* Living Bale Center Base */}
              <rect x="170" y="255" width="150" height="130" rx="8" fill="#F5EFE1" stroke="#BC6C25" strokeWidth="2" />
              {/* Gate & Security Entry */}
              <rect x="60" y="260" width="90" height="120" rx="6" fill="#E8E5DD" stroke="#8A857A" strokeWidth="2" />

              {/* Decorative Palm Trees on Grounds */}
              {[
                { cx: 120, cy: 120 },
                { cx: 500, cy: 110 },
                { cx: 890, cy: 110 },
                { cx: 120, cy: 520 },
                { cx: 890, cy: 520 },
                { cx: 680, cy: 520 },
              ].map((tree, i) => (
                <g key={i} opacity="0.85">
                  <circle cx={tree.cx} cy={tree.cy} r="18" fill="#A4B48A" />
                  <circle cx={tree.cx} cy={tree.cy} r="14" fill="#606C38" />
                  <circle cx={tree.cx} cy={tree.cy} r="3" fill="#3D4523" />
                  <path d={`M ${tree.cx-16},${tree.cy} Q ${tree.cx},${tree.cy-16} ${tree.cx+16},${tree.cy}`} stroke="#4C572C" strokeWidth="1.5" fill="none" />
                  <path d={`M ${tree.cx},${tree.cy-16} Q ${tree.cx+16},${tree.cy} ${tree.cx},${tree.cy+16}`} stroke="#4C572C" strokeWidth="1.5" fill="none" />
                </g>
              ))}
            </svg>

            {/* OVERLAY LAYER: Guest Rooms Interactive Hotspots */}
            {showGuestRooms && filteredRooms.map((room) => {
              const statusTheme = getStatusColor(room.status);
              const isSelected = selectedItem?.data.id === room.id;

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedItem({ type: 'room', data: room })}
                  style={{
                    left: `${room.pinX}%`,
                    top: `${room.pinY}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-200 group ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                  }`}
                >
                  <div className={`px-2.5 py-1.5 rounded-xl border shadow-md flex items-center space-x-1.5 transition-all ${
                    isSelected 
                      ? 'bg-[#2D2926] text-white border-white ring-4 ring-[#606C38]/30' 
                      : 'bg-white/95 backdrop-blur-xs text-[#2D2926] border-stone-300 hover:border-[#606C38]'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${statusTheme.dot} shrink-0 animate-pulse`} />
                    <Bed className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#BC6C25]'}`} />
                    <span className="text-xs font-bold whitespace-nowrap">
                      {room.name.split(' (')[0]}
                    </span>
                    {room.status === 'occupied' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Occ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* OVERLAY LAYER: Amenities Interactive Hotspots */}
            {showAmenities && filteredAmenities.map((amenity) => {
              const isSelected = selectedItem?.data.id === amenity.id;
              
              return (
                <div
                  key={amenity.id}
                  onClick={() => setSelectedItem({ type: 'amenity', data: amenity })}
                  style={{
                    left: `${amenity.pinX}%`,
                    top: `${amenity.pinY}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-200 group ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                  }`}
                >
                  <div className={`px-2 py-1 rounded-xl border shadow-md flex items-center space-x-1.5 transition-all ${
                    isSelected 
                      ? 'bg-[#606C38] text-white border-white ring-4 ring-[#606C38]/30' 
                      : 'bg-white/90 backdrop-blur-xs text-stone-800 border-stone-300 hover:border-[#606C38]'
                  }`}>
                    {amenity.category === 'pool' && <Waves className="w-3.5 h-3.5 text-sky-500" />}
                    {amenity.category === 'dining' && <Utensils className="w-3.5 h-3.5 text-amber-600" />}
                    {amenity.category === 'wellness' && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                    {amenity.category === 'lounge' && <Sun className="w-3.5 h-3.5 text-orange-500" />}
                    {amenity.category === 'utility' && <Wifi className="w-3.5 h-3.5 text-teal-600" />}
                    <span className="text-[11px] font-bold whitespace-nowrap">
                      {amenity.name.split(' ')[0]} {amenity.name.split(' ')[1] || ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Map Legend Bar */}
          <div className="p-3 bg-white/90 backdrop-blur-xs border-t border-[#E8E6E1] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-stone-400 font-bold uppercase text-[10px]">Room Status:</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-stone-600 font-medium text-[11px]">Occupied</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-stone-600 font-medium text-[11px]">Vacant / Ready</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-stone-600 font-medium text-[11px]">Housekeeping</span>
              </div>
            </div>

            <span className="text-[11px] text-stone-400">
              Click any pavilion or pin on the map to inspect live telemetry
            </span>
          </div>
        </div>

        {/* Right Inspector Drawer / Telemetry Panel */}
        <div className="flex flex-col justify-between bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] p-4 sm:p-5">
          {selectedItem ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Item Header */}
              <div className="flex items-start justify-between border-b border-[#E8E6E1] pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {selectedItem.type === 'room' ? 'Guest Suite Inspector' : 'Amenity Telemetry'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      getStatusColor(selectedItem.data.status).bg
                    } ${getStatusColor(selectedItem.data.status).text} border ${
                      getStatusColor(selectedItem.data.status).border
                    }`}>
                      {selectedItem.data.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base sm:text-lg text-[#2D2926] mt-1">
                    {selectedItem.data.name}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {selectedItem.type === 'room' 
                      ? (selectedItem.data as EstateRoom).pavilion 
                      : (selectedItem.data as EstateAmenity).spec}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Room Specific Telemetry */}
              {selectedItem.type === 'room' && (
                <div className="space-y-3 text-xs">
                  {/* Guest Stay Card */}
                  {(selectedItem.data as EstateRoom).guestName ? (
                    <div className="p-3 bg-white rounded-xl border border-[#E8E6E1] space-y-1">
                      <div className="text-[10px] font-bold text-stone-400 uppercase">In-House Guest</div>
                      <div className="font-bold text-[#2D2926] text-sm flex items-center justify-between">
                        <span>{(selectedItem.data as EstateRoom).guestName}</span>
                        <span className="text-[10px] font-normal text-emerald-700 font-mono">Verified Stay</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {(selectedItem.data as EstateRoom).notes}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-0.5">
                      <div className="font-bold text-xs">Room Inspected & Ready</div>
                      <div className="text-[11px]">Ready for arrival. Temperature pre-cooled to 23°C.</div>
                    </div>
                  )}

                  {/* Bed & Bath Specs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-white rounded-xl border border-[#E8E6E1]">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Bed Configuration</span>
                      <span className="font-medium text-[#2D2926] mt-0.5 block">
                        {(selectedItem.data as EstateRoom).bedType}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-[#E8E6E1]">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Suite Area</span>
                      <span className="font-medium text-[#2D2926] mt-0.5 block">
                        {(selectedItem.data as EstateRoom).sqm} m² Pavilion
                      </span>
                    </div>
                  </div>

                  {/* Smart Lock & AC Controls */}
                  <div className="p-3 bg-white rounded-xl border border-[#E8E6E1] space-y-2">
                    <div className="text-[10px] font-bold text-stone-400 uppercase">In-Room IoT Controls</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-1.5 text-stone-600">
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Smart Lock</span>
                      </span>
                      <span className="font-bold text-[#606C38]">
                        {(selectedItem.data as EstateRoom).doorLockStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                      <span className="flex items-center space-x-1.5 text-stone-600">
                        <Sun className="w-3.5 h-3.5 text-stone-400" />
                        <span>Climate AC</span>
                      </span>
                      <span className="font-bold text-[#2D2926]">
                        {(selectedItem.data as EstateRoom).acTemp}°C Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Amenity Specific Telemetry */}
              {selectedItem.type === 'amenity' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#E8E6E1] space-y-1.5">
                    <div className="text-[10px] font-bold text-stone-400 uppercase">Operational Status</div>
                    <p className="text-stone-700 leading-relaxed font-medium">
                      {(selectedItem.data as EstateAmenity).details}
                    </p>
                    {(selectedItem.data as EstateAmenity).lastCleaned && (
                      <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 flex items-center justify-between">
                        <span>Maintenance Timestamp:</span>
                        <span className="font-mono text-stone-600">{(selectedItem.data as EstateAmenity).lastCleaned}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-[#FEFAE0] rounded-xl border border-[#F1EDD4] text-[#606C38] space-y-1">
                    <div className="font-bold text-xs flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Estate Hospitality Recommendation</span>
                    </div>
                    <p className="text-xs text-stone-700">
                      Setup towels, chilled bottled water, and ensure ambient evening lanterns are primed.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setActiveTab('operations')}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#606C38] hover:bg-[#4C572C] text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1 shadow-2xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Dispatch Task</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedPropertyId(selectedPropId);
                    setActiveTab('properties');
                  }}
                  className="py-2 px-3 rounded-xl bg-white border border-[#E8E6E1] text-stone-700 hover:text-stone-900 font-bold text-xs transition-colors"
                >
                  Villa Profile
                </button>
              </div>
            </div>
          ) : (
            /* Empty State when no item is selected */
            <div className="py-8 text-center space-y-3 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E6E1] flex items-center justify-center mx-auto text-[#606C38] shadow-2xs">
                <MapPin className="w-6 h-6 text-[#BC6C25]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#2D2926]">
                  Grounds Telemetry & Quick Inspector
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Select any guest suite pavilion or amenity pin on the estate map to view IoT status, guest details, and operational protocols.
                </p>
              </div>

              {/* Quick Jump List */}
              <div className="pt-3 border-t border-[#E8E6E1] text-left">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Estate Highlights ({layout.rooms.length} Suites • {layout.amenities.length} Amenities)
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {layout.rooms.slice(0, 3).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedItem({ type: 'room', data: r })}
                      className="w-full text-left p-2 rounded-xl bg-white border border-stone-200 hover:border-[#606C38] text-xs flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium text-[#2D2926] truncate">{r.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStatusColor(r.status).bg} ${getStatusColor(r.status).text}`}>
                        {r.status}
                      </span>
                    </button>
                  ))}
                  {layout.amenities.slice(0, 2).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedItem({ type: 'amenity', data: a })}
                      className="w-full text-left p-2 rounded-xl bg-white border border-stone-200 hover:border-[#606C38] text-xs flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium text-[#2D2926] truncate">{a.name}</span>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                        Amenity
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
