import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { X, Search, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DamageType = 'scratch' | 'dent' | 'crack' | 'broken';
type InspectionView = 'top' | 'side' | 'front' | 'back';

export interface InspectionMarker {
  id: string;
  x: number; // percentage
  y: number; // percentage
  type: DamageType;
  view: InspectionView;
  notes?: string;
}

interface VisualInspectionMapProps {
  markers: InspectionMarker[];
  onAddMarker: (marker: InspectionMarker) => void;
  onRemoveMarker: (id: string) => void;
}

export function VisualInspectionMap({ markers, onAddMarker, onRemoveMarker }: VisualInspectionMapProps) {
  const [activeView, setActiveView] = useState<InspectionView>('side');
  
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>, view: InspectionView) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Default to scratch for now, popover will allow change
    const newMarker: InspectionMarker = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      type: 'scratch',
      view
    };
    onAddMarker(newMarker);
  };

  const getMarkerColor = (type: DamageType) => {
    switch (type) {
      case 'scratch': return 'bg-yellow-500';
      case 'dent': return 'bg-orange-500';
      case 'crack': return 'bg-red-500';
      default: return 'bg-destructive';
    }
  };

  const views = [
    { id: 'top', label: 'Top View' },
    { id: 'side', label: 'Side View' },
    { id: 'front', label: 'Front' },
    { id: 'back', label: 'Back' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="bg-primary/10 p-2 rounded-xl">
             <Search className="h-4 w-4 text-primary" />
           </div>
           <div>
             <h3 className="text-sm font-bold">Exterior Condition Map</h3>
             <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Standard 360° Inspection</p>
           </div>
        </div>
        <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl border border-border/40">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id as InspectionView)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                activeView === v.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative aspect-[16/9] bg-secondary/10 rounded-[32px] border border-dashed border-border/60 overflow-hidden flex items-center justify-center group">
         {/* Instruction Overlay */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border/40 shadow-xl flex items-center gap-2">
              <Info className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold">Click anywhere on the diagram to mark damage</span>
            </div>
         </div>

         <div className="relative w-full h-full max-w-[80%] max-h-[80%] flex items-center justify-center cursor-crosshair" onClick={(e) => handleContainerClick(e, activeView)}>
            {/* Conditional SVG Rendering based on View */}
            <AnimatePresence mode="wait">
               <motion.div
                 key={activeView}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.05 }}
                 className="w-full h-full"
               >
                 {activeView === 'top' && <CarTopSVG />}
                 {activeView === 'side' && <CarSideSVG />}
                 {activeView === 'front' && <CarFrontSVG />}
                 {activeView === 'back' && <CarBackSVG />}
               </motion.div>
            </AnimatePresence>

            {/* Markers */}
            {markers.filter(m => m.view === activeView).map((marker) => (
              <div
                key={marker.id}
                className="absolute z-10"
                style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={(e) => e.stopPropagation()}
              >
                 <Popover>
                    <PopoverTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center ${getMarkerColor(marker.type)} group/marker`}
                      >
                         <div className="w-1 h-1 bg-white rounded-full animate-ping opacity-70" />
                      </motion.div>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3 rounded-2xl shadow-2xl border-border/60" side="top">
                       <div className="space-y-3">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold uppercase text-muted-foreground">Classify Damage</span>
                             <button onClick={() => onRemoveMarker(marker.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded-lg transition-colors">
                               <X className="h-3 w-3" />
                             </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             {(['scratch', 'dent', 'crack', 'broken'] as DamageType[]).map((t) => (
                               <button
                                 key={t}
                                 onClick={() => {
                                   marker.type = t;
                                   onAddMarker({...marker}); // Re-add/Update
                                 }}
                                 className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold capitalize transition-all ${
                                   marker.type === t 
                                     ? 'bg-primary/10 border-primary/40 text-primary' 
                                     : 'bg-secondary/20 border-border/40 text-muted-foreground hover:bg-secondary/40'
                                 }`}
                               >
                                 {t}
                               </button>
                             ))}
                          </div>
                       </div>
                    </PopoverContent>
                 </Popover>
              </div>
            ))}
         </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {markers.map((m) => (
          <Badge key={m.id} variant="secondary" className="pl-1 pr-2 py-1 gap-1.5 rounded-lg border-border/40 flex items-center text-[10px] font-medium">
             <div className={`w-2 h-2 rounded-full ${getMarkerColor(m.type)}`} />
             <span className="capitalize">{m.type} on {m.view}</span>
             <button onClick={() => onRemoveMarker(m.id)} className="hover:text-destructive">
               <X className="h-3 w-3" />
             </button>
          </Badge>
        ))}
        {markers.length === 0 && (
          <p className="text-[10px] text-muted-foreground italic">No damage markers added yet. Click diagram to start.</p>
        )}
      </div>
    </div>
  );
}

