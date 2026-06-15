import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractString(obj: any): string {
  if (!obj) return "";
  if (typeof obj === 'string') return obj;
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const res = extractString(item);
      if (res) return res;
    }
  }
  
  if (typeof obj === 'object') {
    const priorities = ['text', 'output', 'content', 'response', 'value'];
    for (const key of priorities) {
      if (obj[key] && typeof obj[key] === 'string') {
        return obj[key];
      }
    }
    if (obj.message) {
      const res = extractString(obj.message);
      if (res) return res;
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === 'req' || key === 'request' || key === 'headers') continue;
        const res = extractString(obj[key]);
        if (res) return res;
      }
    }
  }
  return "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, recipientEmail } = body;

    if (!prompt || !recipientEmail) {
      return NextResponse.json({ error: 'Missing prompt or recipient' }, { status: 400 });
    }

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

    if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL === "http://placeholder-url.com") {
        return NextResponse.json({ 
          success: true, 
          subject: "Simulated Subject Line",
          body: "This is a simulated professional email draft for testing purposes." 
        });
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, recipientEmail }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger n8n workflow');
    }

    const aiData = await response.json();
    
    let rawText = "";
    const targetObj = Array.isArray(aiData) ? aiData[0] : aiData;
    
    if (targetObj?.content?.parts?.[0]?.text) {
      rawText = targetObj.content.parts[0].text;
    } else {
      rawText = extractString(aiData);
    }
    
    // Default fallback values if parsing fails
    let subject = "Professional Email";
    let bodyText = rawText;

    // Smart Parser: Split the text at the SUBJECT: and BODY: designators
    if (rawText.toUpperCase().includes("SUBJECT:") && rawText.toUpperCase().includes("BODY:")) {
      const match = rawText.match(/SUBJECT:\s*(.*?)\s*BODY:\s*([\s\S]*)/i);
      if (match) {
        subject = match[1].trim();
        bodyText = match[2].trim();
      }
    }

    // Clean up any stray markdown code blocks if the AI accidentally added them
    subject = subject.replace(/```json|```/g, "").trim();

    return NextResponse.json({ success: true, subject, body: bodyText });

  } catch (error) {
    console.error("Backend API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}