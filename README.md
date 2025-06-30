# Vietnamese Text-to-Speech Converter

DEMO: http://tts.ignify.co

A modern React web application for converting Vietnamese text to speech using the Zalo TTS API.

## Features

- **Simple Interface**: Clean, user-friendly design with minimal buttons
- **Vietnamese Text Processing**: Automatically splits text into sentences for optimal audio generation
- **Real-time Progress**: Shows progress as each sentence is processed
- **Download Audio Files**: Individual download buttons for each generated audio file
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful error handling with user feedback

## Technology Stack

- **Frontend**: React 18 with functional components and hooks
- **API**: Zalo TTS API for Vietnamese text-to-speech conversion
- **Audio Format**: WAV files for high-quality audio output

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone or download the project files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your Zalo API key
   # REACT_APP_ZALO_API_KEY=your_actual_api_key_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Enter Text**: Type or paste Vietnamese text into the textarea
2. **Generate Audio**: Click the "Tạo giọng nói" (Generate Speech) button
3. **Monitor Progress**: Watch the progress bar and status indicators
4. **Download Files**: Click individual "Tải xuống" (Download) buttons for each completed sentence

## API Configuration

The application uses the Zalo TTS API with the following configuration:
- **API Endpoint**: `https://api.zalo.ai/v1/tts/synthesize`
- **API Key**: Configured via environment variable `REACT_APP_ZALO_API_KEY`
- **Speaker ID**: 6 (Vietnamese voice)
- **Speed**: 1.2x (slightly faster than normal)
- **Output Format**: WAV audio files

### Environment Variables

Create a `.env` file in the project root with:
```
REACT_APP_ZALO_API_KEY=your_zalo_api_key_here
```

**Important**: Never commit your `.env` file to version control. The actual API key should be kept secure.

## Features in Detail

### Text Processing
- Automatically splits text on Vietnamese sentence boundaries (. ! ? 。 ！ ？)
- Filters out empty sentences
- Processes each sentence individually for better API performance

### Status Tracking
- **Chờ xử lý** (Pending): Sentence is queued for processing
- **Đang xử lý** (Processing): Currently being converted to speech
- **Hoàn thành** (Completed): Audio file is ready for download
- **Lỗi** (Error): An error occurred during processing

### Error Handling
- Network errors are caught and displayed
- Invalid API responses are handled gracefully
- Rate limiting is implemented with 1-second delays between requests

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

Note: The application requires modern browser support for ES6+ features and the Fetch API.

## Limitations

- Internet connection required for API calls
- Processing time depends on text length and API response time
- File downloads depend on browser download policies

## Development

### Project Structure
```
src/
├── components/
│   └── TTSConverter.js    # Main TTS converter component
├── App.js                 # Main application component
├── App.css               # Styles following design system
└── index.js              # React entry point
```

### Build for Production
```bash
npm run build
```

This creates a `build` folder with optimized production files.

## License

This project is for educational and demonstration purposes. 