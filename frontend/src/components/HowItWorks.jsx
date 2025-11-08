export default function HowItWorks() {
  const steps = [
    {
      title: "1. Input / Ingest",
      desc: "Upload project schedules or enter project details — our system analyzes your upcoming construction timeline.",
    },
    {
      title: "2. Forecast & Optimize",
      desc: "Our ML engine predicts demand per material and computes ideal procurement windows to minimize cost.",
    },
    {
      title: "3. Act & Automate",
      desc: "Generate purchase lists, send RFQs, or set alerts directly from your dashboard for seamless execution.",
    },
  ];

  return (
    <section className="px-8 md:px-20 py-16 bg-blue-50" id="how-it-works">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
        How It Works
      </h2>
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {steps.map((s, i) => (
          <div
            key={i}
            className="group rounded-2xl bg-white p-6 shadow transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-within:shadow-md"
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              {s.title}
            </h3>
            <p className="text-gray-600">{s.desc}</p>
            <a href="#cta" className="mt-4 inline-block text-sm text-blue-700 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded transition-colors">Get started →</a>
          </div>
        ))}
      </div>
    </section>
  );
}
