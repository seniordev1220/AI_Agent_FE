import React from 'react';

export const LoadingDots = () => {
  return (
    <div className="flex items-center space-x-2">
      <style jsx>{`
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        .loading-dot {
          animation: blink 1.4s infinite both;
        }
        .loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>
      <div className="loading-dot w-2 h-2 bg-gray-400 rounded-full"></div>
      <div className="loading-dot w-2 h-2 bg-gray-400 rounded-full"></div>
      <div className="loading-dot w-2 h-2 bg-gray-400 rounded-full"></div>
    </div>
  );
}; 
