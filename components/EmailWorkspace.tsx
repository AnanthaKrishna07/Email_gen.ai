"use client";

import { useState, FormEvent } from 'react';

export default function EmailWorkspace() {
  const [prompt, setPrompt] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [status, setStatus] = useState<string>('idle');

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // 1. Open a blank tab IMMEDIATELY within the user click interaction loop
    // This maintains native browser trust and bypasses pop-up blockers completely
    const gmailTab = window.open('', '_blank');

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, prompt }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.body)}`;
        
        // 2. Safely redirect the background tab once the AI text is ready
        if (gmailTab) {
          gmailTab.location.href = gmailUrl;
        }
        setPrompt(''); 
      } else {
        if (gmailTab) gmailTab.close();
        setStatus('error');
      }
    } catch (error) {
      if (gmailTab) gmailTab.close();
      console.error("Pipeline processing failure:", error);
      setStatus('error');
    }
  };

  return (
    <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-[0_20px_50px_rgba(30,41,59,0.05)] text-slate-900 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(30,41,59,0.08)]">
      
      {/* BACKGROUND WATERMARK LAYER - Day Mode Soft Luminance Blend */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.07] pointer-events-none mix-blend-multiply select-none"
        style={{ backgroundImage: "url('/img.webp')" }}
      />

      {/* Vibrant Day Mode Header Block */}
      <div className="relative p-8 border-b border-slate-100 bg-slate-50/40 backdrop-blur-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Email_gen-ai
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Automated Generation Interface & Dispatch Copilot
          </p>
        </div>
        
        {/* Status Indicator Badge */}
        <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Engine Active</span>
        </div>
      </div>

      {/* Interactive Form Fields */}
      <form onSubmit={handleSend} className="relative p-8 space-y-6">
        
        {/* Destination Target Input */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
            Target Destination Address
          </label>
          <input
            type="email"
            required
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full bg-slate-50/50 text-slate-900 font-medium border border-slate-200 rounded-xl px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder-slate-400 text-sm"
            placeholder="hr@enterprise.com"
          />
        </div>

        {/* Content Intent Textarea */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
            Core Context & Structural Intent
          </label>
          <textarea
            required
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-50/50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 outline-none resize-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder-slate-400 leading-relaxed text-sm"
            placeholder="Instruct the model (e.g., 'Write a professional job follow-up for the Software Engineering position at IBM...')"
          />
        </div>

        {/* Action Dispatch Button */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all duration-200 flex items-center justify-center space-x-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
        >
          {status === 'loading' ? (
            <>
              <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Structuring Input Strings...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
              <span>Generate & Compile Draft</span>
            </>
          )}
        </button>

        {/* Operational Status Banners */}
        {status === 'success' && (
          <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200/60 p-4 rounded-xl text-emerald-800 animate-fadeIn">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-semibold tracking-wide">Context processed cleanly. Handing payload off to active Gmail instance...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex items-center space-x-3 bg-rose-50 border border-rose-200/60 p-4 rounded-xl text-rose-800 animate-fadeIn">
            <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs font-semibold tracking-wide">Pipeline Interruption Detected. Verify local n8n routing configurations.</p>
          </div>
        )}
      </form>
    </div>
  );
}