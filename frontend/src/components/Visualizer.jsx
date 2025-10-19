import React from 'react';

const Visualizer = ({ frame }) => {
  if (!frame) {
    return <div className="text-center p-4">Loading frame...</div>;
  }

  const { highlights, values } = frame.data_structure_state;

  const getCellClasses = (index) => {
    let baseClasses = "w-14 h-14 flex items-center justify-center text-white text-xl font-bold rounded-lg transition-all duration-300 ease-in-out";
    
    if (highlights.swapping?.includes(index)) {
      return `${baseClasses} bg-red-500 -translate-y-2`; // Red for swapping + lift
    }
    if (highlights.comparing?.includes(index)) {
      return `${baseClasses} bg-amber-500`; // Amber for comparing
    }
    if (highlights.sorted?.includes(index)) {
      return `${baseClasses} bg-green-500`; // Green for sorted
    }
    
    return `${baseClasses} bg-gray-500`; // Gray for default
  };

  return (
    <div className="text-center p-4 bg-gray-100 rounded-xl border border-gray-200">
      <p className="text-lg font-medium text-gray-800">
        Step {frame.step}: <span className="font-normal text-gray-600">{frame.explanation}</span>
      </p>
      <div className="flex justify-center gap-3 mt-4 min-h-[70px] p-2">
        {values.map((value, index) => (
          <div key={index} className={getCellClasses(index)}>
            {value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Visualizer;