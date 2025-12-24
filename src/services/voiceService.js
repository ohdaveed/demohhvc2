// Voice-to-text service using Web Speech API

export const voiceService = {
  recognition: null,
  isListening: false,

  // Initialize speech recognition
  init: () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceService.recognition = new SpeechRecognition();
    voiceService.recognition.continuous = true;
    voiceService.recognition.interimResults = true;
    voiceService.recognition.lang = 'en-US';
    
    return true;
  },

  // Start listening
  startListening: (onResult, onError) => {
    if (!voiceService.recognition) {
      const initialized = voiceService.init();
      if (!initialized) {
        onError && onError('Speech recognition not supported');
        return false;
      }
    }

    voiceService.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      onResult && onResult({
        final: finalTranscript.trim(),
        interim: interimTranscript.trim(),
        isFinal: finalTranscript.length > 0,
      });
    };

    voiceService.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onError && onError(event.error);
    };

    voiceService.recognition.onend = () => {
      voiceService.isListening = false;
    };

    try {
      voiceService.recognition.start();
      voiceService.isListening = true;
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError && onError(error.message);
      return false;
    }
  },

  // Stop listening
  stopListening: () => {
    if (voiceService.recognition && voiceService.isListening) {
      voiceService.recognition.stop();
      voiceService.isListening = false;
      return true;
    }
    return false;
  },

  // Check if supported
  isSupported: () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  // Get listening status
  getListeningStatus: () => {
    return voiceService.isListening;
  },
};
