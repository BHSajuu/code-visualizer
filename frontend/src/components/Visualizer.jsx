import React from 'react';

const Visualizer = ({ frame }) => {
  if (!frame) {
    return <div>Loading frame...</div>;
  }

  // Extract highlights at component level so it can be accessed throughout
  const highlights = frame.data_structure_state.highlights;

  // A more robust function to determine cell color based on multiple highlights
  const getCellColor = (index) => {
    
    // Check for highlights in order of importance
    if (highlights.swapping?.includes(index)) {
      return '#ef4444'; // Red for swapping
    }
    if (highlights.comparing?.includes(index)) {
      return '#f59e0b'; // Amber for comparing
    }
    // --- NEW: Add a color for sorted elements ---
    if (highlights.sorted?.includes(index)) {
      return '#22c55e'; // Green for sorted
    }
    
    return '#6b7280'; // Gray for default
  };

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '12px' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#1f2937' }}>
        Step {frame.step}: <span style={{ fontWeight: 'normal' }}>{frame.explanation}</span>
      </p>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginTop: '20px', 
        padding: '10px',
        minHeight: '70px', // Ensure consistent height
      }}>
        {frame.data_structure_state.values.map((value, index) => (
          <div key={index} style={{
            width: '50px',
            height: '50px',
            backgroundColor: getCellColor(index),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            transition: 'background-color 0.3s ease-out, transform 0.2s ease',
            transform: `translateY(${highlights.swapping?.includes(index) ? '-10px' : '0px'})` // Add a small lift for swapping elements
          }}>
            {value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Visualizer;
