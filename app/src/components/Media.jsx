import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ImageWithSkeleton from "../tools/ImageWithSkeleton";
import { backend_url } from "../../config";
import {
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineX,
  HiOutlineZoomIn,
} from "react-icons/hi";

const FullScreenModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="relative w-full h-full">
        <img
          src={imageUrl}
          alt="Full screen view"
          className="w-full h-full object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-indigo-500 bg-indigo-50 rounded-full p-2"
          aria-label="Close full screen view"
        >
          <HiOutlineX size={24} />
        </button>
      </div>
    </div>
  );
};

const Media = () => {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchMediaDetail = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/media/${id}`);
        setMedia(response.data);
      } catch (err) {
        console.error("Error fetching media detail:", err);
        setError("Failed to fetch media detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchMediaDetail();
  }, [id]);

  const handleScroll = (direction) => {
    const container = document.getElementById("additional-media-container");
    if (container) {
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading media...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-indigo-500">
        {error}
      </div>
    );
  }

  if (!media) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Media not found
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 md:p-6 flex flex-col">
      <div className="flex flex-col items-center">
        <ImageWithSkeleton
          src={media.mediaUrl}
          alt="Media"
          className="w-fit h-auto max-h-[80vh] rounded-xl mx-auto"
          fallbackSrc="https://via.placeholder.com/800x600?text=Media+Not+Found"
        />
        <div className="flex gap-2 items-center mt-2">
          <div className="bg-indigo-50 text-indigo-500 px-3 py-1.5 rounded-full flex items-center">
            <HiOutlineEye className="mr-2" />
            <span>{media.views}</span>
          </div>
          <button
            onClick={() => setIsFullScreen(true)}
            className="bg-indigo-50 text-indigo-500 rounded-full p-2"
            aria-label="View full screen"
          >
            <HiOutlineZoomIn size={20} />
          </button>
        </div>
      </div>

      {media.additionalMedia && media.additionalMedia.length > 0 && (
        <div className="mt-4">
          <h2 className="text-gray-600 font-light text-lg mb-2">
            {media.collectionTitle
              ? `More from ${media.collectionTitle}`
              : "More from this collection"}
          </h2>
          <div className="relative">
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/60 text-indigo-500 rounded-full p-1 z-10 ml-2"
              aria-label="Scroll left"
            >
              <HiOutlineChevronLeft size={24} />
            </button>
            <div
              id="additional-media-container"
              className="flex overflow-x-auto space-x-2 no-scrollbar"
              style={{ scrollBehavior: "smooth" }}
            >
              {media.additionalMedia.map((item) => (
                <Link
                  to={`/media/${item.id}`}
                  key={item.id}
                  className="flex-shrink-0"
                >
                  <div className="relative">
                    <ImageWithSkeleton
                      src={item.previewUrl}
                      alt="Additional media"
                      className="w-48 h-48 object-cover rounded-lg hover:opacity-75 transition-opacity shadow-md"
                      fallbackSrc="https://via.placeholder.com/160x160?text=Preview"
                    />
                  </div>
                </Link>
              ))}
            </div>
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/60 text-indigo-500 rounded-full p-1 z-10 mr-2"
              aria-label="Scroll right"
            >
              <HiOutlineChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      <FullScreenModal
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        imageUrl={media.mediaUrl}
      />
    </div>
  );
};

export default Media;
