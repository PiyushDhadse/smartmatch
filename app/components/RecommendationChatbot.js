'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

const DEFAULT_URGENCY = 3;

const servicesData = [
  {
    id: 201,
    title: 'Electrical Troubleshooting & Repair',
    category: 'electrical',
    rating: 4.9,
    availability: true,
    distance_km: 2.1,
    href: '/services/electrical'
  },
  {
    id: 202,
    title: 'Lighting Installation (Indoor/Outdoor)',
    category: 'electrical',
    rating: 4.8,
    availability: true,
    distance_km: 3.4,
    href: '/services/electrical'
  },
  {
    id: 101,
    title: 'Plumbing Leak Fix & Clog Removal',
    category: 'plumbing',
    rating: 4.8,
    availability: true,
    distance_km: 2.8,
    href: '/services?category=home&q=plumbing'
  },
  {
    id: 102,
    title: 'Bathroom Fitting Installation',
    category: 'plumbing',
    rating: 4.6,
    availability: false,
    distance_km: 1.9,
    href: '/services?category=home&q=plumbing'
  },
  {
    id: 301,
    title: 'Deep Home Cleaning (1–3 BHK)',
    category: 'cleaning',
    rating: 4.7,
    availability: true,
    distance_km: 1.6,
    href: '/services?category=cleaning'
  },
  {
    id: 302,
    title: 'Move-in / Move-out Cleaning',
    category: 'cleaning',
    rating: 4.6,
    availability: true,
    distance_km: 4.2,
    href: '/services?category=cleaning'
  },
  {
    id: 401,
    title: 'Math Tutoring (School/College)',
    category: 'tutoring',
    rating: 4.9,
    availability: true,
    distance_km: 5.1,
    href: '/services?category=education&q=tutor'
  },
  {
    id: 402,
    title: 'English Speaking & Interview Coaching',
    category: 'tutoring',
    rating: 4.8,
    availability: true,
    distance_km: 3.8,
    href: '/services?category=education&q=coaching'
  },
  {
    id: 501,
    title: 'Gardening & Lawn Maintenance',
    category: 'gardening',
    rating: 4.6,
    availability: true,
    distance_km: 6.0,
    href: '/services?category=outdoor&q=garden'
  }
];

function computeScore({ availability, urgency_level, rating, distance_km }) {
  return (availability ? 40 : 0) + urgency_level * 20 + rating * 10 - distance_km * 5;
}

function parseIntent(text) {
  const t = (text || '').toLowerCase();

  const urgencyMatch = t.match(/\b([1-5])\b/);
  const urgency = urgencyMatch ? Number(urgencyMatch[1]) : null;

  const category =
    /elect|electrician|wiring|breaker|light/.test(t)
      ? 'electrical'
      : /plumb|pipe|leak|clog|tap|flush/.test(t)
        ? 'plumbing'
        : /clean|maid|deep clean|housekeeping/.test(t)
          ? 'cleaning'
          : /tutor|tuition|math|english|study|coach/.test(t)
            ? 'tutoring'
            : /garden|lawn|plants|landscape/.test(t)
              ? 'gardening'
              : null;

  return { urgency, category };
}

