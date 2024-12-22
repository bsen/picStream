import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { backend_url } from "../../config";

import {
  HiFire,
  HiCollection,
  HiSearch,
  HiMenu,
  HiChevronRight,
  HiLightningBolt,
} from "react-icons/hi";

function Layout({ children }) {
  const navigate = useNavigate();
  const [topGroups, setTopGroups] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchtopGroups();
  }, []);

  const fetchtopGroups = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/top-groups`);
      console.log(response.data);
      setTopGroups(response.data);
    } catch (error) {
      console.error("Error fetching top groups:", error);
    }
  };

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
        location.pathname === to
          ? "bg-gradient-to-r from-indigo-500 to-indigo-500 text-white shadow-lg"
          : "text-gray-600- hover:bg-dark-light hover:text-indigo-500"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
      <HiChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </Link>
  );

  return (
    <div className="flex h-screen text-gray-600 bg-white">
      <style>{`
        :root {
          --color-dark: #121212;
          --color-dark-light: #1e1e1e;
          --color-primary: #e91e63;
          --color-primary-light: #f48fb1;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Sidebar */}
      <div
        className={`${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 w-60 bg-white shadow-xl transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0">
            <div className="flex flex-col items-center justify-center py-4">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">
                PicStream
              </h1>
              <p className="text-xs font-light text-gray-600 mt-1">
                Explore the heat
              </p>
            </div>
            <nav className="px-4 space-y-3 mt-2">
              <NavLink to="/hot" icon={HiFire}>
                Hot
              </NavLink>
              <NavLink to="/collections" icon={HiCollection}>
                Collections
              </NavLink>
              <NavLink to="/ai" icon={HiLightningBolt}>
                AI Images
              </NavLink>
              <NavLink to="/search" icon={HiSearch}>
                Search
              </NavLink>
            </nav>
            <div className="mt-6 px-4">
              <h2 className="text-lg font-bold pb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600 border-b border-indigo-200 text-center">
                Top
              </h2>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto px-4 pt-2 pb-8 no-scrollbar">
            <ul className="space-y-2">
              {topGroups.map((model) => (
                <li key={model.id}>
                  <button
                    onClick={() => {
                      navigate(`/collection/${model.slug}`, { replace: true });
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 text-gray-600 hover:text-white transition-colors duration-200 group"
                  >
                    <div className="relative">
                      <img
                        src={model.imageUrl || "/xs.png"}
                        alt={model.title}
                        className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500 transition-colors duration-200"
                      />
                    </div>
                    <span className="group-hover:text-indigo-500 transition-colors duration-200">
                      {model.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 flex items-center justify-between px-4 bg-white shadow-md lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-indigo-500"
          >
            <HiMenu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">
            PicStream
          </h1>
          <div className="w-6"></div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gdark">
          <div className="container mx-auto py-2 md:py-0">{children}</div>
        </main>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Layout;
