import React from 'react';
import DOMPurify from 'dompurify';

/**
 * ReviewItem Component - XSS Sanitized Review Display
 * 
 * SECURITY FIX (S6 - Frontend Security):
 * Uses DOMPurify to sanitize user-generated review content before rendering.
 * This prevents Cross-Site Scripting (XSS) attacks by stripping malicious
 * scripts, event handlers, and dangerous HTML from review comments.
 * 
 * Even if a malicious user submits a review containing:
 *   <script>document.cookie</script>
 *   <img onerror="alert('xss')" src="x">
 * 
 * DOMPurify will strip these before rendering, making the output safe.
 */
const ReviewItem = ({ review }) => {
  // Sanitize the comment before display - removes <script>, onerror, etc.
  const safeComment = DOMPurify.sanitize(review.comment);
  const safeName = DOMPurify.sanitize(review.userName);

  return (
    <div className="review-card p-4 border rounded-lg shadow-sm mb-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-blue-900">{safeName}</h4>
        {review.rating && (
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>
      {/* 
        SAFE RENDERING:
        Even if 'safeComment' originally contained <script> tags or 
        malicious event handlers, DOMPurify has removed them.
        dangerouslySetInnerHTML is now safe because the content is sanitized.
      */}
      <p dangerouslySetInnerHTML={{ __html: safeComment }}></p>
      {review.createdAt && (
        <span className="text-xs text-gray-400 mt-2 block">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

export default ReviewItem;
