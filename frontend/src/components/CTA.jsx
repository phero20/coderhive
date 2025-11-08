export default function CTA() {
  return (
    <section id="cta" className="text-center py-20 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-t-3xl">
      <h2 className="text-3xl font-bold mb-4">
        Ready to Stop Guessing and Start Forecasting?
      </h2>
      <p className="text-blue-100 mb-8">
        Try a demo forecast and see your first material plan in 30 seconds.
      </p>
      <a
        href="#home"
        className="inline-flex items-center bg-white text-blue-700 font-medium px-6 py-3 rounded-lg shadow-sm transition-all duration-200 hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
      >
        Run Demo Forecast — It’s Free
      </a>
    </section>
  );
}
