import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white/95 backdrop-blur-sm py-4 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <Link to="/" className="flex-shrink-0 group">
          <img 
            className="h-16 transition-transform duration-200 group-hover:scale-105" 
            src="/pictures/pawsomeart_logo/PawsomeArt_logo_dark.png" 
            alt="PawsomeArt Logo" 
          />
        </Link>
        

      </div>
    </header>
  );
};

export default Header;