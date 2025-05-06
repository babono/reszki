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

  // State to manage the selected work for the detail view
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  // --- New state for password prompt ---
  const [promptWork, setPromptWork] = useState<Work | null>(null); // Work item needing password
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false); // Toggle prompt view
  const [passwordInput, setPasswordInput] = useState(''); // Password input value
  const [passwordError, setPasswordError] = useState<string | null>(null); // Password error message
  // --- End new state ---

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

  // Modified function to handle clicking a work item
  const handleWorkClick = (work: Work, isFromMoreWorks: boolean = false) => {
    console.log("Clicked work:", work.name, "Is from more works:", isFromMoreWorks);
    setPasswordError(null); // Clear previous errors
    setPasswordInput('');   // Clear previous input

    if (isFromMoreWorks) {
      // Trigger password prompt for 'moreWorks' items
      setPromptWork(work);
      setShowPasswordPrompt(true);
      // Keep sidebar open, don't set selectedWork yet
    } else {
      // Directly show detail for main 'works' items
      setSelectedWork(work);
      setIsSidebarOpen(false); // Close sidebar if open
      setShowPasswordPrompt(false); // Ensure prompt is hidden
      setPromptWork(null);
    }
  };

  // Function to handle password submission
  const handlePasswordSubmit = () => {
    if (passwordInput === "labschool") {
      setSelectedWork(promptWork); // Set the selected work
      setIsSidebarOpen(false);     // Close the sidebar
      // Reset password state
      setShowPasswordPrompt(false);
      setPromptWork(null);
      setPasswordInput('');
      setPasswordError(null);
    } else {
      setPasswordError("Incorrect password"); // Show error message
    }
  };

  // Function to go back from password prompt to the list
  const handleGoBack = () => {
    setShowPasswordPrompt(false);
    setPromptWork(null);
    setPasswordInput('');
    setPasswordError(null);
  };

  // Function to close the sidebar completely
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    // Reset password state when closing sidebar
    setShowPasswordPrompt(false);
    setPromptWork(null);
    setPasswordInput('');
    setPasswordError(null);
  };


  // Placeholder function to close the detail view
  const closeDetailView = () => {
    setSelectedWork(null);
  };

  return (
    // Add overflow-hidden when detail view is open to prevent background scroll
    <div className={`min-h-screen flex flex-col relative ${selectedWork ? 'overflow-hidden' : ''}`}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1b1b1b] opacity-75 z-40"
          onClick={closeSidebar} // Use updated close function
        ></div>
      )}
      {/* Sidebar Content */}
      <div
        className={`fixed top-0 left-0 h-full w-120 bg-white p-8 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* --- Conditional Rendering for Sidebar Content --- */}
        {showPasswordPrompt && promptWork ? (
          // --- Password Prompt View ---
          <div>
            <div className="flex justify-between items-center mb-24">
               <button onClick={handleGoBack} aria-label="Go back to list">
                 <Image src="/ic-arrow_back.svg" alt="Back" width={24} height={24} />
               </button>
               <button onClick={closeSidebar} aria-label="Close sidebar">
                 <Image src="/ic-close.svg" alt="Close" width={24} height={24} />
               </button>
            </div>
            <h2 className="font-bold mb-10">{promptWork.name}</h2>
            <p className="text-sm text-gray-600 mb-4">please enter the password to view this project.</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="password"
              className="border-0 rounded px-2 py-1 w-full my-10  focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}
            <button
              onClick={handlePasswordSubmit}
              className="text-gray-500 hover:underline"
            >
              view project
            </button>
          </div>
          // --- End Password Prompt View ---
        ) : (
          // --- More Works List View (Original Content) ---
          <div>
            <div className="mb-24 text-right">
              <button onClick={closeSidebar} aria-label="Close sidebar">
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
                {moreWorks.map((work) => (
                  <li key={work.id} className="mb-1">
                    {/* Pass true for isFromMoreWorks */}
                    <button onClick={() => handleWorkClick(work, true)} className="hover:underline text-left w-full">
                      {work.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          // --- End More Works List View ---
        )}
        {/* --- End Conditional Rendering --- */}
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
                {works.map((work) => (
                  <li key={work.id} className="mb-1">
                    {/* Pass false or omit isFromMoreWorks for main list */}
                    <button onClick={() => handleWorkClick(work)} className="hover:underline text-left w-full">
                      {work.name}
                    </button>
                  </li>
                ))}
              </ul>
              {moreWorks.length > 0 && (
                <button
                  onClick={() => setIsSidebarOpen(true)} // Just open sidebar, list shows by default
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

      {/* Detail View Component */}
      {selectedWork && (
        <WorkDetail work={selectedWork} onClose={closeDetailView} />
      )}
    </div>
  );
}
