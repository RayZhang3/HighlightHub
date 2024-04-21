// pages/api/GetTranscriptionAnalyze.js
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  runtime: 'experimental-edge',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Only POST requests allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const { transcript,rating, fullContent} = await req.json();
  console.log('Received request with:', { transcript, rating, fullContent })
  const IntRating = parseInt(rating, 10);
  if (!transcript || typeof IntRating === 'undefined' || !fullContent) {
    return new Response(JSON.stringify({ message: 'Missing required fields: transcript, rating, fullContent' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Here you might adjust the prompt based on your specific needs
  const prompt = `The following transcript "${transcript}" from the content needs to be analyzed at a technical understanding level of ${rating}. Given the context of the full content: "${fullContent}", provide a detailed analysis.`;

  try {
    console.log('Calling OpenAI with request:', transcript)
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 250,
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant. When providing an analysis for the specific sentence, consider a technical understanding level of ${IntRating}.
          [Level 1] Create an explanation of the sentence suitable for someone with little to no technical knowledge. Use simple analogies and examples from everyday life. Output the explanation in a paragraph with clear, easy-to-understand language.
          [Level 2]Create an explanation of the sentence for someone with a basic understanding of technology. Include simple examples and analogies that relate to common technology uses. The output should be a short paragraph with a focus on relatable concepts.
          [Level 3]Create an explanation of the sentence for someone with a general understanding of technology and its applications. Discuss the example related to it and give a high-level overview of its meaning. The output should be a concise paragraph that is technically accurate but still accessible. 
          [Level 4] Generate an explanation of the sentence suitable for someone with an intermediate technical background. Include a discussion on related concepts. Provide a range of applications and their use cases. The output should be a detailed paragraph covering the broader aspects of it.
          [Level 5] Compose an explanation of the sentence for someone with advanced technical knowledge or experience in the field. Detail the complexity of it. Discuss some advanced applications of it. The output should be a comprehensive paragraph that delves into the technical depth of it, suitable for an expert audience. `,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Use OpenAIStream to handle the response in streaming mode
    const stream = OpenAIStream(response);

    // Convert the response into a friendly text-stream and send it back
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch response from OpenAI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
