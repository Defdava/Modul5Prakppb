import { StrictMode, useState, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import SplashScreen from "./pages/SplashScreen";
import DesktopNavbar from "./components/navbar/DesktopNavbar";
import MobileNavbar from "./components/navbar/MobileNavbar";
import "./index.css";
import PWABadge from "./PWABadge";

// ✅ Lazy load untuk page
const HomePage = lazy(() => import("./pages/HomePage"));
const MakananPage = lazy(() => import("./pages/MakananPage"));
const MinumanPage = lazy(() => import("./pages/MinumanPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CreateRecipePage = lazy(() => import("./pages/CreateRecipePage"));
const EditRecipePage = lazy(() => import("./pages/EditRecipePage"));
const RecipeDetailPage = lazy(() => import("./pages/RecipeDetailPage"));

// ✅ React Query (query caching)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

function AppRoot() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [mode, setMode] = useState("list"); // list | detail | create | edit
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("makanan");
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  // Splash selesai
  const handleSplashComplete = () => setShowSplash(false);

  // Navigasi antar halaman
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
    setEditingRecipeId(recipeId);
    setMode("edit");
  };

  const handleBack = () => {
    setMode("list");
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateSuccess = (newRecipe) => {
    alert("✅ Resep berhasil dibuat!");
    setMode("list");
    if (newRecipe?.category) setCurrentPage(newRecipe.category);
  };

  const handleEditSuccess = () => {
    alert("✅ Resep berhasil diperbarui!");
    setMode("list");
  };

  const renderCurrentPage = () => {
    if (mode === "create")
      return (
        <CreateRecipePage onBack={handleBack} onSuccess={handleCreateSuccess} />
      );
    if (mode === "edit")
      return (
        <EditRecipePage
          recipeId={editingRecipeId}
          onBack={handleBack}
          onSuccess={handleEditSuccess}
        />
      );
    if (mode === "detail")
      return (
        <RecipeDetailPage
          recipeId={selectedRecipeId}
          category={selectedCategory}
          onBack={handleBack}
          onEdit={handleEditRecipe}
        />
      );

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

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {mode === "list" && (
          <>
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
          </>
        )}

        <main className="min-h-screen">
          <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
            {renderCurrentPage()}
          </Suspense>
        </main>

        <PWABadge />
      </div>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
