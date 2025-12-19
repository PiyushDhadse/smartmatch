// app/page.js
import Link from 'next/link';

export default function HomePage() {
  const services = [
    { icon: '🔧', name: 'Plumbing', count: '120+ Providers' },
    { icon: '⚡', name: 'Electrical', count: '85+ Providers' },
    { icon: '🧹', name: 'Cleaning', count: '200+ Providers' },
    { icon: '📚', name: 'Tutoring', count: '150+ Providers' },
    { icon: '🔨', name: 'Carpentry', count: '60+ Providers' },
    { icon: '🎨', name: 'Painting', count: '45+ Providers' },
  ];

  const steps = [
    { number: '01', title: 'Search', desc: 'Find services near you' },
    { number: '02', title: 'Compare', desc: 'AI-powered recommendations' },
    { number: '03', title: 'Book', desc: 'Schedule instantly' },
    { number: '04', title: 'Track', desc: 'Real-time status updates' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24 border-b border-cream">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Hero Content */}
            <div className="flex flex-col gap-6">
              <span className="inline-block bg-cream text-forest px-4 py-2 rounded-full text-sm font-medium w-fit">
                🚀 AI-Powered Matching
              </span>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-slate leading-tight">
                Find Trusted Local
                <span className="text-forest"> Service Providers</span>
              </h1>
              
              <p className="text-lg text-sage leading-relaxed">
                SmartMatch connects you with verified professionals based on 
                location, availability, and our intelligent scoring system.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-2">
                <Link href="/services" className=" bg-emerald-700 btn-primary px-7 py-3.5 text-base">
                  Find Services
                </Link>
                <Link href="/register" className="hover:bg-emerald-800 btn-secondary px-7 py-3.5 text-base">
                  Become a Provider
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-6 pt-6 border-t border-cream">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate">500+</span>
                  <span className="text-sm text-sage">Providers</span>
                </div>
                <div className="w-px h-12 bg-sage"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate">2000+</span>
                  <span className="text-sm text-sage">Bookings</span>
                </div>
                <div className="w-px h-12 bg-sage"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate">50+</span>
                  <span className="text-sm text-sage">Cities</span>
                </div>
              </div>
            </div>

            {/* Hero Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-cream w-full max-w-sm">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-4xl bg-cream p-3 rounded-xl">🔧</span>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-slate">John&apos;s Plumbing</h4>
                    <p className="text-sm text-green-500">● Available Now</p>
                  </div>
                  <span className="bg-cream px-3 py-1.5 rounded-lg text-sm font-semibold text-slate">
                    ⭐ 4.9
                  </span>
                </div>
                
                <div className="bg-cream rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate">SmartMatch Score</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                    <div className="h-full w-[92%] bg-forest rounded-full"></div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-forest">92</span>
                    <span className="text-sm text-sage">/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-emerald-700">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-white">
              Popular Services
            </h2>
            <p className="text-sage">
              Browse through our most requested service categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <Link
                href="/services"
                key={index}
                className="bg-white rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-sage"
              >
                <span className="text-4xl block mb-3">{service.icon}</span>
                <h3 className="text-base font-semibold text-slate mb-1">
                  {service.name}
                </h3>
                <p className="text-xs text-sage">{service.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate mb-3">
              How SmartMatch Works
            </h2>
            <p className="text-sage">
              Book a service in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="text-center p-8 rounded-xl hover:bg-cream transition-all duration-300"
              >
                <span className="inline-block bg-cream text-forest text-sm font-bold px-4 py-2 rounded-full mb-4">
                  {step.number}
                </span>
                <h3 className="text-xl font-semibold text-slate mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-sage">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-emerald-700 text-center">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-cream mb-8">
            Join SmartMatch today and experience hassle-free service booking
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-medium text-base transition-all duration-300 bg-white text-forest hover:bg-cream"
            >
              Sign Up Free
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-medium text-base transition-all duration-300 bg-transparent text-white border-2 border-white hover:bg-white hover:text-forest"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}