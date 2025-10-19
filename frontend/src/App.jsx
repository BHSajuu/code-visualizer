import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Visualizer from './components/Visualizer';
import CodeDisplay from './components/CodeDisplay';

const defaultCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`;

function App() {
  const [code, setCode] = useState(defaultCode);
  const [inputData, setInputData] = useState('arr = [5, 1, 4, 2]');
  const [storyboard, setStoryboard] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);

  useEffect(() => {
    if (isPlaying && currentStep < storyboard.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentStep >= storyboard.length - 1) {
      setIsPlaying(false);
    }
  }, [currentStep, isPlaying, storyboard.length, speed]);

  const handleVisualize = () => {
    setIsPlaying(false);
    setIsLoading(true);
    setError(null);
    setStoryboard([]);
    setCurrentStep(0);
    axios.post('http://127.0.0.1:8000/api/visualize', { code, input_data: inputData })
      .then(response => setStoryboard(response.data.storyboard))
      .catch(err => {
        const detail = err.response?.data?.detail || "Is the backend server running?";
        setError(`Failed to load data: ${detail}`);
      })
      .finally(() => setIsLoading(false));
  };

  const handleNext = () => !isPlaying && currentStep < storyboard.length - 1 && setCurrentStep(currentStep + 1);
  const handlePrev = () => !isPlaying && currentStep > 0 && setCurrentStep(currentStep - 1);
  const handleReset = () => { setIsPlaying(false); setCurrentStep(0); };
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleSpeedChange = (e) => setSpeed(1100 - e.target.value);

  const buttonClasses = "px-4 py-2 text-sm font-medium rounded-md transition-colors";
  const disabledButtonClasses = "bg-gray-200 text-gray-400 cursor-not-allowed";
  const enabledButtonClasses = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">DSA Code Visualizer</h1>
        <p className="mt-2 text-lg text-gray-500">See your algorithms in action, step by step.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="codeInput" className="block text-sm font-semibold text-gray-700 mb-2">Algorithm Code (Python)</label>
          <textarea id="codeInput" className="w-full h-64 p-3 font-mono text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div>
          <label htmlFor="dataInput" className="block text-sm font-semibold text-gray-700 mb-2">Initial Input Data</label>
          <textarea id="dataInput" className="w-full h-64 p-3 font-mono text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500" value={inputData} onChange={(e) => setInputData(e.target.value)} />
        </div>
      </div>
      
      <button onClick={handleVisualize} disabled={isLoading} className="w-full py-3 px-6 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all">
        {isLoading ? 'Analyzing...' : 'Visualize Execution'}
      </button>

      <div className="mt-8">
        {error && <p className="text-center text-red-500 font-medium">{error}</p>}
        {isLoading && <p className="text-center text-gray-500">Loading storyboard...</p>}
        
        {storyboard.length > 0 && !isLoading && (
          <div className="flex flex-col lg:flex-row gap-6">
            <CodeDisplay code={code} highlightedLine={storyboard[currentStep]?.line_highlighted} />
            <div className="flex-1 flex flex-col">
              <Visualizer frame={storyboard[currentStep]} />
              <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <button onClick={handlePlayPause} className={`${buttonClasses} ${enabledButtonClasses}`}>{isPlaying ? 'Pause' : 'Play'}</button>
                  <button onClick={handleReset} className={`${buttonClasses} ${enabledButtonClasses}`}>Reset</button>
                  <div className="flex items-center gap-2">
                    <label htmlFor="speed" className="text-sm font-medium text-gray-600">Speed</label>
                    <input type="range" id="speed" min="100" max="1000" defaultValue="700" onChange={handleSpeedChange} disabled={isPlaying} className="w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrev} disabled={isPlaying || currentStep === 0} className={`${buttonClasses} ${isPlaying || currentStep === 0 ? disabledButtonClasses : enabledButtonClasses}`}>Prev</button>
                  <span className="text-sm font-medium text-gray-600 w-28 text-center">Step {currentStep}/{storyboard.length - 1}</span>
                  <button onClick={handleNext} disabled={isPlaying || currentStep === storyboard.length - 1} className={`${buttonClasses} ${isPlaying || currentStep === storyboard.length - 1 ? disabledButtonClasses : enabledButtonClasses}`}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;