// Detailed Realistic Car SVGs for Vehicle Views

function CarSideSVG() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full text-foreground/90 drop-shadow-2xl translate-y-2">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 0.15 }} />
          <stop offset="50%" style={{ stopColor: 'currentColor', stopOpacity: 0.05 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.2 }} />
        </linearGradient>
        <linearGradient id="windowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 0.2 }} />
          <stop offset="50%" style={{ stopColor: 'currentColor', stopOpacity: 0.05 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.3 }} />
        </linearGradient>
      </defs>
      {/* Ground Shadow */}
      <ellipse cx="100" cy="74" rx="85" ry="4" fill="currentColor" fillOpacity="0.05" />
      
      {/* Main Body Shell */}
      <path 
        d="M25,62 L15,62 C10,62 8,58 10,54 C12,48 18,34 35,28 C50,22 80,18 100,18 C120,18 150,22 170,35 C185,45 190,55 190,62 L180,62 C180,62 180,55 175,50 C165,42 145,40 130,32 C115,24 85,24 70,32 C55,40 35,42 25,50 Z" 
        fill="url(#bodyGrad)" 
        stroke="currentColor" 
        strokeWidth="1.2" 
      />
      <path d="M10,54 L190,54" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
      
      {/* Lower Body Work */}
      <path d="M30,54 L175,54 L180,62 L20,62 Z" fill="currentColor" fillOpacity="0.05" />

      {/* Windows Section */}
      <path d="M72,30 L100,22 L132,30 L128,42 L76,42 Z" fill="url(#windowGrad)" stroke="currentColor" strokeWidth="1" />
      <path d="M100,22 L100,42" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
      <path d="M72,30 L65,35 L65,42 L76,42" fill="url(#windowGrad)" stroke="currentColor" strokeWidth="0.8" />
      <path d="M132,30 L145,35 L145,42 L128,42" fill="url(#windowGrad)" stroke="currentColor" strokeWidth="0.8" />

      {/* Door Lines */}
      <path d="M100,42 L100,62" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
      <path d="M65,42 L65,58" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
      <path d="M145,42 L145,58" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
      
      {/* Handles */}
      <rect x="105" y="46" width="10" height="2" rx="1" fill="currentColor" fillOpacity="0.3" />
      <rect x="70" y="46" width="10" height="2" rx="1" fill="currentColor" fillOpacity="0.3" />

      {/* Wheels & Arches */}
      <path d="M35,62 A20,20 0 0,1 75,62" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
      <circle cx="55" cy="62" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="55" cy="62" r="11" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
      <circle cx="55" cy="62" r="4" fill="currentColor" fillOpacity="0.1" />

      <path d="M125,62 A20,20 0 0,1 165,62" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
      <circle cx="145" cy="62" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="145" cy="62" r="11" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
      <circle cx="145" cy="62" r="4" fill="currentColor" fillOpacity="0.1" />

      {/* Fuel Cap */}
      <circle cx="165" cy="45" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
      
      {/* Mirror */}
      <path d="M70,35 L62,35 C60,35 60,38 62,38 L70,38" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

