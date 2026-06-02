export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto w-full px-8 py-8 mt-auto border-t border-white/10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[#7a8480] text-sm">
            © {new Date().getFullYear()} Alan Emanuel Stefanov
          </span>
          <span className="text-[#4a5450] hidden sm:inline">·</span>
          <a
            href="https://github.com/anomalyco"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4a5450] hover:text-[#4ef07c] transition-colors text-sm"
          >
            GitHub
          </a>
        </div>
        <div className="font-mono text-[11px] text-[#4a5450] text-right">
          <span className="font-serif text-sm font-light">
            Flow<span className="italic text-[#4ef07c]">Finance</span>
          </span>
          <span className="mx-2">—</span>
          Impulsando la transparencia financiera a través del código abierto.
        </div>
      </div>
    </footer>
  );
}
