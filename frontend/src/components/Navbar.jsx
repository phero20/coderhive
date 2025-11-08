export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 md:px-8 py-4 bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <a href="#home" className="text-2xl font-bold text-blue-700 tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded">
        UrbanSupply AI
      </a>
      <ul className="hidden md:flex gap-6 lg:gap-8 text-gray-700">
        {[
          { href: '#home', label: 'Home' },
          { href: '#features', label: 'Features' },
          { href: '#how-it-works', label: 'How it Works' },
          { href: '#cta', label: 'Get Started' },
          { href: '#footer', label: 'Contact' },
        ].map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="relative inline-block px-0.5 py-1 text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
            >
              <span className="after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full"></span>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <a
        href="#cta"
        className="hidden md:inline-flex items-center bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-transform duration-200 hover:bg-blue-800 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        Sign In
      </a>
    </nav>
  );
}
