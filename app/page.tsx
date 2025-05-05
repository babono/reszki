import Link from "next/link";

export default function Home() {
  const works = [
    "suryani residence",
    "the stillroom",
    "karsa house",
    "the nord atelier",
    "linehill pavillion",
    "villa meru selatan",
    "una's pizzeria",
    "transit 11 hub",
    "sudirman edge tower",
    "arketipe studios",
  ];

  return (
    <div className="min-h-screen flex flex-col p-8 sm:p-16 font-[family-name:var(--font-geist-sans)] text-sm">
      <header className="flex justify-between items-center mb-16">
        <h1 className="font-medium">reszki hanitra</h1>
        <nav className="flex gap-6">
          <Link href="#works" className="hover:underline">
            works
          </Link>
          <Link href="#contact" className="hover:underline">
            contact
          </Link>
        </nav>
      </header>

      <main className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-16">
        <section id="works">
          <h2 className="text-gray-400 mb-2">works</h2>
          <ul>
            {works.map((work) => (
              <li key={work} className="mb-1">
                <Link href="#" className="hover:underline">
                  {work}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="#" className="mt-4 inline-block underline">
            more works
          </Link>
        </section>

        <section id="contact" className="self-start sm:self-end sm:justify-self-start">
          <h2 className="text-gray-400 mb-2">contact</h2>
          <a href="mailto:rszkhp@gmail.com" className="hover:underline">
            rszkhp@gmail.com
          </a>
        </section>
      </main>

      <footer className="mt-16 text-xs text-gray-400 text-center">
        2025 © made by arketipe
      </footer>
    </div>
  );
}
