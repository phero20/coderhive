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
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-3">
              {s.title}
            </h3>
            <p className="text-gray-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
