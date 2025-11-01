// src/components/ShareLink.jsx
import { useState } from 'react';

/**
 * ShareLink - builds a shareable URL to the recipe page.
 * Uses REACT_APP_VERCEL_URL if set (recommended when deploying to Vercel).
 */
export default function ShareLink({ recipeId, recipeSlug = '' }) {
  const [copied, setCopied] = useState(false);
  const appBase = process.env.REACT_APP_VERCEL_URL ? `https://${process.env.REACT_APP_VERCEL_URL}` : (typeof window !== 'undefined' ? window.location.origin : '');
  const shareUrl = `${appBase}/recipes/${recipeId}${recipeSlug ? `-${recipeSlug}` : ''}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('Tidak bisa menyalin ke clipboard');
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <input readOnly value={shareUrl} className="border p-2 rounded w-full" />
      <button onClick={copy} className="px-3 py-2 rounded bg-gray-100">{copied ? 'Tersalin' : 'Salin'}</button>
    </div>
  );
}
