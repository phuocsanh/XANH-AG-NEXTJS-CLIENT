import ImageNext, { ImageProps } from "next/image";
import * as React from "react";

export default function Img({
  src,
  alt,
  className = "",
  classNameImg = "",
  ...rest
}: ImageProps & { className?: string; classNameImg?: string }) {
  // Xử lý lỗi khi load ảnh
  const [imgError, setImgError] = React.useState(false);

  // Xử lý trường hợp src rỗng hoặc undefined hoặc bị lỗi
  let safeSrc = (imgError || !src) ? "/placeholder.png" : src;
  
  // Đảm bảo URL tuyệt đối nếu cần (hỗ trợ Cloudinary và các host khác)
  if (typeof safeSrc === 'string' && safeSrc.startsWith('//')) {
    safeSrc = `https:${safeSrc}`;
  }
  
  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <ImageNext
        alt={alt || "image"}
        src={safeSrc}
        fill
        className={className || classNameImg}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setImgError(true)}
        {...rest}
      />
    </div>
  );
}
