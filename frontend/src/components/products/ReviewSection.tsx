import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Review } from '../../types';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ReviewSectionProps {
  productId: string;
  onReviewAdded?: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId, onReviewAdded }) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reviewService.getByProductId(productId);
      setReviews(res.reviews || []);
    } catch (err: any) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      error('Please provide a title and detailed comment');
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.create(productId, { rating, title, comment });
      success('Thank you! Your review has been published.');
      setTitle('');
      setComment('');
      setRating(5);
      setIsFormOpen(false);
      await fetchReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err: any) {
      error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to remove your review?')) return;
    try {
      await reviewService.delete(reviewId);
      success('Review removed');
      await fetchReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err: any) {
      error(err.message || 'Failed to delete review');
    }
  };

  const userHasReviewed = reviews.some(
    (r) => (typeof r.user === 'object' ? r.user._id : r.user) === user?._id
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold leading-snug text-slate-100 sm:text-lg">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Customer Reviews ({reviews.length})
          </h3>
          <p className="mt-0.5 max-w-[19rem] text-xs leading-relaxed text-slate-400 sm:max-w-none">
            Verified ratings and feedback from developers and customers
          </p>
        </div>

        {isAuthenticated && !userHasReviewed && !isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Write a Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-3.5 animate-in fade-in duration-200 sm:p-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-semibold text-slate-200">Share Your Experience</span>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          {/* Star Rating Select */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Rating Score</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-600 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-amber-300 font-bold ml-2">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Review Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Incredible build quality and performance"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Detailed Comment</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you loved or how it works in your daily workflow..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="flex pt-2 sm:justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:opacity-50 sm:w-auto"
            >
              {submitting ? 'Publishing...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6 text-xs text-slate-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-5 text-center sm:p-8">
            <p className="text-xs text-slate-400">No reviews yet for this product.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map((rev) => {
            const authorName =
              typeof rev.user === 'object' && rev.user !== null
                ? rev.user.name
                : 'Verified Customer';
            const isOwner =
              (typeof rev.user === 'object' ? rev.user._id : rev.user) === user?._id;

            return (
              <div
                key={rev._id}
                className="space-y-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 sm:p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="truncate text-xs font-semibold text-slate-200">{rev.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(rev._id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <span>{authorName}</span>
                  <span className="flex items-center gap-1 text-emerald-500 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