function CarTopSVG() {
  return (
    <svg viewBox="0 0 100 240" className="w-full h-full text-foreground/90 drop-shadow-2xl">
      <defs>
        <linearGradient id="topBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 0.1 }} />
          <stop offset="50%" style={{ stopColor: 'currentColor', stopOpacity: 0.05 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.15 }} />
        </linearGradient>
      </defs>
      {/* Outer Body Shell (Organic Curves) */}
      <path 
        d="M15,50 C15,30 35,20 50,20 C65,20 85,30 85,50 L88,190 C88,210 70,220 50,220 C30,220 12,210 12,190 Z" 
        fill="url(#topBodyGrad)" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      
      {/* Hood Lines */}
      <path d="M25,55 Q50,45 75,55" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
      <path d="M30,35 Q50,25 70,35" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
      
      {/* Windshield & Roof */}
      <path d="M22,70 L78,70 L75,85 L25,85 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" />
      <rect x="25" y="85" width="50" height="70" rx="8" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" />
      {/* Sunroof */}
      <rect x="35" y="95" width="30" height="20" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
      
      {/* Rear Glass */}
      <path d="M25,155 L75,155 L78,175 L22,175 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" />
      <path d="M40,165 H60" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />

      {/* Trunk Line */}
      <path d="M18,185 Q50,195 82,185" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
      
      {/* Side Mirrors */}
      <path d="M8,80 L15,80" stroke="currentColor" strokeWidth="2" strokeOpacity="0.1" />
      <rect x="5" y="75" width="8" height="10" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
      <path d="M92,80 L85,80" stroke="currentColor" strokeWidth="2" strokeOpacity="0.1" />
      <rect x="87" y="75" width="8" height="10" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

function CarFrontSVG() {
  return (
    <svg viewBox="0 0 150 100" className="w-full h-full text-foreground/90 drop-shadow-2xl translate-y-4">
      <defs>
        <radialGradient id="headlightGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.05 }} />
        </radialGradient>
      </defs>
      {/* Hood & Windshield */}
      <path 
        d="M30,40 C30,30 40,20 75,20 C110,20 120,30 120,40" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      <path d="M40,40 L110,40 L100,25 L50,25 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" />
      
      {/* Side Mirrors */}
      <rect x="22" y="38" width="10" height="6" rx="3" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.8" />
      <rect x="118" y="38" width="10" height="6" rx="3" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.8" />

      {/* Main Front Fascia */}
      <path 
        d="M15,75 C15,60 20,45 35,40 L115,40 C130,45 135,60 135,75 L135,85 L15,85 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      
      {/* Headlights (More Realistic) */}
      <path d="M22,50 C22,45 35,45 42,52 L42,65 C35,68 22,65 22,60 Z" fill="url(#headlightGrad)" stroke="currentColor" strokeWidth="1" />
      <circle cx="28" cy="55" r="3" fill="currentColor" fillOpacity="0.4" />
      
      <path d="M128,50 C128,45 115,45 108,52 L108,65 C115,68 128,65 128,60 Z" fill="url(#headlightGrad)" stroke="currentColor" strokeWidth="1" />
      <circle cx="122" cy="55" r="3" fill="currentColor" fillOpacity="0.4" />

      {/* Grille */}
      <rect x="50" y="55" width="50" height="15" rx="4" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M55,60 H95 M55,65 H95" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
      
      {/* Bumper & Fog Lights */}
      <rect x="15" y="72" width="120" height="3" rx="1.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="30" cy="80" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
      <circle cx="120" cy="80" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
      
      {/* Tires from front */}
      <rect x="20" y="85" width="15" height="5" fill="currentColor" fillOpacity="0.2" />
      <rect x="115" y="85" width="15" height="5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

function CarBackSVG() {
  return (
    <svg viewBox="0 0 150 100" className="w-full h-full text-foreground/90 drop-shadow-2xl translate-y-4">
      {/* Roof & Rear Glass */}
      <path 
        d="M35,40 C35,30 45,20 75,20 C105,20 115,30 115,40" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      <path d="M42,40 L108,40 L100,25 L50,25 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" />
      {/* Defroster lines */}
      <path d="M55,30 H95 M53,34 H97 M51,38 H99" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.2" />

      {/* Rear Fascia */}
      <path 
        d="M15,75 C15,60 20,45 35,40 L115,40 C130,45 135,60 135,75 L135,85 L15,85 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      
      {/* Tail Lights */}
      <rect x="18" y="50" width="25" height="12" rx="3" fill="red" fillOpacity="0.2" stroke="red" strokeWidth="1" strokeOpacity="0.5" />
      <rect x="25" y="54" width="10" height="4" rx="1" fill="white" fillOpacity="0.3" />
      
      <rect x="107" y="50" width="25" height="12" rx="3" fill="red" fillOpacity="0.2" stroke="red" strokeWidth="1" strokeOpacity="0.5" />
      <rect x="115" y="54" width="10" height="4" rx="1" fill="white" fillOpacity="0.3" />

      {/* Trunk Details */}
      <rect x="55" y="58" width="40" height="12" rx="2" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
      <circle cx="75" cy="52" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
      
      {/* Exhaust Pipe */}
      <circle cx="120" cy="88" r="3" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
      <path d="M117,88 H130" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />

      {/* Bumper */}
      <rect x="15" y="78" width="120" height="5" rx="2.5" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}
