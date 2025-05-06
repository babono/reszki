'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, MouseEvent } from 'react'; // Import MouseEvent
import WorkDetail from "./components/WorkDetail"; // Import the WorkDetail component

// Define the Work interface matching the API response
interface Work {
  id: string;
  name: string;
  Description: string;
  Gallery: string[];
}

// Define a type for the raw data before processing
// Allows Gallery to be potentially something other than string[] initially
interface RawWork {
  id: string;
  name: string;
  Description: string;
  Gallery: unknown; // Use unknown for initial flexibility
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

  // --- State for sneak peek ---
  const [hoveredWorkImage, setHoveredWorkImage] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  // --- End sneak peek state ---

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
        // Assume the API returns an object with works and moreWorks properties
        // which are arrays of RawWork or similar structure.
        const data: { works?: unknown[], moreWorks?: unknown[], error?: string } = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        // Ensure Gallery is always an array
        // Type the input parameter more strictly
        const processWorks = (workList: unknown[] | undefined): Work[] =>
          (workList || []).map((work: unknown) => {
            // Type assertion after checking structure (use with caution or add more robust checks)
            const rawWork = work as RawWork;
            return {
              ...rawWork,
              Gallery: Array.isArray(rawWork.Gallery) ? rawWork.Gallery as string[] : [],
            };
          });

        setWorks(processWorks(data.works));
        setMoreWorks(processWorks(data.moreWorks));

      } catch (e: unknown) { // Change 'any' to 'unknown'
        // Type check the error before accessing properties
        let errorMessage = "Failed to load works. Please try again later.";
        if (e instanceof Error) {
          errorMessage = `Failed to load works: ${e.message}. Please try again later.`;
        }
        console.error("Failed to fetch works:", e);
        setError(errorMessage);
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
    setHoveredWorkImage(null); // Hide sneak peek on click

    if (isFromMoreWorks) {
      // Trigger password prompt for 'moreWorks' items
      setPromptWork(work);
      setShowPasswordPrompt(true);
      setIsSidebarOpen(true); // Ensure sidebar is open for prompt
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
    // Don't close the sidebar, just show the list again
  };

  // Function to close the sidebar completely
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    // Reset password state when closing sidebar
    setShowPasswordPrompt(false);
    setPromptWork(null);
    setPasswordInput('');
    setPasswordError(null);
    setHoveredWorkImage(null); // Hide sneak peek
  };

  // Placeholder function to close the detail view
  const closeDetailView = () => {
    setSelectedWork(null);
  };

  // --- Sneak Peek Handlers ---
  const handleMouseEnterWork = (work: Work) => {
    if (work.Gallery && work.Gallery.length > 0) {
      setHoveredWorkImage(work.Gallery[0]);
    }
  };

  const handleMouseLeaveWork = () => {
    setHoveredWorkImage(null);
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };
  // --- End Sneak Peek Handlers ---

  return (
    // Add overflow-hidden when detail view is open to prevent background scroll
    // Add onMouseMove here to track cursor position globally within the main container
    <div
      className={`min-h-screen flex flex-col relative ${selectedWork ? 'overflow-hidden' : ''}`}
      onMouseMove={handleMouseMove} // Track mouse movement for sneak peek positioning
    >
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
              className="border-0 rounded px-2 py-1 w-full my-10 focus:border-gray-500 focus:ring-1 focus:ring-gray-500" // Removed invalid focus:border-gray-500:focus:ring-gray-500
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
                  <li
                    key={work.id}
                    className="mb-1"
                    onMouseEnter={() => handleMouseEnterWork(work)} // Add mouse enter
                    onMouseLeave={handleMouseLeaveWork}           // Add mouse leave
                  >
                    {/* Pass false or omit isFromMoreWorks for main list */}
                    <button onClick={() => handleWorkClick(work)} className="hover:underline text-left w-full">
                      {work.name}
                    </button>
                  </li>
                ))}
              </ul>
              {moreWorks.length > 0 && (
                <button
                  onClick={() => {
                    setIsSidebarOpen(true); // Just open sidebar
                    setShowPasswordPrompt(false); // Ensure password prompt is hidden initially
                    setPromptWork(null); // Clear any potential leftover prompt work
                  }}
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
        2025 © made by&nbsp;<Link href="https://arketipe.id/" className="underline">arketipe</Link>
      </footer>

      {/* Detail View Component */}
      {selectedWork && (
        <WorkDetail work={selectedWork} onClose={closeDetailView} />
      )}

      {/* Sneak Peek Image */}
      {hoveredWorkImage && (
        <div
          className="fixed pointer-events-none z-[60] transition-opacity duration-200" // High z-index, ignore pointer events
          style={{
            left: `${cursorPosition.x + 15}px`, // Position based on cursor with offset
            top: `${cursorPosition.y + 15}px`,
            opacity: 1, // Could add fade-in/out later if desired
          }}
        >
          <Image
            src={hoveredWorkImage}
            alt="Sneak peek"
            width={240} // Adjust size as needed
            height={240} // Adjust size as needed
            className="object-cover rounded shadow-md bg-gray-50" // Basic styling
            unoptimized // If images are external and not optimized by Next.js
          />
        </div>
      )}
    </div>
  );
}
