// src/components/ReviewModal.jsx
import { useState } from 'react';
import reviewService from '../services/reviewService';

/**
 * Simple modal to create review for a recipe
 * Props:
 *  - recipeId
 *  - onClose
 *  - onSaved  (callback after successful save)
 */
export default function ReviewModal({ recipeId, onClose, onSaved }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!recipeId) return;
    setLoading(true);
    try {
      await reviewService.createReview({ recipe_id: recipeId, rating, comment: text });
      onSaved && onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Gagal mengirim review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-3">Tulis Review</h3>

        <label className="block mb-1">Rating</label>
        <input type="range" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
        <p className="text-sm mb-3">{rating} / 5</p>

        <label className="block mb-1">Komentar</label>
        <textarea className="w-full p-2 border rounded mb-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="Tuliskan pendapatmu..." />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2">Batal</button>
          <button onClick={submit} className="px-3 py-2 bg-primary text-white rounded" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  );
}
