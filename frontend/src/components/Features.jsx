export default function Features() {
  const features = [
    {
      title: "AI Demand Forecasting",
      desc: "Weekly & monthly forecasts per material based on project schedules, BOM, and historical usage trends.",
    },
    {
      title: "Procurement Planner",
      desc: "Get intelligent suggestions on order timing, lot size, and safety stock levels for cost-efficient purchases.",
    },
    {
      title: "Inventory Optimization",
      desc: "Track inventory health, prevent overstocking, and manage reorders with ML-driven insights.",
    },
    {
      title: "Vendor Match & RFQ",
      desc: "Auto-suggest vendors by price, distance, and reliability score. Send RFQs with one click.",
    },
    {
      title: "Price & Market Signals",
      desc: "Monitor material price trends and get alerts on spikes or drops to time your purchases smartly.",
    },
    {
      title: "Urban Demand Map",
      desc: "Visualize city-wide demand heatmaps to coordinate material supply and logistics efficiently.",
    },
  ];

  return (
    <section className="px-8 md:px-20 py-16 bg-white" id="features">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
        What Makes UrbanSupply AI Different
      </h2>
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl bg-blue-50 p-6 shadow transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-within:shadow-md"
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              {f.title}
            </h3>
            <p className="text-gray-600">{f.desc}</p>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-blue-600/50 transition-transform duration-300 group-hover:scale-x-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
