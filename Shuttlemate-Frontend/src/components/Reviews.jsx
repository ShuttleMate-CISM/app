import React from 'react';
import DOMPurify from 'dompurify';

const ReviewItem = ({ review }) => {
  // Sanitize the comment before display
  const safeComment = DOMPurify.sanitize(review.comment);

  return (
    <div className="review-card p-4 border rounded">
      <h4 className="font-bold">{review.userName}</h4>
      {/* 
          SAFE RENDERING:
          Even if 'safeComment' contained <script>, it is now removed.
      */}
      <p dangerouslySetInnerHTML={{ __html: safeComment }}></p> 
    </div>
  );
};

const Reviews = ({ reviews }) => {
  return (
    <div className="reviews-container">
      <h2 className="text-2xl font-bold mb-4">User Reviews</h2>
      <div className="reviews-list space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewItem key={index} review={review} />
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default Reviews;
