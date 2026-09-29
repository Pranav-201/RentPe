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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Customer Reviews ({reviews.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified ratings and feedback from developers and customers
          </p>
        </div>

        {isAuthenticated && !userHasReviewed && !isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Write a Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in duration-200"
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all"
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
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
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
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                    <span className="font-semibold text-slate-200 text-xs">{rev.title}</span>
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
