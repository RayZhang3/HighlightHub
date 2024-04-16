// pages/api/gpt.js
import OpenAI from "openai";

import { OpenAIStream, StreamingTextResponse } from 'ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  try {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
      });

    const { prompt } = req.body;
    // console.error('Prompt:', prompt);


    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {"role": "system", "content": "You are a helpful assistant, help me to summarize this text:"},
          {"role": "user", "content": prompt}
        ],
        stream: true,
        max_tokens: 300,
      });


      for await (const chunk of completion) {
        console.log(chunk.choices[0].delta.content);
      }
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
  }
}