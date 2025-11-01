// src/main.jsx
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SplashScreen from './pages/SplashScreen';
import HomePage from './pages/HomePage';
import MakananPage from './pages/MakananPage';
import MinumanPage from './pages/MinumanPage';
import ProfilePage from './pages/ProfilePage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import RecipeDetail from './components/recipe/RecipeDetail';
import DesktopNavbar from './components/navbar/DesktopNavbar';
import MobileNavbar from './components/navbar/MobileNavbar';
import './index.css'
import PWABadge from './PWABadge';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppWrapper() {
  const [mode, setMode] = useState('list');
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigation = (page) => setCurrentPage(page);
  const handleCreateRecipe = () => setMode('create');
  const handleBackToList = () => setMode('list');

  if (mode === 'splash') {
    return <SplashScreen onComplete={() => setMode('list')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show navbar in list mode */}
      {mode === 'list' && (
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

      <main className="p-4">
        {mode === 'list' && currentPage === 'home' && <HomePage />}
        {mode === 'list' && currentPage === 'makanan' && <MakananPage />}
        {mode === 'list' && currentPage === 'minuman' && <MinumanPage />}
        {mode === 'list' && currentPage === 'profile' && <ProfilePage userId={null} />}
        {mode === 'create' && <CreateRecipePage onBack={handleBackToList} />}
      </main>

      <PWABadge />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <AppWrapper />
    </QueryClientProvider>
  </StrictMode>
);
