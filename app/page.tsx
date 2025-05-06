'use client';

import Link from "next/link";
import Image from "next/image"; // Import the Next.js Image component
import { useState, useEffect } from 'react';

export default function Home() {
  const [works, setWorks] = useState<string[]>([]);
  const [moreWorks, setMoreWorks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/works');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setWorks(data.works || []);
        setMoreWorks(data.moreWorks || []);
      } catch (e: any) {
        console.error("Failed to fetch works:", e);
        setError("Failed to load works. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1b1b1b] opacity-75 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full w-120 bg-white p-8 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-24 text-right">
          <button
            onClick={() => setIsSidebarOpen(false)}            
          >
            {/* Use the close icon */}
            <Image src="/ic-close.svg" alt="Close" width={24} height={24} />
          </button>
        </div>        
        <h2 className="text-gray-400 mb-4">more works</h2>
        {isLoading ? (
          // Use the loading icon
          <div className="flex h-20"> {/* Optional: Center the loader */}
            <Image src="/ic-loading.svg" alt="Loading..." width={40} height={40} className="animate-spin" /> {/* Added spin animation */}
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul>
            {moreWorks.map((work) => (
              <li key={work} className="mb-1">
                <Link href="#" className="hover:underline">
                  {work}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <header className="flex justify-between items-center h-[96px] px-8">
        <h1 className="font-bold text-2xl">reszki hanitra</h1>
        <nav className="flex gap-16">
          <Link href="#works" className="hover:underline">
            works
          </Link>
          <Link href="#contact" className="hover:underline">
            contact
          </Link>
        </nav>
      </header>

      <main className="flex flex-col px-8 py-16">
        <section id="works">
          <h2 className="text-gray-400 mb-2">works</h2>
          {isLoading ? (
            <div className="flex h-20"> {/* Optional: Center the loader */}
              <Image src="/ic-loading.svg" alt="Loading..." width={40} height={40} className="animate-spin" /> {/* Added spin animation */}
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <ul>
                {works.map((work) => (
                  <li key={work} className="mb-1">
                    <Link href="#" className="hover:underline">
                      {work}
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mt-4 inline-block underline cursor-pointer"
                disabled={isLoading || !!error}
              >
                more works
              </button>
            </>
          )}
        </section>

        <section id="contact" className="mt-16">
          <h2 className="text-gray-400 mb-2">contact</h2>
          <a href="mailto:rszkhp@gmail.com" className="hover:underline">
            rszkhp@gmail.com
          </a>
        </section>
      </main>

      <footer className="flex items-center h-[96px] px-8 text-xs text-gray-400 mt-auto">
        2025 © made by arketipe
      </footer>
    </div>
  );
}
