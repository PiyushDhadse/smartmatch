// app/booking/page.js
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    setBookingId(Date.now().toString().slice(-6));
  }, []);

  const [bookingData, setBookingData] = useState({
    service: "",
    provider: "",
    date: "",
    time: "",
    address: "",
    city: "",
    urgency: "normal",
    notes: "",
  });

  // Mock data - will come from API later
  const services = [
    { id: "plumbing", name: "Plumbing", icon: "🔧" },
    { id: "electrical", name: "Electrical", icon: "⚡" },
    { id: "cleaning", name: "Cleaning", icon: "🧹" },
    { id: "tutoring", name: "Tutoring", icon: "📚" },
    { id: "carpentry", name: "Carpentry", icon: "🔨" },
    { id: "painting", name: "Painting", icon: "🎨" },
  ];

  const providers = [
    {
      id: "p1",
      name: "John's Plumbing",
      rating: 4.9,
      score: 92,
      available: true,
    },
    {
      id: "p2",
      name: "Quick Fix Services",
      rating: 4.7,
      score: 88,
      available: true,
    },
    {
      id: "p3",
      name: "Pro Handyman",
      rating: 4.8,
      score: 85,
      available: false,
    },
  ];

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleInputChange = (field, value) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("bookings") // Ensure your table name is 'bookings'
      .insert([
        {
          service_id: bookingData.service,
          provider_id: bookingData.provider,
          booking_date: bookingData.date,
          time_slot: bookingData.time,
          address: bookingData.address,
          city: bookingData.city,
          status: "pending",
          user_id: session?.user?.id, // Get this from next-auth session
          total_price: bookingData.price,
        },
      ])
      .select();

    if (error) {
      console.error("Error booking service:", error.message);
      alert("Booking failed. Please try again.");
    } else {
      setBookingId(data[0].id); // Use the real ID from Supabase
      setCurrentStep(4); // Show success state
    }
    setIsSubmitting(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.service && bookingData.provider;
      case 2:
        return bookingData.date && bookingData.time;
      case 3:
        return bookingData.address && bookingData.city;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] py-12 px-5">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate mb-2">Book a Service</h1>
          <p className="text-sage">
            Complete the steps below to schedule your service
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep < 4 && (
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStep >= step
                      ? "bg-forest text-white"
                      : "bg-cream text-sage"
                  }`}
                >
                  {currentStep > step ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full transition-all ${
                      currentStep > step ? "bg-forest" : "bg-cream"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-cream">
          {/* Step 1: Select Service & Provider */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-slate mb-6">
                Select Service & Provider
              </h2>

              {/* Service Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate mb-3">
                  What service do you need?
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleInputChange("service", service.id)}
                      className={`p-4 rounded-xl text-center transition-all border-2 ${
                        bookingData.service === service.id
                          ? "border-forest bg-cream"
                          : "border-cream hover:border-sage"
                      }`}
                    >
                      <span className="text-2xl block mb-1">
                        {service.icon}
                      </span>
                      <span className="text-xs font-medium text-slate">
                        {service.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-slate mb-3">
                  Choose a provider
                </label>
                <div className="space-y-3">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() =>
                        provider.available &&
                        handleInputChange("provider", provider.id)
                      }
                      disabled={!provider.available}
                      className={`w-full p-4 rounded-xl text-left transition-all border-2 flex items-center justify-between ${
                        !provider.available
                          ? "border-cream bg-gray-50 opacity-60 cursor-not-allowed"
                          : bookingData.provider === provider.id
                          ? "border-forest bg-cream"
                          : "border-cream hover:border-sage"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center text-xl">
                          🧑‍🔧
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate">
                            {provider.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-sage">
                              ⭐ {provider.rating}
                            </span>
                            <span
                              className={
                                provider.available
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              ●{" "}
                              {provider.available ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-sage block">
                          SmartMatch Score
                        </span>
                        <span className="text-lg font-bold text-forest">
                          {provider.score}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-slate mb-6">
                Select Date & Time
              </h2>

              {/* Date Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate mb-3">
                  Select date
                </label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="input-field"
                />
              </div>

              {/* Time Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate mb-3">
                  Select time slot
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleInputChange("time", time)}
                      className={`py-3 px-4 rounded-lg text-sm font-medium transition-all border-2 ${
                        bookingData.time === time
                          ? "border-forest bg-forest text-white"
                          : "border-cream hover:border-sage text-slate"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-sm font-medium text-slate mb-3">
                  Urgency level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "low", label: "Low", desc: "Flexible timing" },
                    { id: "normal", label: "Normal", desc: "Within schedule" },
                    { id: "urgent", label: "Urgent", desc: "ASAP needed" },
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleInputChange("urgency", level.id)}
                      className={`p-4 rounded-xl text-center transition-all border-2 ${
                        bookingData.urgency === level.id
                          ? "border-forest bg-cream"
                          : "border-cream hover:border-sage"
                      }`}
                    >
                      <span className="font-semibold text-slate block">
                        {level.label}
                      </span>
                      <span className="text-xs text-sage">{level.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location & Details */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-slate mb-6">
                Location & Details
              </h2>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={bookingData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your street address"
                  className="input-field"
                />
              </div>

              {/* City */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={bookingData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter your city"
                  className="input-field"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Describe your issue or any special requirements..."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-cream rounded-xl p-6">
                <h3 className="font-semibold text-slate mb-4">
                  Booking Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sage">Service:</span>
                    <span className="text-slate font-medium capitalize">
                      {bookingData.service}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage">Date:</span>
                    <span className="text-slate font-medium">
                      {bookingData.date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage">Time:</span>
                    <span className="text-slate font-medium">
                      {bookingData.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage">Urgency:</span>
                    <span className="text-slate font-medium capitalize">
                      {bookingData.urgency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-sage mb-8">
                Your service has been booked successfully. You will receive a
                confirmation shortly.
              </p>
              <div className="bg-cream rounded-xl p-6 text-left mb-8 max-w-sm mx-auto">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sage">Booking ID:</span>
                    <span className="text-slate font-medium">
                      #SM-{bookingId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage">Status:</span>
                    <span className="text-green-500 font-medium">
                      ● Confirmed
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/user" className="btn-primary px-8">
                  View My Bookings
                </Link>
                <Link href="/services" className="btn-secondary px-8">
                  Browse More Services
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-cream">
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-slate hover:bg-cream"
                }`}
              >
                ← Back
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={!canProceed()}
                  className={`px-8 py-3 rounded-lg font-medium transition-all ${
                    canProceed()
                      ? "bg-forest text-white hover:bg-slate"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    canProceed() && !isSubmitting
                      ? "bg-forest text-white hover:bg-slate"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Confirming...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
