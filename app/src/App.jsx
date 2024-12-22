import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Hot from "./components/Hot";
import Collections from "./components/Collections";
import Profile from "./components/Profile";
import Media from "./components/Media";
import Search from "./components/Search";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./components/NotFound";

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate replace to="/hot" />} />
            <Route
              path="/hot"
              element={
                <ErrorBoundary>
                  <Hot />
                </ErrorBoundary>
              }
            />
            <Route
              path="/collections"
              element={
                <ErrorBoundary>
                  <Collections />
                </ErrorBoundary>
              }
            />
            <Route
              path="/collection/:slug"
              element={
                <ErrorBoundary>
                  <Profile />
                </ErrorBoundary>
              }
            />
            <Route
              path="/media/:id"
              element={
                <ErrorBoundary>
                  <Media />
                </ErrorBoundary>
              }
            />
            <Route
              path="/search"
              element={
                <ErrorBoundary>
                  <Search />
                </ErrorBoundary>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
