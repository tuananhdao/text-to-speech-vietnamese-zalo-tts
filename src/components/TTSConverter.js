import React, { useState } from 'react';

const TTSConverter = () => {
  const [inputText, setInputText] = useState('');
  const [sentences, setSentences] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // TTS API configuration from environment variables
  const TTS_API_CONFIG = {
    url: 'https://api.zalo.ai/v1/tts/synthesize',
    apiKey: process.env.REACT_APP_ZALO_API_KEY,
    speakerId: '6',
    speed: '1.2',
    encodeType: '0'
  };

  // Check if API key is available
  if (!TTS_API_CONFIG.apiKey) {
    console.error('REACT_APP_ZALO_API_KEY environment variable is not set');
  }

  // Split text into sentences
  const splitIntoSentences = (text) => {
    // Vietnamese sentence endings: . ! ? 。 ！ ？
    const sentences = text
      .split(/[.!?。！？]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
    
    return sentences.map((sentence, index) => ({
      id: index + 1,
      text: sentence,
      status: 'pending', // pending, processing, completed, error
      audioUrl: null,
      error: null
    }));
  };

  // Call TTS API for a single sentence
  const callTTSAPI = async (sentence) => {
    try {
      const formData = new FormData();
      formData.append('input', sentence);
      formData.append('speaker_id', TTS_API_CONFIG.speakerId);
      formData.append('speed', TTS_API_CONFIG.speed);
      formData.append('encode_type', TTS_API_CONFIG.encodeType);

      const response = await fetch(TTS_API_CONFIG.url, {
        method: 'POST',
        headers: {
          'apikey': TTS_API_CONFIG.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.url) {
        return data.data.url;
      } else {
        throw new Error('Invalid API response: missing audio URL');
      }
    } catch (error) {
      console.error('TTS API error:', error);
      throw error;
    }
  };

  // Process all sentences
  const handleGenerate = async () => {
    if (!inputText.trim()) {
      alert('Vui lòng nhập văn bản để chuyển đổi');
      return;
    }

    if (!TTS_API_CONFIG.apiKey) {
      alert('Lỗi: API key chưa được cấu hình. Vui lòng kiểm tra file .env');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    const sentenceList = splitIntoSentences(inputText);
    setSentences(sentenceList);

    // Process each sentence
    for (let i = 0; i < sentenceList.length; i++) {
      const sentence = sentenceList[i];
      
      // Update status to processing
      setSentences(prev => 
        prev.map(s => 
          s.id === sentence.id 
            ? { ...s, status: 'processing' }
            : s
        )
      );

      try {
        const audioUrl = await callTTSAPI(sentence.text);
        
        // Update with success
        setSentences(prev => 
          prev.map(s => 
            s.id === sentence.id 
              ? { ...s, status: 'completed', audioUrl }
              : s
          )
        );
      } catch (error) {
        // Update with error
        setSentences(prev => 
          prev.map(s => 
            s.id === sentence.id 
              ? { ...s, status: 'error', error: error.message }
              : s
          )
        );
      }

      // Update progress
      setProgress(((i + 1) / sentenceList.length) * 100);
      
      // Add delay to avoid rate limiting
      if (i < sentenceList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsProcessing(false);
  };

  // Download audio file
  const handleDownload = async (sentence) => {
    if (!sentence.audioUrl) return;

    try {
      const response = await fetch(sentence.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentence_${sentence.id}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Lỗi khi tải file âm thanh');
    }
  };

  // Get status display
  const getStatusDisplay = (sentence) => {
    switch (sentence.status) {
      case 'pending':
        return <span className="status status-pending">Chờ xử lý</span>;
      case 'processing':
        return (
          <span className="status status-processing">
            <span className="spinner"></span>
            Đang xử lý
          </span>
        );
      case 'completed':
        return <span className="status status-completed">Hoàn thành</span>;
      case 'error':
        return <span className="status status-error">Lỗi</span>;
      default:
        return <span className="status status-pending">Chờ xử lý</span>;
    }
  };

  return (
    <div className="tts-converter">
      {/* Input Section */}
      <div className="converter-section">
        <h2>Nhập văn bản tiếng Việt</h2>
        <textarea
          className="text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập văn bản tiếng Việt cần chuyển đổi thành giọng nói..."
          disabled={isProcessing}
        />
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={isProcessing || !inputText.trim()}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Đang xử lý...
            </>
          ) : (
            'Tạo giọng nói'
          )}
        </button>
      </div>

      {/* Progress Section */}
      {isProcessing && (
        <div className="converter-section">
          <h2>Tiến trình xử lý</h2>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(progress)}% hoàn thành
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {sentences.length > 0 && (
        <div className="converter-section">
          <h2>Kết quả ({sentences.length} câu)</h2>
          <div className="results-section">
            <table className="results-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Câu</th>
                  <th>Trạng thái</th>
                  <th>Tải xuống</th>
                </tr>
              </thead>
              <tbody>
                {sentences.map((sentence) => (
                  <tr key={sentence.id}>
                    <td>{sentence.id}</td>
                    <td>
                      <div className="sentence-text">
                        {sentence.text}
                      </div>
                      {sentence.error && (
                        <div style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px' }}>
                          Lỗi: {sentence.error}
                        </div>
                      )}
                    </td>
                    <td>
                      {getStatusDisplay(sentence)}
                    </td>
                    <td>
                      <button
                        className="btn btn-small"
                        onClick={() => handleDownload(sentence)}
                        disabled={sentence.status !== 'completed'}
                      >
                        Tải xuống
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TTSConverter; 