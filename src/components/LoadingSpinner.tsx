import React from 'react';
import { Droplets } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-lg animate-pulse">
            <Droplets className="h-8 w-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="text-lg font-semibold text-green-700 animate-pulse">
          Loading MoodMoment...
        </div>
      </div>
    </div>
  );
}