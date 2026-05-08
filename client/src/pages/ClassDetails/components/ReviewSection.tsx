import { useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import api from '../../../services/api';
import type { Review } from '../../../types';
import axios from 'axios';

interface Props {
  classId: number;
  reviews: Review[];
  canReview: boolean;
  onReviewAdded: () => Promise<void> | void;
}

const ReviewSection = ({ classId, reviews, canReview, onReviewAdded }: Props) => {
  const { showToast } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      await api.post('/bookings/reviews', {
        class_id: classId,
        rating,
        comment: comment.trim() || null,
      });

      setComment('');
      setRating(5);
      showToast('Review submitted successfully', 'success');
      await onReviewAdded();
    } catch (err: unknown) {
  let detail = 'Failed to submit review';

  if (axios.isAxiosError(err)) {
    const responseDetail = err.response?.data?.detail;

    if (typeof responseDetail === 'string' && responseDetail.trim().length > 0) {
      detail = responseDetail;
    }
  }

  showToast(detail, 'error');
} finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-14 rounded-3xl bg-white p-8 shadow-sm">
      <h3 className="text-2xl font-semibold text-gray-900">Reviews & Ratings</h3>

      <div className="mt-8 space-y-6">
        {reviews.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 py-8 text-center text-gray-500">
            No reviews yet.
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{review.user_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleString('he-IL')}
                  </p>
                </div>

                <div className="text-lg text-amber-400">{'★'.repeat(review.rating)}</div>
              </div>

              {review.comment && (
                <p className="mt-3 text-gray-700">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-10">
        {canReview ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`rounded-2xl px-4 py-3 text-2xl transition ${
                      rating === value
                        ? 'bg-amber-100 text-amber-500'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="Share your experience..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl bg-indigo-50 px-5 py-4 text-sm text-indigo-700">
            You can leave a review only after attending a completed session, and only once per class.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;