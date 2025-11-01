// src/main.jsx
import { StrictMode, useState, useEffect, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import PWABadge from './PWABadge';
import SplashScreen from './pages/SplashScreen';

// ✅ Lazy load halaman dan komponen besar
const HomePage = lazy(() => import('./pages/HomePage'));
const MakananPage = lazy(() => import('./pages/MakananPage'));
const MinumanPage = lazy(() => import('./pages/MinumanPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CreateRecipePage = lazy(() => import('./pages/CreateRecipePage'));
const EditRecipePage = lazy(() => import('./pages/EditRecipePage'));
const RecipeDetail = lazy(() => import('./components/recipe/RecipeDetail'));
const DesktopNavbar = lazy(() => import('./components/navbar/DesktopNavbar'));
const MobileNavbar = lazy(() => import('./components/navbar/MobileNavbar'));

// ✅ React Query (caching data resep)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // cache 2 menit
      cacheTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoot() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [mode, setMode] = useState('list');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('makanan');
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  // ✅ Timeout backup supaya SplashScreen gak stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSplash) setShowSplash(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, [showSplash]);

  const handleSplashComplete = () => setShowSplash(false);
  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMode('list');
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };
  const handleCreateRecipe = () => setMode('create');
  const handleRecipeClick = (recipeId, category) => {
    setSelectedRecipeId(recipeId);
    setSelectedCategory(category || currentPage);
    setMode('detail');
  };
  const handleEditRecipe = (recipeId) => {
    setEditingRecipeId(recipeId);
    setMode('edit');
  };
  const handleBack = () => {
    setMode('list');
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };
  const handleCreateSuccess = (newRecipe) => {
    alert('Resep berhasil dibuat!');
    setMode('list');
    if (newRecipe?.category) setCurrentPage(newRecipe.category);
  };
  const handleEditSuccess = (updatedRecipe) => {
    alert('Resep berhasil diperbarui!');
    setMode('list');
  };

  // ✅ Render halaman sesuai mode
  const renderCurrentPage = () => {
    if (mode === 'create')
      return <CreateRecipePage onBack={handleBack} onSuccess={handleCreateSuccess} />;

    if (mode === 'edit')
      return <EditRecipePage recipeId={editingRecipeId} onBack={handleBack} onSuccess={handleEditSuccess} />;

    if (mode === 'detail')
      return (
        <RecipeDetail
          recipeId={selectedRecipeId}
          category={selectedCategory}
          onBack={handleBack}
          onEdit={handleEditRecipe}
        />
      );

    switch (currentPage) {
      case 'home':
        return <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />;
      case 'makanan':
        return <MakananPage onRecipeClick={handleRecipeClick} />;
      case 'minuman':
        return <MinumanPage onRecipeClick={handleRecipeClick} />;
      case 'profile':
        return <ProfilePage onRecipeClick={handleRecipeClick} />;
      default:
        return <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />;
    }
  };

  // ✅ SplashScreen tampil dulu
  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;

  // ✅ Halaman utama
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {mode === 'list' && (
          <Suspense fallback={<div className="text-center mt-10 text-gray-500">Memuat navigasi...</div>}>
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

        <main className="min-h-screen">
          <Suspense fallback={<div className="text-center mt-20 text-gray-400">Memuat halaman...</div>}>
            {renderCurrentPage()}
          </Suspense>
        </main>

        <PWABadge />
      </div>
    </QueryClientProvider>
  );
}

// ✅ Render aplikasi
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
