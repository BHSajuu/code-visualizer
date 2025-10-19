
import  { useState, useEffect } from 'react';
import axios from 'axios';
import Visualizer from './components/Visualizer';
import CodeDisplay from './components/CodeDisplay';


// Default bubble sort code for user convenience
const defaultCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`;


const styles = {
 
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'sans-serif',
    backgroundColor: '#111827',
    color: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
  },
  title: {
    textAlign: 'center',
    color: '#e5e7eb',
    marginBottom: '30px',
    fontSize: '2.5rem',
  },
  inputSection: { display: 'flex', gap: '20px', marginBottom: '20px' },
  editor: { flex: 1, display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '8px', fontWeight: 'bold', color: '#374151' },
  textarea: { 
    fontFamily: 'monospace', 
    fontSize: '0.9rem',
    padding: '10px', 
    border: '1px solid #d1d5db', 
    borderRadius: '8px', 
    minHeight: '250px',
    flexGrow: 1,
    resize: 'vertical'
  },
  button: {
    padding: '12px 25px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#16a34a', // A nice green color
    color: 'white',
    width: '100%',
    marginTop: '20px'
  },
  buttonDisabled: {
    backgroundColor: '#4b5563',
    cursor: 'not-allowed',
  },
  stepCounter: {
    margin: '0 15px',
    fontSize: '1.1rem',
    color: '#9ca3af',
    minWidth: '100px',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#9ca3af',
  },
  visualizationArea: {
    flex: 1, display: 'flex', flexDirection: 'column',
  },
  controls: {
    marginTop: '20px', display: 'flex', justifyContent: 'center',
    alignItems: 'center', gap: '20px',
  },
  controlButton: {
    padding: '8px 16px', fontSize: '0.9rem', cursor: 'pointer',
    borderRadius: '6px', border: '1px solid #d1d5db',
    backgroundColor: '#ffffff', color: '#374151',
  },
  controlButtonDisabled: { backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#9ca3af' },
};


function App() {
  const [code, setCode] = useState(defaultCode);
  const [inputData, setInputData] = useState('arr = [5, 1, 4, 2]');
  const [storyboard, setStoryboard] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVisualize = () => {
    setIsLoading(true);
    setError(null);
    setStoryboard([]);
    setCurrentStep(0);

    axios.post('http://127.0.0.1:8000/api/visualize', { code, input_data: inputData })
    .then(response => {
      setStoryboard(response.data.storyboard);
    })
    .catch(error => {
      console.error("There was an error fetching the storyboard!", error);
      const detail = error.response?.data?.detail || "Is the backend server running?";
      setError(`Failed to load data: ${detail}`);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleNext = () => {
    if (currentStep < storyboard.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>DSA Code Visualizer</h1>

      <div style={styles.inputSection}>
        <div style={styles.editor}>
          <label style={styles.label} htmlFor="codeInput">Algorithm Code (Python)</label>
          <textarea id="codeInput" style={styles.textarea} value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div style={styles.editor}>
          <label style={styles.label} htmlFor="dataInput">Initial Input Data</label>
          <textarea id="dataInput" style={styles.textarea} value={inputData} onChange={(e) => setInputData(e.target.value)} />
        </div>
      </div>
      
      <button onClick={handleVisualize} disabled={isLoading} style={{...styles.button, ...(isLoading && styles.buttonDisabled)}}>
        {isLoading ? 'Analyzing...' : 'Visualize Execution'}
      </button>

      <div style={styles.mainContent}>
        {error && <p style={{color: 'red', textAlign: 'center', width: '100%'}}>{error}</p>}
        {isLoading && <p style={{textAlign: 'center', width: '100%'}}>Loading storyboard from the server...</p>}
        
        {storyboard.length > 0 && !isLoading && (
          <>
            <CodeDisplay code={code} highlightedLine={storyboard[currentStep]?.line_highlighted} />
            <div style={styles.visualizationArea}>
              <Visualizer frame={storyboard[currentStep]} />
              <div style={styles.controls}>
                <button onClick={handlePrev} disabled={currentStep === 0} style={{...styles.controlButton, ...(currentStep === 0 && styles.controlButtonDisabled)}}>
                  Previous
                </button>
                <span style={styles.stepCounter}>
                  Step {currentStep} / {storyboard.length - 1}
                </span>
                <button onClick={handleNext} disabled={currentStep === storyboard.length - 1} style={{...styles.controlButton, ...(currentStep === storyboard.length - 1 && styles.controlButtonDisabled)}}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;