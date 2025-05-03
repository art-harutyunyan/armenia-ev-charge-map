
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm mb-4">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-blue">Armenia EV Charging Map</h1>
            <p className="text-gray-600">Find all charging stations across Armenia</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-team-energy"></div>
              <span className="text-sm">Team Energy</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-evan-charge"></div>
              <span className="text-sm">Evan Charge</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
