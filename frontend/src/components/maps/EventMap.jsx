import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../../lib/date';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function EventMap({ events, loading }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const infoWindowsRef = useRef([]);
    const navigate = useNavigate();
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState('');

    // Load Google Maps script
    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            setMapError('Google Maps API key not configured');
            return;
        }

        // Check if script already exists
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (existingScript && window.google && window.google.maps) {
            setMapLoaded(true);
            return;
        }

        if (existingScript) {
            return; // Script is loading
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            setTimeout(() => {
                if (window.google && window.google.maps && window.google.maps.Map) {
                    setMapLoaded(true);
                } else {
                    setMapError('Google Maps API loaded but Map constructor not available');
                }
            }, 100);
        };

        script.onerror = () => {
            setMapError('Failed to load Google Maps JavaScript API');
        };

        document.head.appendChild(script);
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

        try {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 43.6532, lng: -79.3832 }, // Toronto default
                zoom: 12,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
            });

            mapInstanceRef.current = map;
        } catch (err) {
            setMapError(`Map initialization error: ${err.message}`);
        }
    }, [mapLoaded]);

    // Update markers when events change
    useEffect(() => {
        if (!mapInstanceRef.current || !events || events.length === 0) return;

        const map = mapInstanceRef.current;

        // Clear existing markers and info windows
        markersRef.current.forEach(marker => marker.setMap(null));
        infoWindowsRef.current.forEach(iw => iw.close());
        markersRef.current = [];
        infoWindowsRef.current = [];

        // Create bounds to fit all markers
        const bounds = new window.google.maps.LatLngBounds();
        
        // Track positions to add slight offset for overlapping markers
        const positionCounts = new Map();
        const getOffsetPosition = (lat, lng) => {
            const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
            const count = positionCounts.get(key) || 0;
            positionCounts.set(key, count + 1);
            
            // Add small random offset for overlapping markers (max 0.0005 degrees ≈ 50m)
            if (count > 0) {
                const offset = 0.0003 * count;
                const angle = (count * 137.5) % 360; // Golden angle for distribution
                const rad = (angle * Math.PI) / 180;
                return {
                    lat: lat + offset * Math.cos(rad),
                    lng: lng + offset * Math.sin(rad),
                };
            }
            return { lat, lng };
        };

        events.forEach(event => {
            if (!event.latitude || !event.longitude) return;

            const position = getOffsetPosition(event.latitude, event.longitude);

            // Create marker
            const marker = new window.google.maps.Marker({
                position,
                map,
                title: event.name,
                icon: event.isFull
                    ? {
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: '#ef4444',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                      }
                    : {
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: '#10b981',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                      },
            });

            // Create info window content
            const capacityInfo = event.capacity
                ? `${event.numGuests}/${event.capacity} guests${event.isFull ? ' (FULL)' : ''}`
                : `${event.numGuests} guests`;

            const infoContent = `
                <div style="
                    padding: 16px;
                    min-width: 280px;
                    max-width: 320px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.5;
                ">
                    <h3 style="
                        margin: 0 0 12px 0;
                        padding: 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #1f2937;
                        line-height: 1.3;
                        word-wrap: break-word;
                    ">${event.name}</h3>
                    
                    <div style="margin-bottom: 12px;">
                        <p style="
                            margin: 0 0 6px 0;
                            padding: 0;
                            font-size: 14px;
                            color: #4b5563;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        ">
                            <span style="font-size: 16px;">📍</span>
                            <span style="word-wrap: break-word;">${event.location}</span>
                        </p >
                    </div>
                    
                    <div style="
                        margin-bottom: 12px;
                        padding: 8px 0;
                        border-top: 1px solid #e5e7eb;
                        border-bottom: 1px solid #e5e7eb;
                    ">
                        <p style="
                            margin: 0 0 4px 0;
                            padding: 0;
                            font-size: 12px;
                            color: #6b7280;
                            font-weight: 500;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        ">Time</p >
                        <p style="
                            margin: 0;
                            padding: 0;
                            font-size: 13px;
                            color: #374151;
                        ">
                            ${formatDateTime(event.startTime)}<br/>
                            <span style="color: #9ca3af;">to</span> ${formatDateTime(event.endTime)}
                        </p >
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <p style="
                            margin: 0;
                            padding: 0;
                            font-size: 13px;
                            color: #374151;
                        ">
                            <span style="
                                display: inline-block;
                                padding: 4px 8px;
                                background-color: ${event.isFull ? '#fee2e2' : '#d1fae5'};
                                color: ${event.isFull ? '#991b1b' : '#065f46'};
                                border-radius: 4px;
                                font-weight: 500;
                                font-size: 12px;
                            ">${capacityInfo}</span>
                        </p >
                    </div>
                    
                    <button 
                        onclick="window.openEventDetail(${event.id})"
                        style="
                            width: 100%;
                            margin-top: 4px;
                            padding: 10px 16px;
                            background: #3b82f6;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: background-color 0.2s;
                            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                        "
                        onmouseover="this.style.background='#2563eb'"
                        onmouseout="this.style.background='#3b82f6'"
                    >
                        View Details →
                    </button>
                </div>
            `;

            const infoWindow = new window.google.maps.InfoWindow({
                content: infoContent,
            });

            // Store function to open event detail
            if (!window.openEventDetail) {
                window.openEventDetail = (eventId) => {
                    navigate(`/events/${eventId}`);
                };
            }

            // Add click listener
            marker.addListener('click', () => {
                // Close all other info windows
                infoWindowsRef.current.forEach(iw => iw.close());
                infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
            infoWindowsRef.current.push(infoWindow);
            bounds.extend(position);
        });

        // Fit map to show all markers
        if (markersRef.current.length > 0) {
            map.fitBounds(bounds);
            // Don't zoom in too much if there's only one marker
            if (markersRef.current.length === 1) {
                map.setZoom(14);
            }
        }
    }, [events, mapLoaded, navigate]);

    if (mapError) {
        return (
            <div className="flex h-full items-center justify-center rounded-lg border border-error bg-error/10 p-8">
                <div className="text-center">
                    <p className="text-error font-semibold">Map Error</p >
                    <p className="text-sm text-error/80">{mapError}</p >
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '500px',
                    borderRadius: '8px',
                }}
            >
                {!mapLoaded && (
                    <div className="flex h-full items-center justify-center bg-base-200">
                        <div className="text-center">
                            <span className="loading loading-spinner text-primary"></span>
                            <p className="mt-2 text-sm text-neutral/70">Loading map...</p >
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
