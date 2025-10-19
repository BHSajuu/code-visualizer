import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const Visualizer = ({ frame }) => {
  // useRef is used to get a direct reference to the SVG DOM element
  const svgRef = useRef(null);

  // This useEffect hook will run every time the 'frame' prop changes
  useEffect(() => {
    if (!frame || !svgRef.current) return;

    const { values, highlights } = frame.data_structure_state;
    const svg = d3.select(svgRef.current);

    const width = 300;
    const height = 150;
    const barPadding = 10;
    const barWidth = (width - (values.length - 1) * barPadding) / values.length;

    // Set SVG dimensions
    svg.attr('width', width).attr('height', height);

    // --- Color Logic ---
    const getColor = (index) => {
      if (highlights.swapping?.includes(index)) return '#ef4444'; // Red
      if (highlights.comparing?.includes(index)) return '#f59e0b'; // Amber
      if (highlights.sorted?.includes(index)) return '#22c55e'; // Green
      return '#6b7280'; // Gray
    };

    // --- D3 Data Join ---
    // This is the core of D3. We bind our `values` array to a selection of 'g' (group) elements.
    const groups = svg.selectAll('g')
      .data(values, (d, i) => i); // Use index as the key for object constancy

    // --- ENTER selection (for new elements) ---
    const enterGroups = groups.enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${i * (barWidth + barPadding)}, 0)`);

    enterGroups.append('rect')
      .attr('width', barWidth)
      .attr('height', barWidth) // Make them squares for a clean look
      .attr('y', height / 2 - barWidth / 2) // Center vertically
      .attr('rx', 8) // Rounded corners
      .attr('fill', (d, i) => getColor(i));

    enterGroups.append('text')
      .text(d => d)
      .attr('x', barWidth / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '1.25rem');

    // --- UPDATE selection (for existing elements that need to change) ---
    const t = svg.transition().duration(400).ease(d3.easeCubicOut);

    groups.select('rect')
      .transition(t)
      .attr('fill', (d, i) => getColor(i));

    // Animate the movement of the groups for swaps
    groups.transition(t)
      .attr('transform', (d, i) => `translate(${i * (barWidth + barPadding)}, 0)`);

  }, [frame]); // The hook dependencies: re-run ONLY when 'frame' changes

  return (
    <div className="text-center p-4 bg-gray-100 rounded-xl border border-gray-200">
      <p className="text-lg font-medium text-gray-800">
        Step {frame.step}: <span className="font-normal text-gray-600">{frame.explanation}</span>
      </p>
      <div className="flex justify-center mt-4 min-h-[150px]">
        {/* The ref is attached here, so D3 knows which SVG to control */}
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default Visualizer;

