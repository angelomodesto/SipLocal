import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-[var(--color-border-warm)] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Using display font (Righteous) with Merlot color */}
          <Link href="/" className="text-4xl font-display" style={{ color: 'var(--color-primary-dark)' }}>
            SipLocal
          </Link>

          {/* Navigation & User Menu */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-[var(--color-muted)] hover:text-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
              >
                Home
              </Link>
              <Link
                href="/cafes"
                className="px-4 py-2 text-[var(--color-muted)] hover:text-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
              >
                All Cafés
              </Link>
            </nav>
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
      </div>
    </header>
  );
}

