export default function Hero() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20 bg-gradient-to-br from-white to-blue-50">
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
          <button className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition">
            Try Demo — Forecast Now
          </button>
          <button className="border border-blue-700 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-100 transition">
            See Features
          </button>
        </div>
      </div>

      <img
        src="https://cdn3d.iconscout.com/3d/premium/thumb/supply-chain-management-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--distribution-logistics-product-delivery-pack-illustrations-5844387.png"
        alt="AI Forecasting Illustration"
        className="w-80 md:w-96 mt-10 md:mt-0"
      />
    </section>
  );
}
