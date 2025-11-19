import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-[var(--color-border-warm)] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Using display font (Righteous) with Merlot color */}
          <Link href="/" className="text-2xl font-display" style={{ color: 'var(--color-primary-dark)' }}>
            SipLocal
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search coffee shops, cafes..."
                className="w-full px-4 py-2.5 pl-10 pr-4 border rounded-full focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] bg-white/80 backdrop-blur-sm"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border-muted)',
                }}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5"
                style={{ color: 'var(--color-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-[var(--color-muted)] hover:text-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium shadow-sm hover:shadow-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

