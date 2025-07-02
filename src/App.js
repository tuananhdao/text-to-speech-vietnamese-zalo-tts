import React from 'react';
import TTSConverter from './components/TTSConverter';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Main Content */}
      <main className="main-content">
        <h1 className="app-title">Tạo giọng nói theo từng câu</h1>
        <TTSConverter />
      </main>
    </div>
  );
}

export default App; 