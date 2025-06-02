import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [listening, setListening] = useState(false);
  const [response, setResponse] = useState("Hi, I'm Mayday!");
  const [mood, setMood] = useState("neutral");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setResponse("...");
      try {
        const res = await fetch('/api/mayday', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcript })
        });
        const data = await res.json();
        setResponse(data.text);
        setMood(data.mood);
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(data.text);
        utter.pitch = 1;
        utter.rate = 1;
        synth.speak(utter);
      } catch (err) {
        console.error('Fetch error:', err);
        setResponse("Sorry, something went wrong.");
      }
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (!listening && recognitionRef.current) {
      setListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Recognition start error:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      background: mood === 'happy' ? '#fffbcc' :
                 mood === 'sad' ? '#cce3ff' :
                 mood === 'angry' ? '#ffcccc' : '#eee'
    }}>
      <div style={{
        width: 160, height: 160, borderRadius: '50%',
        background: '#222', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, marginBottom: 20
      }}>{listening ? '🎤' : '😊'}</div>
      <p style={{ padding: 20, textAlign: 'center' }}>{response}</p>
      <button
        onMouseDown={startListening} onMouseUp={stopListening}
        onTouchStart={startListening} onTouchEnd={stopListening}
        style={{
          padding: '12px 24px', fontSize: '16px', borderRadius: '8px',
          border: 'none', backgroundColor: '#444', color: '#fff'
        }}
      >Tap & Hold to Talk</button>
    </div>
  );
}