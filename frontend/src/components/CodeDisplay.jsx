
const CodeDisplay = ({ code, highlightedLine }) => {
  const lines = code.split('\n');

  return (
    <div className="flex-[1.2] font-mono bg-gray-800 text-gray-300 p-4 rounded-lg overflow-auto border border-gray-700 text-sm">
      <pre>
        <code>
          {lines.map((line, index) => {
            const isHighlighted = (index + 1) === highlightedLine;
            const lineClasses = isHighlighted 
              ? "flex py-1 px-2 border-l-4 border-blue-400 bg-blue-500/20"
              : "flex py-1 px-2 border-l-4 border-transparent";
            
            return (
              <div key={index} className={lineClasses}>
                <span className="select-none pr-4 text-gray-500 text-right w-8">{index + 1}</span>
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