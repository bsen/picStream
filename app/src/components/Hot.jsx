import React, { useState, useEffect } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import ImageWithSkeleton from "../tools/ImageWithSkeleton";
import { backend_url } from "../../config";
import CircularLoading from "../tools/Loader";

const HotContent = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchHotContent = async (cursor = null, reset = false) => {
    if (loading || (!cursor && media.length > 0 && !reset)) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching hot content...");
      const response = await axios.get(
        `${backend_url}/api/hot${cursor ? `?cursor=${cursor}` : ""}`
      );
      if (!response.data.media || response.data.media.length === 0) {
        console.log("No content available");
        setError("No content available.");
      } else {
        setMedia((prevMedia) =>
          reset ? response.data.media : [...prevMedia, ...response.data.media]
        );
        setNextCursor(response.data.nextCursor);
      }
    } catch (err) {
      console.error("Error fetching hot content:", err);
      setError(`Failed to fetch hot content. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotContent(null, true);
  }, []);

  useEffect(() => {
    if (inView && nextCursor) {
      fetchHotContent(nextCursor);
    }
  }, [inView, nextCursor]);

  const getCollectionLink = (item) => {
    if (item.collection && item.collection.slug) {
      return `/collection/${item.collection.slug}`;
    } else {
      console.warn("No suitable ID found for item:", item);
      return "#";
    }
  };

  if (error) {
    return <div className="text-center text-indigo-500">{error}</div>;
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6">
      {media.length === 0 && !loading ? (
        <div className="text-center text-indigo-500">No content available</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {media.map((item) => (
            <Link
              key={item.id}
              to={getCollectionLink(item)}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group"
            >
              <ImageWithSkeleton
                src={item.previewUrl}
                alt="Media preview"
                className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                fallbackSrc="https://via.placeholder.com/400x400?text=Image+Not+Found"
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center space-x-2">
                  {item.collection && item.collection.imageUrl && (
                    <img
                      src={item.collection.imageUrl || "/xs.png"}
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover border border-white bg-white"
                      alt={item.collection.title || "Collection"}
                    />
                  )}
                  <span className="text-white text-xs sm:text-sm md:text-md font-semibold truncate">
                    {item.collection
                      ? item.collection.title
                      : "Untitled Collection"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {loading && <CircularLoading />}

      <div ref={ref} style={{ height: "10px" }}></div>
    </div>
  );
};

export default HotContent;
