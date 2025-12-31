'use client'

import React, { useState, useEffect } from 'react'
import { Map, Marker, ZoomControl } from 'pigeon-maps'
import { VIETNAM_LOCATIONS, Location } from '@/constants/locations'
import { weatherService } from '@/lib/weather'

interface LocationMapProps {
  selectedLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  onLocationSelect: (location: Location) => void;
  height?: string;
}

/**
 * Component bản đồ Việt Nam sử dụng Pigeon Maps (Client Component)
 * Dùng cho Next.js, tích hợp Tailwind CSS
 */
export default function LocationMap({ 
  selectedLocation, 
  onLocationSelect,
  height = '400px'
}: LocationMapProps) {
  // Center map state
  const [center, setCenter] = useState<[number, number]>([
    selectedLocation.latitude, 
    selectedLocation.longitude
  ]);
  const [zoom, setZoom] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Update center khi selectedLocation thay đổi
  useEffect(() => {
    setCenter([selectedLocation.latitude, selectedLocation.longitude]);
  }, [selectedLocation.latitude, selectedLocation.longitude]);

  /**
   * Xử lý khi click vào bản đồ
   */
  const handleMapClick = async ({ latLng }: { latLng: [number, number] }) => {
    const [lat, lng] = latLng;
    setIsLoading(true);
    
    try {
      // Lấy tên địa điểm chi tiết từ tọa độ
      const detailedName = await weatherService.getPlaceName(lat, lng);
      
      // Tạo location mới với thông tin chi tiết
      const newLocation: Location = {
        id: `custom-location-${Date.now()}`,
        name: detailedName || `Tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        latitude: lat,
        longitude: lng,
        region: 'Vị trí đã chọn'
      };
      
      onLocationSelect(newLocation);
    } catch (error) {
      console.error('Lỗi khi chọn vị trí:', error);
      // Nếu lỗi hệ thống chọn địa điểm gần nhất trong danh sách
      onLocationSelect({
        id: `custom-location-${Date.now()}`,
        name: `Vị trí (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        latitude: lat,
        longitude: lng,
        region: 'Vị trí đã chọn'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative w-full overflow-hidden border border-agri-100 rounded-3xl bg-gray-50"
      style={{ height }}
    >
      <Map 
        height={parseInt(height)}
        center={center} 
        zoom={zoom} 
        onBoundsChanged={({ center, zoom }: { center: [number, number], zoom: number }) => { 
          setCenter(center); 
          setZoom(zoom); 
        }}
        onClick={handleMapClick}
      >
        <ZoomControl />
        
        {/* Marker cho vị trí đang chọn (Màu đỏ nông nghiệp) */}
        <Marker 
          width={45}
          anchor={[selectedLocation.latitude, selectedLocation.longitude]} 
          color="#ef4444" 
        />

        {/* Markers cho các tỉnh thành chính (Màu xanh nông nghiệp) */}
        {VIETNAM_LOCATIONS.map(loc => (
          <Marker 
            key={loc.id}
            width={24}
            anchor={[loc.latitude, loc.longitude]} 
            color="#059669"
            onClick={() => onLocationSelect(loc)}
          />
        ))}
      </Map>
      
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-agri-50 z-[10] text-[11px] font-bold text-agri-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
        <span>Mẹo: Lăn chuột để phóng to. Click trực tiếp lên bản đồ để chọn vị trí chính xác của ruộng vườn.</span>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[1000] animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-agri-200 border-t-agri-600 rounded-full animate-spin"></div>
            <p className="text-agri-800 font-black text-xs uppercase tracking-widest">Đang xác định địa danh...</p>
          </div>
        </div>
      )}
    </div>
  );
}
