export default function Hero() {
  return (
    <section id="home" className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Predict Material Demand. Buy Smarter. Finish Projects on Time.
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          UrbanSupply AI uses machine learning to forecast material demand for
          urban projects — helping contractors, vendors, and manufacturers plan
          procurement, optimize inventory, and eliminate costly delays.
        </p>
        <div className="flex gap-4">
          <a
            href="#cta"
            className="inline-flex items-center bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm transition-all duration-200 hover:bg-blue-800 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-50"
          >
            Try Demo — Forecast Now
          </a>
          <a
            href="#features"
            className="inline-flex items-center border border-blue-700 text-blue-700 px-6 py-3 rounded-lg transition-all duration-200 hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-50"
          >
            See Features
          </a>
        </div>
      </div>
    </section>
  );
}
