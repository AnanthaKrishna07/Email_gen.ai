import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, recipientEmail } = body;

    // 1. Validate the input from the frontend
    if (!prompt || !recipientEmail) {
      return NextResponse.json({ error: 'Missing prompt or recipient' }, { status: 400 });
    }

    // 2. Grab the secret webhook URL from .env.local
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

    // Phase 2 Testing: If we haven't added the real n8n URL yet, simulate the connection
    if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL === "http://placeholder-url.com") {
        console.log("Backend securely received data:", { recipientEmail, prompt });
        
        // Simulate a 1.5 second network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        return NextResponse.json({ success: true, message: 'Simulated success!' });
    }

    // 3. Phase 3 Production Logic: Send the data to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, recipientEmail }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger n8n workflow');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Backend API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}