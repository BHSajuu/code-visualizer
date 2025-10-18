
import  { useState, useEffect } from 'react';
import axios from 'axios';
import Visualizer from './components/Visualizer';

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
  controls: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#374151',
    color: 'white',
    transition: 'background-color 0.2s',
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
  }
};


function App() {
  const [storyboard, setStoryboard] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/visualize')
      .then(response => {
        setStoryboard(response.data.storyboard);
      })
      .catch(error => {
        console.error("There was an error fetching the storyboard!", error);
        setError("Failed to load data from the server. Is the backend running?");
      });
  }, []); 

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

  const renderContent = () => {
    if (error) {
      return <p style={styles.loadingText}>{error}</p>;
    }
    if (storyboard.length > 0) {
      return (
        <>
          <Visualizer frame={storyboard[currentStep]} />
          <div style={styles.controls}>
            <button 
              onClick={handlePrev} 
              disabled={currentStep === 0}
              style={{...styles.button, ...(currentStep === 0 && styles.buttonDisabled)}}
            >
              Previous
            </button>
            <span style={styles.stepCounter}>
              Step {currentStep} / {storyboard.length - 1}
            </span>
            <button 
              onClick={handleNext} 
              disabled={currentStep === storyboard.length - 1}
              style={{...styles.button, ...(currentStep === storyboard.length - 1 && styles.buttonDisabled)}}
            >
              Next
            </button>
          </div>
        </>
      );
    }
    return <p style={styles.loadingText}>Loading storyboard from the server...</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>DSA Code Visualizer</h1>
      {renderContent()}
    </div>
  );
}

export default App;

