import React, { useState } from 'react';

const TTSConverter = () => {
  const [inputText, setInputText] = useState('');
  const [sentences, setSentences] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSpeaker, setSelectedSpeaker] = useState('6'); // Default to South women 2
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(-1);

  // Available speakers
  const SPEAKERS = [
    { id: '1', name: 'Nữ Nam', emoji: '👩‍🦱' },
    { id: '2', name: 'Nữ Bắc', emoji: '👩‍🦰' },
    { id: '3', name: 'Nam Nam', emoji: '👨‍🦱' },
    { id: '4', name: 'Nam Bắc', emoji: '👨‍🦰' },
    { id: '5', name: 'Nữ Bắc 2', emoji: '👩‍🦳' },
    { id: '6', name: 'Nữ Nam 2', emoji: '👩‍🦲' }
  ];

  // TTS API configuration from environment variables
  const TTS_API_CONFIG = {
    url: 'https://api.zalo.ai/v1/tts/synthesize',
    apiKey: process.env.REACT_APP_ZALO_API_KEY,
    speakerId: selectedSpeaker,
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

  // Play all audio files sequentially
  const handlePlayAll = async () => {
    const completedSentences = sentences.filter(s => s.status === 'completed' && s.audioUrl);
    
    if (completedSentences.length === 0) {
      alert('Không có file âm thanh nào để phát');
      return;
    }

    setIsPlayingAll(true);
    setCurrentPlayingIndex(0);

    const playSequentially = (index) => {
      if (index >= completedSentences.length) {
        setIsPlayingAll(false);
        setCurrentPlayingIndex(-1);
        return;
      }

      const sentence = completedSentences[index];
      const audio = new Audio(sentence.audioUrl);
      
      audio.onended = () => {
        setCurrentPlayingIndex(index + 1);
        setTimeout(() => playSequentially(index + 1), 500); // Small delay between tracks
      };
      
      audio.onerror = () => {
        console.error(`Error playing audio for sentence ${sentence.id}`);
        setCurrentPlayingIndex(index + 1);
        setTimeout(() => playSequentially(index + 1), 500);
      };
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setCurrentPlayingIndex(index + 1);
        setTimeout(() => playSequentially(index + 1), 500);
      });
    };

    playSequentially(0);
  };

  // Stop playing all
  const handleStopAll = () => {
    setIsPlayingAll(false);
    setCurrentPlayingIndex(-1);
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
        
        {/* Control Panel - Speaker Selection and Generate Button */}
        <div className="control-panel">
          {/* Voice Selection Section */}
          <div className="voice-selection-panel">
            <div className="voice-selection">
              {SPEAKERS.map((speaker) => (
                <button
                  key={speaker.id}
                  className={`voice-btn ${selectedSpeaker === speaker.id ? 'active' : ''}`}
                  onClick={() => setSelectedSpeaker(speaker.id)}
                  disabled={isProcessing}
                  title={speaker.name}
                >
                  <span className="voice-emoji">{speaker.emoji}</span>
                  <span className="voice-name">{speaker.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button Section */}
          <div className="generate-section">
            <button
              className="btn btn-primary generate-btn"
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
        </div>
      </div>



      {/* Results Section */}
      {sentences.length > 0 && (
        <div className="converter-section">
          <div className="results-header">
            <h2>Kết quả ({sentences.length} câu)</h2>
            {sentences.some(s => s.status === 'completed' && s.audioUrl) && (
              <button
                className={`btn play-all-btn ${isPlayingAll ? 'playing' : ''}`}
                onClick={isPlayingAll ? handleStopAll : handlePlayAll}
                disabled={isProcessing}
              >
                {isPlayingAll ? (
                  <>
                    <svg className="stop-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                    </svg>
                    Dừng phát
                  </>
                ) : (
                  <>
                    <svg className="play-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7z" fill="currentColor"/>
                    </svg>
                    Phát tất cả
                  </>
                )}
              </button>
            )}
          </div>
          <div className="results-section">
            <table className="results-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Câu</th>
                  <th>Phát</th>
                  <th>Tải</th>
                </tr>
              </thead>
              <tbody>
                {sentences.map((sentence, index) => (
                  <tr key={sentence.id} className={`sentence-row ${sentence.status} ${
                    isPlayingAll && 
                    sentences.filter(s => s.status === 'completed' && s.audioUrl)[currentPlayingIndex]?.id === sentence.id 
                      ? 'currently-playing' : ''
                  }`}>
                    <td>{sentence.id}</td>
                    <td>
                      <div className="sentence-text">
                        {sentence.text}
                      </div>
                      {sentence.error && (
                        <div className="sentence-error">
                          Lỗi: {sentence.error}
                        </div>
                      )}
                      {sentence.status === 'processing' && (
                        <div className="sentence-processing">
                          <span className="spinner"></span>
                          Đang xử lý...
                        </div>
                      )}
                    </td>
                    <td>
                      {sentence.status === 'completed' && sentence.audioUrl ? (
                        <audio 
                          controls 
                          preload="none"
                          className="audio-player"
                        >
                          <source src={sentence.audioUrl} type="audio/wav" />
                          Trình duyệt không hỗ trợ audio
                        </audio>
                      ) : (
                        <div className="audio-placeholder">
                          {sentence.status === 'processing' ? '...' : '---'}
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-icon download-btn"
                        onClick={() => handleDownload(sentence)}
                        disabled={sentence.status !== 'completed'}
                        title="Tải xuống"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15l-4-4h3V4h2v7h3l-4 4z" fill="currentColor"/>
                          <path d="M20 18H4v2h16v-2z" fill="currentColor"/>
                        </svg>
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