function formatCategory(category) {
  if (!category) return 'any';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function RecommendationChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [urgency, setUrgency] = useState(DEFAULT_URGENCY);

  const [messages, setMessages] = useState(() => [
    {
      role: 'bot',
      type: 'text',
      text:
        'Hi! I can recommend services based on availability, urgency, rating, and distance.\n\nTell me what you need (e.g., “electrician”) and urgency (1–5).'
    }
  ]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, [messages, open]);

  const recommendations = useMemo(() => {
    const urgency_level = urgency ?? DEFAULT_URGENCY;

    const pool = selectedCategory
      ? servicesData.filter((s) => s.category === selectedCategory)
      : servicesData;

    const scored = pool
      .map((s) => {
        const score = computeScore({
          availability: s.availability,
          urgency_level,
          rating: s.rating,
          distance_km: s.distance_km
        });
        return { ...s, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 3);
  }, [selectedCategory, urgency]);

  const addBotRecommendations = ({ categoryOverride } = {}) => {
    const category = categoryOverride ?? selectedCategory;
    const urgency_level = urgency ?? DEFAULT_URGENCY;
    const recs = (category ? servicesData.filter((s) => s.category === category) : servicesData)
      .map((s) => ({
        ...s,
        score: computeScore({
          availability: s.availability,
          urgency_level,
          rating: s.rating,
          distance_km: s.distance_km
        })
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        type: 'recs',
        meta: { category: category ?? null, urgency: urgency_level },
        recs
      }
    ]);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', type: 'text', text }]);
    setInput('');

    const { urgency: parsedUrgency, category: parsedCategory } = parseIntent(text);

    if (parsedUrgency) setUrgency(parsedUrgency);
    if (parsedCategory) setSelectedCategory(parsedCategory);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          text: `Got it — category: ${formatCategory(parsedCategory ?? selectedCategory)} • urgency: ${parsedUrgency ?? urgency}. Here are the best matches:`
        }
      ]);

      // ensure we compute with the latest values
      setTimeout(() => {
        addBotRecommendations({ categoryOverride: parsedCategory ?? null });
      }, 50);
    }, 250);
  };

  const chipBase =
    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition';

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {/* Toggle */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-3 rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 px-4 py-3 hover:bg-emerald-800 transition"
          aria-label="Open recommendations chatbot"
        >
          <span className="text-lg" aria-hidden>
            💬
          </span>
          <div className="text-left leading-tight">
            <div className="text-sm font-extrabold">Recommendations</div>
            <div className="text-xs text-white/90">Ask & get suggestions</div>
          </div>
        </button>
      ) : (
        <div className="w-[92vw] max-w-sm rounded-3xl border border-emerald-100 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-4 py-4 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
            <div>
              <div className="text-sm font-extrabold">SmartMatch Assistant</div>
              <div className="text-xs text-white/90 mt-0.5">
                Score = (availability?40:0) + (urgency×20) + (rating×10) − (distance×5)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-white/10 hover:bg-white/20 transition px-3 py-1.5 text-sm font-bold"
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>

          {/* Controls */}
          <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Category:</span>
              {[
                { id: null, label: 'Any' },
                { id: 'electrical', label: '⚡ Electrical' },
                { id: 'plumbing', label: '🚰 Plumbing' },
                { id: 'cleaning', label: '🧼 Cleaning' },
                { id: 'tutoring', label: '🎓 Tutoring' },
                { id: 'gardening', label: '🌿 Gardening' }
              ].map((c) => {
                const active = selectedCategory === c.id;
                return (
                  <button
                    key={String(c.id)}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setMessages((prev) => [
                        ...prev,
                        {
                          role: 'bot',
                          type: 'text',
                          text: `Category set to ${formatCategory(c.id)}. Want recommendations now? Click “Recommend”.`
                        }
                      ]);
                    }}
                    className={`${chipBase} ${
                      active
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'bg-white border-emerald-200 text-slate-700 hover:bg-emerald-100'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-700">Urgency: {urgency}</div>
              <input
                type="range"
                min={1}
                max={5}
                value={urgency}
                onChange={(e) => setUrgency(Number(e.target.value))}
                className="w-40 accent-emerald-700"
                aria-label="Urgency level"
              />
              <button
                type="button"
                onClick={() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: 'bot',
                      type: 'text',
                      text: `Here are the top picks for ${formatCategory(selectedCategory)} at urgency ${urgency}:`
                    }
                  ]);
                  addBotRecommendations();
                }}
                className="rounded-xl bg-emerald-700 text-white px-3 py-2 text-xs font-extrabold hover:bg-emerald-800 transition"
              >
                Recommend
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="max-h-[50vh] overflow-auto px-4 py-4 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line border ${
                    m.role === 'user'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-800 border-emerald-100'
                  }`}
                >
                  {m.type === 'text' ? (
                    m.text
                  ) : (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">
                        Top matches • {formatCategory(m?.meta?.category)} • urgency {m?.meta?.urgency}
                      </div>
                      <div className="space-y-2">
                        {m.recs.map((r) => (
                          <div key={r.id} className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">{r.title}</div>
                                <div className="mt-0.5 text-xs text-slate-600">
                                  Rating <span className="font-semibold">{r.rating}</span> • Distance{' '}
                                  <span className="font-semibold">{r.distance_km} km</span> •{' '}
                                  <span className={r.availability ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                                    {r.availability ? 'Available' : 'Busy'}
                                  </span>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="text-[11px] text-slate-600">Score</div>
                                <div className="text-sm font-extrabold text-emerald-800">{Math.round(r.score)}</div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Link
                                href={r.href}
                                className="inline-flex items-center justify-center rounded-lg bg-white border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                              >
                                View
                              </Link>
                              <Link
                                href={`/booking?service=${encodeURIComponent(r.id)}`}
                                className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                              >
                                Book
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-slate-600">
                        Tip: Higher urgency boosts score (+20 per level), while distance reduces it (−5 per km).
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-emerald-100 p-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder='Try: “electrician 5” or “cleaning 2”'
                className="flex-1 rounded-xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleSend}
                className="rounded-xl bg-emerald-700 text-white px-4 py-2 text-sm font-extrabold hover:bg-emerald-800 transition"
              >
                Send
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {['electrician 5', 'plumbing 4', 'cleaning 3', 'tutor 2'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setInput(q);
                    setTimeout(handleSend, 0);
                  }}
                  className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}