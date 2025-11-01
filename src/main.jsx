// src/main.jsx
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import SplashScreen from "./pages/SplashScreen";
import HomePage from "./pages/HomePage";
import MakananPage from "./pages/MakananPage";
import MinumanPage from "./pages/MinumanPage";
import ProfilePage from "./pages/ProfilePage";
import CreateRecipePage from "./pages/CreateRecipePage";
import EditRecipePage from "./pages/EditRecipePage";
import RecipeDetail from "./pages/RecipeDetailPage";
import DesktopNavbar from "./components/navbar/DesktopNavbar";
import MobileNavbar from "./components/navbar/MobileNavbar";
import "./index.css";
import PWABadge from "./PWABadge";

function AppRoot() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const [mode, setMode] = useState("list"); // list | detail | create | edit
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("makanan");
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  // === FIX 1: Splash auto timeout agar halaman muncul ===
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // === Navigation Handlers ===
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
    alert("Resep berhasil dibuat!");
    setMode("list");
    if (newRecipe?.category) setCurrentPage(newRecipe.category);
  };

  const handleEditSuccess = () => {
    alert("Resep berhasil diperbarui!");
    setMode("list");
  };

  // === FIX 2: Render page secara aman ===
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

  // === FIX 3: Jangan hilang total saat splash ===
  if (loading) return <SplashScreen />;

  return (
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

      <main className="min-h-screen">{renderCurrentPage()}</main>
      <PWABadge />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
