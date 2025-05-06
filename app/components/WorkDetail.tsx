'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

// Define the structure for a single work item (matching page.tsx)
interface Work {
  id: string;
  name: string;
  Description: string;
  Gallery: string[];
}

interface WorkDetailProps {
  work: Work;
  onClose: () => void; // Function to call when closing the detail view
}

export default function WorkDetail({ work, onClose }: WorkDetailProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Trigger the slide-in animation shortly after mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // Small delay to ensure transition is applied
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // Handle closing animation
  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to finish before calling onClose
    setTimeout(onClose, 500); // Match duration-500
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === work.Gallery.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? work.Gallery.length - 1 : prevIndex - 1
    );
  };

  // Prevent rendering if work is null (although parent should handle this)
  if (!work) return null;

  return (
    // Full screen overlay container
    <div
      className={`fixed inset-0 bg-white z-50 flex transform transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Left Side: Gallery Slider */}
      <div className="w-2/3 h-full bg-gray-100 relative flex items-center justify-center overflow-hidden">
        {work.Gallery && work.Gallery.length > 0 ? (
          <>
            <Image
              // Use a unique key based on index and URL to force re-render on change
              key={`${currentImageIndex}-${work.Gallery[currentImageIndex]}`}
              src={work.Gallery[currentImageIndex]}
              alt={`${work.name} - Image ${currentImageIndex + 1}`}
              layout="fill" // Use layout="fill" for responsive background-like image
              objectFit="cover" // 'cover' or 'contain' based on preference
              className="transition-opacity duration-300 ease-in-out" // Optional fade effect
              priority={currentImageIndex === 0} // Prioritize loading the first image
              unoptimized // Add if using external URLs (like Notion's temporary ones)
            />
            {/* Navigation Arrows (only if more than one image) */}
            {work.Gallery.length > 1 && (
              <>
                <button
                  onClick={goToPrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 z-10"
                  aria-label="Previous Image"
                >
                  <Image src="/ic-chevron_left.svg" alt="Previous" width={60} height={60} />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 z-10"
                  aria-label="Next Image"
                >
                  <Image src="/ic-chevron_right.svg" alt="Next" width={60} height={60} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="text-gray-500">No images available</div>
        )}
      </div>

      {/* Right Side: Details */}
      <div className="w-1/3 h-full p-8 overflow-y-auto relative">
        {/* Close Button */}
        <div className="mb-24 text-right">
        <button
          onClick={handleClose}
          className="z-10"
          aria-label="Close"
        >
          <Image src="/ic-close.svg" alt="Close" width={24} height={24} />
        </button>
        </div>
        {/* Content */}
        <div className=""> {/* Add margin-top to avoid overlap with close button */}
          <h2 className="text-2xl font-bold mb-4">{work.name}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{work.Description}</p>
        </div>
      </div>
    </div>
  );
}