import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface VoiceSearchButtonProps {
  onSearch: (query: string) => void;
}

export default function VoiceSearchButton({
  onSearch,
}: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support voice recognition.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      let transcript = event.results[0][0].transcript;
      if (transcript.endsWith('.')) {
        transcript = transcript.slice(0, -1);
      }
      onSearch(transcript);
    };

    recognition.start();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={startListening}
      className={`p-2 rounded-full shadow-lg transition-colors ${
        isListening ? 'bg-red-500' : 'bg-blue-500'
      } text-white`}
    >
      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
    </motion.button>
  );
}
