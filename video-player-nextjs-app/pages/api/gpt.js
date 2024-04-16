// pages/api/gpt.js
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set the Next.js function to run on the edge runtime
export const config = {
  runtime: 'experimental-edge',
};

// API handler function for POST requests
export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Only POST requests allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt } = await req.json();
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 300,
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant, help me to summarize this text:',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch response from OpenAI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
