'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from 'react';
import WorkDetail from "./components/WorkDetail"; // Import the WorkDetail component

// Define the Work interface matching the API response
interface Work {
  id: string;
  name: string;
  Description: string;
  Gallery: string[];
}

export default function Home() {
  // Update state to hold Work objects
  const [works, setWorks] = useState<Work[]>([]);
  const [moreWorks, setMoreWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State to manage the selected work for the detail view (will be used later)
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedWork(null); // Reset selected work on new fetch
      try {
        const response = await fetch('/api/works');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Expecting data in the format { works: Work[], moreWorks: Work[] }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        // Ensure the fetched data conforms to the Work interface
        // Add type assertion or validation if necessary
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

  // Placeholder function to handle clicking a work item (will open detail view later)
  const handleWorkClick = (work: Work) => {
    console.log("Clicked work:", work.name); // Placeholder action
    setSelectedWork(work); // Set the selected work
    setIsSidebarOpen(false); // Close sidebar if open
    // Later: Add logic to open the detail view component
  };

  // Placeholder function to close the detail view (will be used later)
  const closeDetailView = () => {
    setSelectedWork(null);
  };

  return (
    // Add overflow-hidden when detail view is open to prevent background scroll
    <div className={`min-h-screen flex flex-col relative ${selectedWork ? 'overflow-hidden' : ''}`}>
      {/* Sidebar */}
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
            <Image src="/ic-close.svg" alt="Close" width={24} height={24} />
          </button>
        </div>
        <h2 className="text-gray-400 mb-4">more works</h2>
        {isLoading ? (
          <div className="flex h-20">
            <Image src="/ic-loading.svg" alt="Loading..." width={40} height={40} className="animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul>
            {/* Update sidebar list items */}
            {moreWorks.map((work) => (
              // Use work.id as key, display work.name
              // Use button for click handling
              <li key={work.id} className="mb-1">
                <button onClick={() => handleWorkClick(work)} className="hover:underline text-left w-full">
                  {work.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Header */}
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

      {/* Main Content */}
      <main className="flex flex-col px-8 py-16">
        <section id="works">
          <h2 className="text-gray-400 mb-2">works</h2>
          {isLoading ? (
            <div className="flex h-20">
              <Image src="/ic-loading.svg" alt="Loading..." width={40} height={40} className="animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <ul>
                {/* Update main works list items */}
                {works.map((work) => (
                  // Use work.id as key, display work.name
                  // Use button for click handling
                  <li key={work.id} className="mb-1">
                    <button onClick={() => handleWorkClick(work)} className="hover:underline text-left w-full">
                      {work.name}
                    </button>
                  </li>
                ))}
              </ul>
              {/* Only show 'more works' button if there are more works */}
              {moreWorks.length > 0 && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="mt-4 inline-block underline cursor-pointer"
                  disabled={isLoading || !!error}
                >
                  more works
                </button>
              )}
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

      {/* Footer */}
      <footer className="flex items-center h-[96px] px-8 text-xs text-gray-400 mt-auto">
        2025 © made by arketipe
      </footer>

      {/* Placeholder for Detail View Component (will be added later) */}
      {selectedWork && (
        <WorkDetail work={selectedWork} onClose={closeDetailView} />
      )}
    </div>
  );
}
