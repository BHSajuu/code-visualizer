import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CodeDisplay from './components/CodeDisplay';
import Visualizer from './components/Visualizer';


// Default bubble sort code for user convenience
const defaultCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`;

const styles = {
  container: { maxWidth: '1200px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  title: { textAlign: 'center', color: '#111827', marginBottom: '30px', fontWeight: 'bold' },
  inputSection: { display: 'flex', gap: '20px', marginBottom: '20px' },
  editor: { flex: 1, display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '8px', fontWeight: '600', color: '#374151' },
  textarea: { fontFamily: 'monospace', fontSize: '0.9rem', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '250px', flexGrow: 1, resize: 'vertical' },
  button: { padding: '12px 25px', fontSize: '1.1rem', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', width: '100%', transition: 'background-color 0.2s' },
  buttonDisabled: { backgroundColor: '#9ca3af', cursor: 'not-allowed' },
  mainContent: { display: 'flex', gap: '20px', marginTop: '30px', alignItems: 'flex-start' },
  visualizationArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  controls: { marginTop: '20px', padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  playbackControls: { display: 'flex', alignItems: 'center', gap: '15px' },
  stepControls: { display: 'flex', alignItems: 'center', gap: '10px' },
  controlButton: { padding: '8px 16px', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151' },
  controlButtonDisabled: { backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#9ca3af' },
  stepCounter: { fontSize: '1rem', color: '#4b5563', minWidth: '100px', textAlign: 'center', fontWeight: '500' },
  speedControl: { display: 'flex', alignItems: 'center', gap: '10px' },
};

function App() {
  const [code, setCode] = useState(defaultCode);
  const [inputData, setInputData] = useState('arr = [5, 1, 4, 2]');
  const [storyboard, setStoryboard] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400); // Delay in milliseconds

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
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleSpeedChange = (e) => {
    setSpeed(1100 - e.target.value);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>DSA Code Visualizer</h1>
      <div style={styles.inputSection}>
        <div style={styles.editor}><label style={styles.label} htmlFor="codeInput">Algorithm Code (Python)</label><textarea id="codeInput" style={styles.textarea} value={code} onChange={(e) => setCode(e.target.value)} /></div>
        <div style={styles.editor}><label style={styles.label} htmlFor="dataInput">Initial Input Data</label><textarea id="dataInput" style={styles.textarea} value={inputData} onChange={(e) => setInputData(e.target.value)} /></div>
      </div>
      <button onClick={handleVisualize} disabled={isLoading} style={{...styles.button, ...(isLoading && styles.buttonDisabled)}}>{isLoading ? 'Analyzing...' : 'Visualize Execution'}</button>
      <div style={styles.mainContent}>
        {error && <p style={{color: 'red', textAlign: 'center', width: '100%'}}>{error}</p>}
        {isLoading && <p style={{textAlign: 'center', width: '100%'}}>Loading storyboard...</p>}
        {storyboard.length > 0 && !isLoading && (
          <>
            <CodeDisplay code={code} highlightedLine={storyboard[currentStep]?.line_highlighted} />
            <div style={styles.visualizationArea}>
              <Visualizer frame={storyboard[currentStep]} />
              <div style={styles.controls}>
                <div style={styles.playbackControls}>
                  <button onClick={handlePlayPause} style={styles.controlButton}>{isPlaying ? 'Pause' : 'Play'}</button>
                  <button onClick={handleReset} style={styles.controlButton}>Reset</button>
                  <div style={styles.speedControl}>
                    <label htmlFor="speed" style={{fontSize: '0.9rem'}}>Speed</label>
                    <input type="range" id="speed" min="100" max="1000" defaultValue="700" onChange={handleSpeedChange} disabled={isPlaying} />
                  </div>
                </div>
                <div style={styles.stepControls}>
                  <button onClick={handlePrev} disabled={isPlaying || currentStep === 0} style={{...styles.controlButton, ...((isPlaying || currentStep === 0) && styles.controlButtonDisabled)}}>Prev</button>
                  <span style={styles.stepCounter}>Step {currentStep}/{storyboard.length - 1}</span>
                  <button onClick={handleNext} disabled={isPlaying || currentStep === storyboard.length - 1} style={{...styles.controlButton, ...((isPlaying || currentStep === storyboard.length - 1) && styles.controlButtonDisabled)}}>Next</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;