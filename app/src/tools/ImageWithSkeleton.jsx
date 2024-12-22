import React, { useState } from "react";

const ImageWithSkeleton = ({ src, alt, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!imageLoaded && (
        <div
          className={`absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-100 to-gray-100 ${className}`}
          style={{
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            zIndex: 10,
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${
          !imageLoaded ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
};

export default ImageWithSkeleton;
