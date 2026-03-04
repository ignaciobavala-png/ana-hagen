// TODO: Add SoundCloud URL when available
// TODO: Add Resident Advisor URL when available
const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/anahagen__/",
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-cream py-10 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Copyright */}
        <p className="font-body text-xs tracking-[0.2em] uppercase text-cream/30">
          © 2025 Ana Hagen
        </p>

        {/* Social links */}
        <nav aria-label="Social media links">
          <ul className="flex items-center gap-6 md:gap-8">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-cream/40 hover:text-accent transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
