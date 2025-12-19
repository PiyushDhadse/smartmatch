// app/booking/page.js
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createBooking, getServices, getAvailableSlots } from "../lib/api";

export default function BookingPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      setIsLoadingServices(true);
      getServices({ category: selectedCategory })
        .then((res) => {
          setAvailableServices(res.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoadingServices(false));
    } else {
      setAvailableServices([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookingId(Date.now().toString().slice(-6));
  }, []);

  const [bookingData, setBookingData] = useState({
    service: "", // This will store the service UUID
    provider: "", // This is now redundant but kept for compatibility if needed
    date: "",
    time: "",
    address: "",
    city: "",
    urgency: "normal",
    notes: "",
  });

  // Categories
  const categories = [
    { id: "Plumbing", name: "Plumbing", icon: "🔧" },
    { id: "Electrical", name: "Electrical", icon: "⚡" },
    { id: "Cleaning", name: "Cleaning", icon: "🧹" },
    { id: "Tutoring", name: "Tutoring", icon: "📚" },
    { id: "Carpentry", name: "Carpentry", icon: "🔨" },
    { id: "Painting", name: "Painting", icon: "🎨" },
  ];

  const handleInputChange = (field, value) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (bookingData.service && bookingData.date) {
      setIsLoadingSlots(true);
      getAvailableSlots(bookingData.service, bookingData.date)
        .then((res) => {
          setAvailableTimeSlots(res.data || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoadingSlots(false));
    } else {
      setAvailableTimeSlots([]);
    }
  }, [bookingData.service, bookingData.date]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (!session) {
        alert("Please sign in to book a service");
        setIsSubmitting(false);
        return;
      }

      // Prepare booking data
      // Note: In a real app, service and provider should be valid UUIDs from the database
      const payload = {
        service_id: bookingData.service, // This needs to be a valid UUID
        booking_date: bookingData.date,
        time_slot: bookingData.time,
        address: bookingData.address,
        city: bookingData.city,
        urgency: bookingData.urgency,
        notes: bookingData.notes,
      };

      await createBooking(session.user.id, payload);

      setCurrentStep(4); // Success step
    } catch (error) {
      console.error("Booking failed:", error);
      alert(
        "Failed to create booking. Make sure you selected a valid service (UUID) and are logged in."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.service; // Only service UUID is needed
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
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setBookingData((prev) => ({ ...prev, service: "" }));
                      }}
                      className={`p-4 rounded-xl text-center transition-all border-2 ${
                        selectedCategory === category.id
                          ? "border-forest bg-cream"
                          : "border-cream hover:border-sage"
                      }`}
                    >
                      <span className="text-2xl block mb-1">
                        {category.icon}
                      </span>
                      <span className="text-xs font-medium text-slate">
                        {category.name}
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

                {isLoadingServices ? (
                  <div className="text-center py-10 text-sage flex flex-col items-center">
                    <svg
                      className="animate-spin h-8 w-8 mb-2 text-forest"
                      viewBox="0 0 24 24"
                    >
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
                    Loading available providers...
                  </div>
                ) : availableServices.length > 0 ? (
                  <div className="space-y-3">
                    {availableServices.map((service) => {
                      // Extract provider info safely
                      const providerName =
                        service.service_providers?.users?.name ||
                        "Unknown Provider";
                      const rating = service.service_providers?.rating || "New";
                      const isAvailable =
                        service.service_providers?.availability_status ===
                        "available";

                      return (
                        <button
                          key={service.id}
                          onClick={() =>
                            handleInputChange("service", service.id)
                          }
                          className={`w-full p-4 rounded-xl text-left transition-all border-2 flex items-center justify-between ${
                            bookingData.service === service.id
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
                                {providerName}
                              </h4>
                              <p className="text-xs text-slate-500">
                                {service.title}
                              </p>
                              <div className="flex items-center gap-3 text-sm mt-1">
                                <span className="text-sage">⭐ {rating}</span>
                                {isAvailable ? (
                                  <span className="text-green-500">
                                    ● Available
                                  </span>
                                ) : (
                                  <span className="text-red-500">
                                    ● Busy
                                  </span>
                                )}
                                <span className="font-bold text-forest ml-2">
                                  ${service.price}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <span className="text-xs text-sage block">
                              Service Price
                            </span>
                            <span className="text-lg font-bold text-forest">
                              ${service.price}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-sage">
                      {selectedCategory
                        ? "No providers available for this category yet."
                        : "Select a service category above to see providers."}
                    </p>
                  </div>
                )}
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
                  {isLoadingSlots ? (
                    <div className="col-span-full text-center py-4 text-sage">
                      Loading available slots...
                    </div>
                  ) : availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((time) => (
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
                    ))
                  ) : (
                    <div className="col-span-full text-center py-4 text-sage border border-dashed border-gray-300 rounded-lg">
                      {bookingData.date
                        ? "No available slots for this date."
                        : "Please select a date first."}
                    </div>
                  )}
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
