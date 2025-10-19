import React from 'react';

const styles = {
  container: {
    flex: 1.2, // Make it slightly larger than the visualizer
    fontFamily: 'monospace',
    backgroundColor: '#1f2937', // A dark background for the code
    color: '#d1d5db', // Light gray text
    padding: '15px',
    borderRadius: '8px',
    overflow: 'auto', // Add scrollbars if code is long
    fontSize: '0.9rem',
    border: '1px solid #374151',
  },
  line: {
    padding: '2px 10px',
    display: 'flex',
    borderLeft: '2px solid transparent', // For alignment
  },
  lineNumber: {
    userSelect: 'none', // Prevent selecting the line number
    paddingRight: '15px',
    color: '#6b7280', // Dim the line numbers
  },
  highlightedLine: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)', // A blueish highlight
    borderLeft: '2px solid #3b82f6',
  },
};

const CodeDisplay = ({ code, highlightedLine }) => {
  const lines = code.split('\n');

  return (
    <div style={styles.container}>
      <pre>
        <code>
          {lines.map((line, index) => {
            const isHighlighted = (index + 1) === highlightedLine;
            return (
              <div
                key={index}
                style={isHighlighted ? { ...styles.line, ...styles.highlightedLine } : styles.line}
              >
                <span style={styles.lineNumber}>{String(index + 1).padStart(2, ' ')}</span>
                <span>{line}</span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
};

export default CodeDisplay;
