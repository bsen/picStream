import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ImageWithSkeleton from "../tools/ImageWithSkeleton";
import { backend_url } from "../../config";
import CircularLoading from "../tools/Loader";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSearchResults = async () => {
    if (searchQuery.length === 0) {
      setCollections([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${backend_url}/api/search`, {
        query: searchQuery,
      });

      if (response.data.error) {
        setError(response.data.error);
      } else if (
        !response.data.collections ||
        response.data.collections.length === 0
      ) {
        setCollections([]);
      } else {
        setCollections(response.data.collections);
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(
        `Failed to fetch search results. ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 0) {
        fetchSearchResults();
      } else {
        setCollections([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const getCollectionLink = (item) => {
    if (item.slug) {
      return `/collection/${item.slug}`;
    } else {
      console.warn("No suitable slug found for item:", item);
      return "#";
    }
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search collections"
          className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm sm:text-base"
        />
      </div>
      {error && <div className="text-center text-indigo-500 mb-4">{error}</div>}
      {collections.length === 0 && !loading && searchQuery.length > 0 ? (
        <div className="text-center text-indigo-500">No collections found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {collections.map((item) => (
            <Link
              key={item.id}
              to={getCollectionLink(item)}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group"
            >
              <ImageWithSkeleton
                src={item.imageUrl}
                alt={item.title || "Collection preview"}
                className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                fallbackSrc="https://via.placeholder.com/400x400?text=Image+Not+Found"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4">
                <span className="text-white text-xs sm:text-sm md:text-base font-semibold truncate block">
                  {item.title || "Untitled Collection"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {loading && <CircularLoading />}
    </div>
  );
};

export default Search;
