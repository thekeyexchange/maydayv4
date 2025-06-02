export default async function handler(req, res) {
  const { message } = req.body;
  const mood = message.includes('sad') ? 'sad' :
               message.includes('angry') ? 'angry' :
               message.includes('happy') ? 'happy' : 'neutral';

  try {
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are Mayday, a playful teenage AI companion who uses Gen X-style catchphrases and reacts to emotions.' },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await completion.json();
    const fallback = "Hmm, not sure what to say.";
    const reply = data?.choices?.[0]?.message?.content?.trim() || fallback;
    res.status(200).json({ text: reply, mood });
  } catch (err) {
    console.error("GPT fetch error:", err);
    res.status(500).json({ text: 'There was an error connecting to GPT-4.', mood: 'neutral' });
  }
}