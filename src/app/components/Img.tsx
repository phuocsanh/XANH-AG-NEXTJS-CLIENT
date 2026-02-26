'use client';

import ImageNext, { ImageProps } from "next/image";
import * as React from "react";

/**
 * Component hiển thị hình ảnh thông minh với khả năng fallback
 * 1. Thử dùng next/image để tối ưu hóa
 * 2. Nếu lỗi, thử dùng thẻ <img> thuần (hữu ích cho Cloudinary nếu hostname bị chặn)
 * 3. Nếu vẫn lỗi, hiển thị ảnh placeholder mặc định
 */
export default function Img({
  src,
  alt,
  className = "",
  classNameImg = "",
  ...rest
}: ImageProps & { className?: string; classNameImg?: string }) {
  const [imgError, setImgError] = React.useState(false);
  const [useNative, setUseNative] = React.useState(false);

  // Ảnh mặc định khi không có ảnh hoặc ảnh bị lỗi
  const placeholder = "/assets/leaf.png";
  
  // Xác định nguồn ảnh hiện tại
  let displaySrc = src || placeholder;
  if (imgError) {
    displaySrc = placeholder;
  }

  // Kiểm tra xem nguồn hiện tại có phải là link ngoài không
  const isExternal = typeof displaySrc === 'string' && (displaySrc.startsWith('http') || displaySrc.startsWith('https'));

  // Xử lý khi load ảnh lỗi
  const handleError = () => {
    if (!useNative && isExternal && !imgError) {
      // Nếu lần đầu lỗi trên link ngoài, thử chuyển sang thẻ img thuần
      setUseNative(true);
    } else {
      // Nếu vẫn lỗi hoặc là ảnh nội bộ, chuyển sang placeholder
      setImgError(true);
    }
  };

  // Reset trạng thái nếu src thay đổi (để thử lại với Image mới)
  React.useEffect(() => {
    setImgError(false);
    setUseNative(false);
  }, [src]);

  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative" }}
      className={`bg-gray-50 flex items-center justify-center overflow-hidden ${className}`}
    >
      {useNative && !imgError ? (
        <img
          src={displaySrc as string}
          alt={alt || "product image"}
          className={`${classNameImg} object-contain w-full h-full animate-in fade-in duration-300`}
          style={{ objectPosition: 'center' }}
          onError={handleError}
        />
      ) : (
        <ImageNext
          key={displaySrc.toString()} // Buộc re-mount khi src thay đổi
          alt={alt || "image"}
          src={displaySrc}
          fill
          className={`${classNameImg} object-contain animate-in fade-in duration-300`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={handleError}
          // Bỏ qua tối ưu hóa của Next.js cho ảnh từ Cloudinary nếu gặp vấn đề
          unoptimized={isExternal}
          {...rest}
        />
      )}
    </div>
  );
}
