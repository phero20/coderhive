export default function Footer() {
  return (
    <footer id="footer" className="bg-white py-8 text-center text-gray-500 border-t">
      <p>© 2025 UrbanSupply AI — All rights reserved.</p>
      <div className="mt-2 space-x-4">
        <a href="#" className="relative inline-block px-1 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full">
          Privacy Policy
        </a>
        <a href="#" className="relative inline-block px-1 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full">
          Terms of Service
        </a>
        <a href="#" className="relative inline-block px-1 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full">
          Contact
        </a>
      </div>
    </footer>
  );
}
