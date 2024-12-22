import React, { useState, useEffect } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import ImageWithSkeleton from "../tools/ImageWithSkeleton";
import { backend_url } from "../../config";
import CircularLoading from "../tools/Loader";

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchCollections = async (cursor = null, reset = false) => {
    if (loading || (!cursor && collections.length > 0 && !reset)) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${backend_url}/api/collections${cursor ? `?cursor=${cursor}` : ""}`
      );
      if (
        !response.data.collections ||
        response.data.collections.length === 0
      ) {
        setError("No collections available.");
      } else {
        setCollections((prevCollections) =>
          reset
            ? response.data.collections
            : [...prevCollections, ...response.data.collections]
        );
        setNextCursor(response.data.nextCursor);
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
      setError(`Failed to fetch collections. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections(null, true);
  }, []);

  useEffect(() => {
    if (inView && nextCursor) {
      fetchCollections(nextCursor);
    }
  }, [inView, nextCursor]);

  const getCollectionLink = (item) => {
    if (item.slug) {
      return `/collection/${item.slug}`;
    } else {
      console.warn("No suitable slug found for item:", item);
      return "#";
    }
  };

  if (error) {
    return <div className="text-center text-indigo-500">{error}</div>;
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6">
      {collections.length === 0 && !loading ? (
        <div className="text-center text-indigo-500">
          No collections available
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {collections.map((item) => (
            <Link
              key={item.id}
              to={getCollectionLink(item)}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group"
            >
              <ImageWithSkeleton
                src={item.mostViewedMedia?.previewUrl || item.imageUrl}
                alt={item.title || "Collection preview"}
                className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                fallbackSrc="https://via.placeholder.com/400x400?text=Image+Not+Found"
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center space-x-2">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl || "/xs.png"}
                      alt={item.title || "Collection"}
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover border border-white bg-white"
                    />
                  )}
                  <span className="text-white text-xs sm:text-sm md:text-md font-semibold truncate">
                    {item.title || "Untitled Collection"}
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

export default Collections;
