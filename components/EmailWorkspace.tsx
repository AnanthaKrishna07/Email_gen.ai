"use client";

import { useState, FormEvent } from 'react';

export default function EmailWorkspace() {
  const [prompt, setPrompt] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // We will build this API route in the next phase!
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, recipientEmail: recipient }),
      });

      if (res.ok) {
        setStatus('success');
        setPrompt('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      // Logging the error fixes the TypeScript warning and helps with debugging
      console.error("Failed to send email:", error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-black">
      <h2 className="text-2xl font-bold mb-2">howru Co-Pilot</h2>
      <p className="text-gray-500 mb-6">Generate and send professional emails instantly.</p>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
          <input
            type="email"
            required
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="client@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What should the email say?</label>
          <textarea
            required
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a polite follow-up asking for the Q3 report..."
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {status === 'loading' ? 'Sending to n8n...' : 'Generate & Send Email'}
        </button>

        {status === 'success' && (
          <p className="text-green-600 text-center font-medium mt-2">Email queued successfully!</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-center font-medium mt-2">API Error. Check the backend.</p>
        )}
      </form>
    </div>
  );
}