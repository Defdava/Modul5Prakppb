// src/main.jsx
import { StrictMode, useState, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import PWABadge from "./PWABadge";

// ✅ Lazy load halaman agar lebih cepat
const SplashScreen = lazy(() => import("./pages/SplashScreen"));
const HomePage = lazy(() => import("./pages/HomePage"));
const MakananPage = lazy(() => import("./pages/MakananPage"));
const MinumanPage = lazy(() => import("./pages/MinumanPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CreateRecipePage = lazy(() => import("./pages/CreateRecipePage"));
const EditRecipePage = lazy(() => import("./pages/EditRecipePage"));
const RecipeDetail = lazy(() => import("./components/recipe/RecipeDetail"));
const DesktopNavbar = lazy(() => import("./components/navbar/DesktopNavbar"));
const MobileNavbar = lazy(() => import("./components/navbar/MobileNavbar"));

// ✅ Inisialisasi Query Client untuk caching data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 3, // cache 3 menit
      retry: 1,
    },
  },
});

function AppRoot() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [mode, setMode] = useState("list"); // list, detail, create, edit
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("makanan");
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  const handleSplashComplete = () => setShowSplash(false);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMode("list");
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateRecipe = () => setMode("create");

  const handleRecipeClick = (recipeId, category) => {
    setSelectedRecipeId(recipeId);
    setSelectedCategory(category || currentPage);
    setMode("detail");
  };

  const handleEditRecipe = (recipeId) => {
    console.log("🔧 Edit button clicked! Recipe ID:", recipeId);
    setEditingRecipeId(recipeId);
    setMode("edit");
  };

  const handleBack = () => {
    setMode("list");
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateSuccess = (newRecipe) => {
    alert("Resep berhasil dibuat!");
    setMode("list");
    if (newRecipe && newRecipe.category) {
      setCurrentPage(newRecipe.category);
    }
  };

  const handleEditSuccess = () => {
    alert("Resep berhasil diperbarui!");
    setMode("list");
  };

  const renderCurrentPage = () => {
    if (mode === "create") {
      return (
        <CreateRecipePage onBack={handleBack} onSuccess={handleCreateSuccess} />
      );
    }

    if (mode === "edit") {
      return (
        <EditRecipePage
          recipeId={editingRecipeId}
          onBack={handleBack}
          onSuccess={handleEditSuccess}
        />
      );
    }

    if (mode === "detail") {
      return (
        <RecipeDetail
          recipeId={selectedRecipeId}
          category={selectedCategory}
          onBack={handleBack}
          onEdit={handleEditRecipe}
        />
      );
    }

    switch (currentPage) {
      case "home":
        return (
          <HomePage
            onRecipeClick={handleRecipeClick}
            onNavigate={handleNavigation}
          />
        );
      case "makanan":
        return <MakananPage onRecipeClick={handleRecipeClick} />;
      case "minuman":
        return <MinumanPage onRecipeClick={handleRecipeClick} />;
      case "profile":
        return <ProfilePage onRecipeClick={handleRecipeClick} />;
      default:
        return (
          <HomePage
            onRecipeClick={handleRecipeClick}
            onNavigate={handleNavigation}
          />
        );
    }
  };

  if (showSplash) {
    return (
      <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
        <SplashScreen onComplete={handleSplashComplete} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Navbar hanya muncul di mode list */}
      {mode === "list" && (
        <Suspense fallback={null}>
          <DesktopNavbar
            currentPage={currentPage}
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
          <MobileNavbar
            currentPage={currentPage}
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
        </Suspense>
      )}

      {/* ✅ Konten utama */}
      <main className="min-h-screen">
        <Suspense fallback={<div className="p-6 text-center">Memuat...</div>}>
          {renderCurrentPage()}
        </Suspense>
      </main>

      <PWABadge />
    </div>
  );
}

// ✅ Bungkus dengan QueryClientProvider agar caching aktif
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoot />
    </QueryClientProvider>
  </StrictMode>
);
