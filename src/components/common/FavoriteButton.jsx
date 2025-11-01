// src/components/common/FavoriteButton.jsx
import { useState } from 'react';
import { Heart } from 'lucide-react';
import favoriteService from '../../services/favoriteService';
import userService from '../../services/userService';

/**
 * FavoriteButton integrated with favoriteService.toggleFavorite
 * Props:
 *  - recipeId
 *  - initial (bool)
 *  - onToggled (optional callback)
 */
export default function FavoriteButton({ recipeId, initial = false, onToggled }) {
  const [isFavorited, setIsFavorited] = useState(!!initial);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    // optimistic UI
    setIsFavorited(prev => !prev);
    try {
      const user_identifier = userService.getUserIdentifier();
      await favoriteService.toggleFavorite({ recipe_id: recipeId, user_identifier });
      onToggled && onToggled(!isFavorited);
    } catch (e) {
      // rollback
      setIsFavorited(prev => !prev);
      console.error('toggle favorite failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isFavorited ? 'Unfavorite' : 'Favorite'}
      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
      disabled={loading}
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'text-rose-600' : 'text-gray-500'}`} />
    </button>
  );
}
