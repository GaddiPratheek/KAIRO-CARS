import React, { useCallback, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { Clock, ExternalLink, MapPin, Phone } from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import type { Showroom } from '../types/kairo';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface ShowroomMarkerProps {
  showroom: Showroom;
  isSelected: boolean;
  onSelect: (showroom: Showroom) => void;
}

const ShowroomMarker: React.FC<ShowroomMarkerProps> = ({
  showroom,
  isSelected,
  onSelect,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleMarkerClick = useCallback(() => {
    onSelect(showroom);
  }, [onSelect, showroom]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: showroom.lat, lng: showroom.lng }}
        title={`KAIRO ${showroom.city}`}
        onClick={handleMarkerClick}
      >
        <Pin
          background={isSelected ? '#E1C995' : '#C6A76B'}
          borderColor="#080808"
          glyphColor="#080808"
          scale={isSelected ? 1.25 : 1}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={() => onSelect(showroom)}
        >
          <div className="text-[#080808] p-1">
            <p className="font-semibold text-xs tracking-wider uppercase">{showroom.city}</p>
            <p className="text-xs font-medium mt-0.5">{showroom.regionLabel}</p>
            <p className="text-[11px] text-neutral-700 mt-1 leading-snug">{showroom.address}</p>
            <p className="text-[11px] text-neutral-600 mt-1">{showroom.hours}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${showroom.address}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-[11px] font-semibold underline text-neutral-900"
            >
              Get Directions
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const ShowroomsMapSection: React.FC = () => {
  const { showrooms } = useKairo();
  const [selectedId, setSelectedId] = useState<string>(showrooms[0]?.id || 'delhi-ncr');
  const activeShowroom = showrooms.find((s) => s.id === selectedId) || showrooms[0];

  const handleSelect = useCallback((showroom: Showroom) => {
    setSelectedId(showroom.id);
  }, []);

  return (
    <section className="py-20 bg-[#111111] border-t border-[#303030]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-12">
          <div>
            <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
              Private Viewing Salons
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-white mt-2">
              KAIRO Showroom Locations
            </h2>
          </div>
          <p className="text-xs text-[#A5A5A5] max-w-md">
            Sample demonstration lounge addresses editable by administrators in the KAIRO Console.
            Confirm appointments with concierge before travel.
          </p>
        </div>

        {/* Showroom Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {showrooms.map((showroom) => {
            const active = showroom.id === activeShowroom?.id;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              showroom.address
            )}`;

            return (
              <div
                key={showroom.id}
                onClick={() => setSelectedId(showroom.id)}
                className={`p-6 border transition-colors cursor-pointer flex flex-col justify-between ${
                  active
                    ? 'bg-[#181818] border-[#C6A76B]'
                    : 'bg-[#080808] border-[#303030] hover:border-[#C6A76B]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-nav text-xs tracking-[0.18em] uppercase text-[#C6A76B] font-semibold">
                      {showroom.city}
                    </span>
                    {showroom.isSample && (
                      <span className="text-[10px] text-[#707070] uppercase tracking-wider">
                        Sample Location
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg text-white mb-3">{showroom.regionLabel}</h3>

                  <div className="space-y-2.5 text-xs text-[#A5A5A5]">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C6A76B] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{showroom.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-[#C6A76B] shrink-0" />
                      <a
                        href={`tel:${showroom.phone.replace(/\s+/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-white tabular-nums"
                      >
                        {showroom.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-[#C6A76B] shrink-0" />
                      <span>{showroom.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#303030] flex items-center justify-between">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 font-nav text-[11px] tracking-[0.14em] uppercase text-[#E1C995] hover:text-white transition-colors"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-[11px] text-[#707070]">
                    {active ? 'Focused on Map' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Google Map */}
        <div className="border border-[#303030] bg-[#080808] overflow-hidden">
          {GOOGLE_MAPS_API_KEY && activeShowroom ? (
            <div className="w-full h-[420px]">
              <APIProvider
                apiKey={GOOGLE_MAPS_API_KEY}
                libraries={['marker']}
                language="en"
                region="IN"
              >
                <GoogleMap
                  mapId="DEMO_MAP_ID"
                  center={{ lat: activeShowroom.lat, lng: activeShowroom.lng }}
                  defaultZoom={12}
                  zoom={12}
                  gestureHandling="cooperative"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  {showrooms.map((s) => (
                    <ShowroomMarker
                      key={s.id}
                      showroom={s}
                      isSelected={s.id === activeShowroom.id}
                      onSelect={handleSelect}
                    />
                  ))}
                </GoogleMap>
              </APIProvider>
            </div>
          ) : (
            <div className="p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#141414]">
              <div>
                <p className="font-nav text-xs tracking-[0.18em] uppercase text-[#C6A76B]">
                  Active Salon · {activeShowroom?.city}
                </p>
                <h3 className="font-display text-2xl text-white mt-2">
                  {activeShowroom?.regionLabel}
                </h3>
                <p className="text-sm text-[#A5A5A5] mt-2">{activeShowroom?.address}</p>
                <p className="text-xs text-[#707070] mt-2 tabular-nums">
                  Coordinates: {activeShowroom?.lat.toFixed(4)}° N, {activeShowroom?.lng.toFixed(4)}° E
                </p>
              </div>
              {activeShowroom && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    activeShowroom.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center gap-2 shrink-0"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
