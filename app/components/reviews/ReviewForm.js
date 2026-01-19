"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import StarRating from "./StarRating";

export default function ReviewForm({ bookingId, onSubmit, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleFormSubmit = async (data) => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        booking_id: bookingId,
        rating: rating,
        ...data,
      };

      await onSubmit(reviewData);
    } catch (error) {
      console.error("Submit review error:", error);
      alert(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Star Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          {rating === 0 && (
            <p className="mt-1 text-sm text-red-600">Please select a rating</p>
          )}
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Title
          </label>
          <input
            type="text"
            {...register("title", { maxLength: 200 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Summarize your experience"
          />
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Review *
          </label>
          <textarea
            {...register("comment", {
              required: "Review comment is required",
              minLength: {
                value: 10,
                message: "Review must be at least 10 characters",
              },
            })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Share details of your experience..."
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">
              {errors.comment.message}
            </p>
          )}
        </div>

        {/* Rating Categories (Optional) */}
        <div className="mb-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Rate Specific Aspects
          </h4>
          <div className="space-y-3">
            {["Punctuality", "Quality", "Communication", "Professionalism"].map(
              (category) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{category}</span>
                  <StarRating
                    rating={0}
                    onRatingChange={(rating) =>
                      console.log(`${category}: ${rating}`)
                    }
                    size="sm"
                  />
                </div>
              ),
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
