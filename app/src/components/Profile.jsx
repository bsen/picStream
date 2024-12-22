import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import ImageWithSkeleton from "../tools/ImageWithSkeleton";
import { HiOutlineEye, HiOutlinePhotograph } from "react-icons/hi";
import short from "short-uuid";
import { backend_url } from "../../config";
import CircularLoading from "../tools/Loader";

const Profile = () => {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const translator = short();

  useEffect(() => {
    fetchCollectionProfile();
    setMedia([]);
    setNextCursor(null);
    fetchCollectionMedia(null, true);
  }, [slug]);

  useEffect(() => {
    if (inView) {
      fetchCollectionMedia(nextCursor);
    }
  }, [inView]);

  const fetchCollectionProfile = async () => {
    try {
      const response = await axios.get(
        `${backend_url}/api/collection/${slug}/profile`
      );
      setCollection(response.data);
    } catch (err) {
      console.error("Error fetching collection profile:", err);
      setError("Failed to fetch collection profile.");
    }
  };

  const fetchCollectionMedia = async (cursor = null, reset = false) => {
    if (loading || (!cursor && media.length > 0 && !reset)) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${backend_url}/api/collection/${slug}/media${
          cursor ? `?cursor=${cursor}` : ""
        }`
      );
      if (!response.data.media || response.data.media.length === 0) {
        setError("No media available.");
      } else {
        setMedia((prevMedia) =>
          reset ? response.data.media : [...prevMedia, ...response.data.media]
        );
        setNextCursor(response.data.nextCursor);
      }
    } catch (err) {
      console.error("Error fetching collection media:", err);
      setError("Failed to fetch collection media.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="text-center text-indigo-500">{error}</div>;
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6">
      {collection ? (
        <div className="mb-4 p-4">
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row items-center">
            <img
              src={collection.imageUrl ? collection.imageUrl : "/xl.png"}
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 border-4 border-indigo-500 object-cover rounded-full shadow-md z-10 bg-white"
              alt={collection.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/224x224?text=Collection+Image";
              }}
            />

            <div className="flex-grow text-center md:text-left">
              <h1 className="text-2xl sm:text-xl md:text-2xl  text-gray-800 tracking-tight">
                {collection.title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-2.5 leading-relaxed font-light">
                {collection.description}
              </p>
              <div className="flex justify-center md:justify-start text-xs sm:text-sm text-indigo-600 space-x-3 sm:space-x-6">
                <span className="flex items-center bg-indigo-50 rounded-full px-3 py-1 sm:px-4 sm:py-2">
                  <HiOutlineEye
                    className="mr-1 sm:mr-2 text-indigo-500"
                    size={16}
                  />
                  {(collection.views || 0).toLocaleString()} views
                </span>
                <span className="flex items-center bg-indigo-50 rounded-full px-3 py-1 sm:px-4 sm:py-2">
                  <HiOutlinePhotograph
                    className="mr-1 sm:mr-2 text-indigo-500"
                    size={16}
                  />
                  {collection.totalItems || 0} items
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600">Loading collection...</div>
      )}

      {media.length === 0 && !loading ? (
        <div className="text-center text-gray-600">No media available</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {media.map((item) => (
            <Link
              to={`/media/${translator.fromUUID(item.id)}`}
              key={item.id}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group"
            >
              <ImageWithSkeleton
                src={item.previewUrl}
                alt={item.title}
                className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                fallbackSrc="https://via.placeholder.com/400x400?text=Image+Not+Found"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>
      )}

      {loading && <CircularLoading />}

      <div ref={ref} style={{ height: "10px" }}></div>
    </div>
  );
};

export default Profile;
