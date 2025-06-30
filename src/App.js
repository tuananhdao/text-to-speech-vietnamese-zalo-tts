import React from 'react';
import TTSConverter from './components/TTSConverter';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <h1>Vietnamese TTS Converter</h1>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <TTSConverter />
      </main>
    </div>
  );
}

export default App; 