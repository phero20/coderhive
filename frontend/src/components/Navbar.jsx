export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-blue-700">UrbanSupply AI</h1>
      <ul className="hidden md:flex gap-8 text-gray-700">
        <li className="hover:text-blue-700 cursor-pointer">Home</li>
        <li className="hover:text-blue-700 cursor-pointer">Features</li>
        <li className="hover:text-blue-700 cursor-pointer">How it Works</li>
        <li className="hover:text-blue-700 cursor-pointer">Use Cases</li>
        <li className="hover:text-blue-700 cursor-pointer">Demo</li>
      </ul>
      <button className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition">
        Sign In
      </button>
    </nav>
  );
}
