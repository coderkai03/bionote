"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShaderToy } from "./components/ui/ShaderToy";

// Search result type
interface SearchResult {
  name: string;
  uid: string;
  viewerUrl: string;
  embedURL: string;
  isLocal?: boolean;
  modelPath?: string;
}

// Local Meshy models map
const MESHY_MODELS = {
  camera: {
    name: "Camera Insides",
    path: "/Camera_Insides.glb",
    uid: "camera-local",
  },
  crane: { name: "Construction Crane", path: "/Crane.glb", uid: "crane-local" },
  engine: {
    name: "V8 Car Engine",
    path: "/V8_Car_Engine.glb",
    uid: "engine-local",
  },
  steam: {
    name: "Steam Engine",
    path: "/Steam_Engine.glb",
    uid: "steam-local",
  },
  lock: { name: "Lock and Key", path: "/Lock_and_Key.glb", uid: "lock-local" },
};

// Sketchfab frameembed models map
const SKETCHFAB_MODELS = {
  heart: { name: "Human Heart", uid: "a70c0c47fe4b4bbfabfc8f445365d5a4" },
  brain: { name: "Human Brain", uid: "b123456789abcdef0123456789abcdef" },
  skeleton: { name: "Human Skeleton", uid: "c234567890abcdef0123456789abcdef" },
  cell: { name: "Cell Structure", uid: "d345678901abcdef0123456789abcdef" },
  dna: { name: "DNA Double Helix", uid: "e456789012abcdef0123456789abcdef" },
};

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [searchType, setSearchType] = useState<
    "meshy" | "sketchfab" | "api" | null
  >(null);
  const router = useRouter();

  // Check for local meshy models
  const checkMeshyModels = (query: string): SearchResult[] => {
    const lowerQuery = query.toLowerCase();
    const matches: SearchResult[] = [];

    Object.entries(MESHY_MODELS).forEach(([key, model]) => {
      if (
        lowerQuery.includes(key) ||
        model.name.toLowerCase().includes(lowerQuery)
      ) {
        matches.push({
          name: model.name,
          uid: model.uid,
          viewerUrl: "",
          embedURL: "",
          isLocal: true,
          modelPath: model.path,
        });
      }
    });

    return matches;
  };

  // Check for sketchfab models
  const checkSketchfabModels = (query: string): SearchResult[] => {
    const lowerQuery = query.toLowerCase();
    const matches: SearchResult[] = [];

    Object.entries(SKETCHFAB_MODELS).forEach(([key, model]) => {
      if (
        lowerQuery.includes(key) ||
        model.name.toLowerCase().includes(lowerQuery)
      ) {
        matches.push({
          name: model.name,
          uid: model.uid,
          viewerUrl: `https://sketchfab.com/3d-models/${model.uid}`,
          embedURL: `https://sketchfab.com/models/${model.uid}/embed`,
          isLocal: false,
        });
      }
    });

    return matches;
  };

  // Debounced search function with priority logic
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (query.trim().length > 2) {
            setIsSearching(true);

            // Priority 1: Check meshy models
            const meshyResults = checkMeshyModels(query);
            if (meshyResults.length > 0) {
              setSearchResults(meshyResults);
              setSearchType("meshy");
              setKeywords("meshy models");
              setIsSearching(false);
              return;
            }

            // Priority 2: Check sketchfab models
            const sketchfabResults = checkSketchfabModels(query);
            if (sketchfabResults.length > 0) {
              setSearchResults(sketchfabResults);
              setSearchType("sketchfab");
              setKeywords("sketchfab models");
              setIsSearching(false);
              return;
            }

            // Priority 3: API search
            try {
              const response = await fetch("/api/search", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_prompt: query }),
              });

              if (response.ok) {
                const data = await response.json();
                setSearchResults(data.search_results || []);
                setKeywords(data.keywords || "");
                setSearchType("api");
              }
            } catch (error) {
              console.error("Search error:", error);
            } finally {
              setIsSearching(false);
            }
          } else {
            setSearchResults([]);
            setKeywords("");
            setSearchType(null);
          }
        }, 400);
      };
    })(),
    []
  );

  // Effect to trigger search on input change
  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  // Handle card click - navigate to appropriate page
  const handleCardClick = (result: SearchResult) => {
    if (result.isLocal) {
      router.push(`/meshy/${result.uid}`);
    } else {
      router.push(`/${result.uid}`);
    }
  };

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center px-4">
      <ShaderToy />
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-2xl">
          What are we learning today?
        </h1>
      </div>

      <div className="w-full max-w-2xl mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Describe what you'd like to visualize..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
            </div>
          )}
        </div>

        {keywords && (
          <div className="mt-3 text-sm text-white/70 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
            <span className="font-medium">Search type:</span> {keywords}
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="w-full max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-lg">
            {searchType === "meshy"
              ? "🎮 Interactive 3D Models"
              : searchType === "sketchfab"
              ? "🖼️ Frame Embedded Models"
              : "🔍 Search Results"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map((result) => (
              <div
                key={result.uid}
                onClick={() => handleCardClick(result)}
                className={`group cursor-pointer rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl overflow-hidden ${
                  result.isLocal
                    ? "bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20"
                    : "bg-gradient-to-br from-blue-600/80 via-purple-600/80 to-indigo-700/80 backdrop-blur-xl border border-white/30"
                }`}
                style={{
                  boxShadow: result.isLocal
                    ? "0 25px 50px -12px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                    : "0 25px 50px -12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 transition-all duration-300">
                      {result.name}
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        result.isLocal
                          ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/50"
                          : "bg-blue-500/30 text-blue-200 border border-blue-400/50"
                      }`}
                    >
                      {result.isLocal ? "3D Viewer" : "Frame Embed"}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-6 pb-6">
                  {!result.isLocal && result.embedURL ? (
                    // Sketchfab iframe preview
                    <div className="relative mb-4 rounded-2xl overflow-hidden bg-black/20 border border-white/10">
                      <iframe
                        src={result.embedURL}
                        className="w-full h-48 pointer-events-none"
                        style={{ filter: "brightness(0.8)" }}
                        allowFullScreen
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="text-white text-sm font-medium drop-shadow-lg">
                          Click to view in full screen
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Meshy glass preview
                    <div className="relative mb-4 h-48 rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-blue-500/20 backdrop-blur-sm border border-white/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4 filter drop-shadow-lg">
                            🎮
                          </div>
                          <div className="text-white font-medium drop-shadow-lg">
                            Interactive 3D Model
                          </div>
                          <div className="text-white/70 text-sm mt-1">
                            Rotate • Zoom • Explore
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">
                      {result.isLocal ? "Local Model" : "Sketchfab Model"}
                    </span>
                    <div className="flex items-center space-x-2 text-white/60">
                      <span>UID: {result.uid.slice(0, 8)}...</span>
                      <div className="group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div
                    className={`absolute inset-0 rounded-3xl ${
                      result.isLocal
                        ? "bg-gradient-to-br from-emerald-400/10 via-cyan-400/10 to-transparent"
                        : "bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-transparent"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
