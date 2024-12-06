import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useHotkeys } from 'react-hotkeys-hook';

interface VoiceSearchButtonProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export default function VoiceSearchButton({
  onSearch,
  isSearching = false,
}: VoiceSearchButtonProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check browser support
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setErrorMessage('Browser does not support speech recognition');
    }
  }, []);

  const stopListening = useCallback(() => {
    setListening(false);
    toast.dismiss('voice-interim');
  }, []);

  // Add keyboard shortcuts
  useHotkeys('ctrl+shift+s', () => {
    if (!listening) startListening();
  });

  useHotkeys('esc', () => {
    if (listening) {
      stopListening();
      toast.dismiss();
    }
  });

  const startListening = useCallback(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setListening(true);
        setTranscript('');
        toast.success('Listening... (Press Esc to cancel)', {
          icon: '🎤',
          duration: 3000,
        });
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update transcript for display
        setTranscript(interimTranscript || finalTranscript);

        // Show interim results
        if (interimTranscript) {
          toast.loading(`Heard: ${interimTranscript}`, { id: 'voice-interim' });
        }

        // If we have a final result, send it
        if (finalTranscript) {
          const cleanedTranscript = finalTranscript
            .trim()
            .replace(/[.,!?]$/, '');
          onSearch(cleanedTranscript);
          stopListening();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
        toast.error(`Error: ${event.error}`);
      };

      recognition.onend = () => {
        stopListening();
        if (!transcript) {
          toast.error('No speech detected. Please try again.');
        }
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error('Failed to start speech recognition');
      setListening(false);
    }
  }, [errorMessage, onSearch, stopListening, transcript]);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={startListening}
      disabled={listening || isSearching || !!errorMessage}
      className={`p-2 rounded-full shadow-lg transition-colors relative ${
        listening
          ? 'bg-red-500'
          : errorMessage
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500'
      } text-white`}
      title={errorMessage || 'Search by voice (Ctrl+Shift+S)'}
      aria-label='Voice search'
    >
      <AnimatePresence mode='wait'>
        {isSearching ? (
          <motion.div
            key='loading'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className='w-6 h-6 animate-spin' />
          </motion.div>
        ) : listening ? (
          <motion.div
            key='listening'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            exit={{ opacity: 0 }}
          >
            <MicOff className='w-6 h-6' />
          </motion.div>
        ) : (
          <motion.div
            key='mic'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Mic className='w-6 h-6' />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show transcript feedback */}
      {listening && transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-black/75 text-white text-sm rounded-lg whitespace-nowrap'
        >
          {transcript}
        </motion.div>
      )}
    </motion.button>
  );
}
// Add type declaration for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}
