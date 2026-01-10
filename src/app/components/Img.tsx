import ImageNext, { ImageProps } from "next/image";
import * as React from "react";

export default function Img({
  src,
  alt,
  className = "",
  classNameImg = "",
  ...rest
}: ImageProps & { className?: string; classNameImg?: string }) {
  // Xử lý trường hợp src rỗng hoặc undefined
  const safeSrc = src || "/placeholder.png";
  
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
        {...rest}
      />
    </div>
  );
}
