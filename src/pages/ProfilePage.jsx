// src/pages/ProfilePage.jsx
import { useState, useRef, useEffect } from 'react';
import { useRecipes, useUpdateRecipe } from '../hooks/useRecipes';
import FavoriteButton from '../components/common/FavoriteButton';
import ReviewModal from '../components/ReviewModal';
import ShareLink from '../components/ShareLink';
import EditRecipePage from './EditRecipePage';

/**
 * ProfilePage updated to use react-query infinite list, intersection observer sentinel for lazy load
 * Assumes useRecipes({ baseParams: { user_identifier: ... }})
 */
export default function ProfilePage({ userId = null }) {
  // build baseParams to filter recipes of this user
  const baseParams = userId ? { user_id: userId } : {};
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useRecipes({ baseParams });

  const [openReviewFor, setOpenReviewFor] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const sentinelRef = useRef(null);

  // intersection observer for sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
    }, { root: null, threshold: 1.0 });
    io.observe(sentinel);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <div className="p-6">Memuat...</div>;

  const recipes = (data?.pages || []).flatMap(p => p.data || []);

  return (
    <div className="h-screen overflow-auto p-6">
      <header className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div>
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-sm text-gray-500">@username</p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4">
        {recipes.map(r => (
          <article key={r.id} className="p-4 rounded shadow bg-white">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{r.name || r.title}</h3>
                <p className="text-sm text-gray-600">{r.description || r.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton recipeId={r.id} initial={!!r.is_favorited || !!r.favorited} />
                <button onClick={() => setOpenReviewFor(r.id)} className="px-3 py-2">Review</button>
                <button onClick={() => setEditingId(r.id)} className="px-3 py-2">Edit</button>
              </div>
            </div>

            <div className="mt-3">
              <ShareLink recipeId={r.id} recipeSlug={r.slug || r.name?.toLowerCase()?.replace(/\s+/g,'-') || ''} />
            </div>
          </article>
        ))}
      </section>

      <div ref={sentinelRef} id="sentinel" className="h-6"></div>

      {isFetchingNextPage && <div className="text-center mt-4">Memuat lebih banyak...</div>}
      {!hasNextPage && <div className="text-center text-sm text-gray-500 mt-4">Tidak ada lagi resep</div>}

      {openReviewFor && <ReviewModal recipeId={openReviewFor} onClose={() => setOpenReviewFor(null)} onSaved={() => refetch()} />}

      {editingId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <EditRecipePage recipeId={editingId} onBack={() => setEditingId(null)} onSuccess={() => { setEditingId(null); refetch(); }} />
          </div>
        </div>
      )}
    </div>
  );
}
