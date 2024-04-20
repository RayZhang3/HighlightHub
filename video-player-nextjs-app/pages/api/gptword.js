// pages/api/gptword.js
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  runtime: 'experimental-edge',
};

function generatebasePrompts(word, rating) {
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
  switch (rating) {
    case 1:
      return `Create an explanation of ${word} suitable for someone with little to no technical knowledge. Use simple analogies and examples from everyday life. Output the explanation in a paragraph with clear, easy-to-understand language.`;
    case 2:
      return `Develop an explanation of ${word} for someone with a basic understanding of technology. Include simple examples and analogies that relate to common technology uses. The output should be a short paragraph with a focus on relatable concepts.`;
    case 3:
      return `Craft an explanation of ${word} for someone with a general understanding of technology and its applications. Discuss the example related to ${word} and give a high-level overview of its meaning. The output should be a concise paragraph that is technically accurate but still accessible.`;
    case 4:
      return `Generate an explanation of ${word} suitable for someone with an intermediate technical background. Include a discussion on related concepts. Provide a range of applications and their use cases. The output should be a detailed paragraph covering the broader aspects of it.`;
    case 5:
      return `Compose an explanation of ${word} for someone with advanced technical knowledge or experience in the field. Detail the complexity of it. Discuss some advanced applications of it. The output should be a comprehensive paragraph that delves into the technical depth of it, suitable for an expert audience.`;
    default:
      return '';}
};

const examples = {
  1: `[Question]: What is machine learning?
[Answer]: Machine learning is like teaching a computer to learn from experience. Just as you might learn a new skill by practicing and getting feedback, computers can improve their performance by analyzing data. For example, when you shop online and see product recommendations based on what you've viewed before, that's machine learning at work.`,
  2: `[Question]: What is machine learning?
  [Answer]: Machine learning is a type of technology that allows computers to learn from data and make predictions or decisions without being explicitly programmed. Think of it like a smart assistant that learns your preferences over time. For example, streaming services use machine learning to suggest movies and shows you might like based on your viewing history. Similarly, email apps use it to filter spam, learning to recognize which emails are unwanted.`,
  3: `[Question]: What is machine learning?
  [Answer]: Machine learning encompasses a variety of algorithms and techniques that enable computers to learn from data and make decisions or predictions based on that learning. It involves supervised learning, where models are trained with labeled data, and unsupervised learning, where models identify patterns in unlabeled data.`,
  4: `[Question]: What is machine learning?
  [Answer]: Machine learning involves a variety of computational methods for learning from data. Techniques include supervised learning with labeled datasets, unsupervised learning for discovering hidden patterns, and reinforcement learning where models learn through trial and error. Applications range from simple classification tasks to complex decision-making processes in real-world scenarios.`,
  5: `[Question]: What is machine learning?
  [Answer]: Machine learning is a sophisticated domain of artificial intelligence involving numerous algorithms and models designed to learn from large-scale data. It includes supervised learning with specific labeled outcomes, unsupervised learning to identify complex patterns and relationships in unlabeled data, and reinforcement learning, where agents learn optimal behaviors through interactions with an environment. Applications cover a wide range, from deep learning and neural networks for complex pattern recognition to probabilistic models for statistical analysis and predictive analytics.`
};

const instructions = `#Instructions
1. Please remember that you should only output the Answer part. There is no need to provide any additional text or information other than the answer itself. 
2. If you don't understand the content, it is okay to guess. However, if the content is unclear or unreadable, it is best to remind the user that there might be some errors.
3. Do not mention that "I am an AI language model. I am GPT and I might not comprehend it."
4. The answer should be less than 250 words.`;

function generatePrompt(word, rating) {
  const basePrompt = generatebasePrompts(word, rating);
  const example = examples[rating];
  const prompt = `${basePrompt}\n\nHere are prompts based on the given levels of understanding for the explanation of "${word}"?\n${example}\n\n${instructions}`;
  return prompt;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Only POST requests allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('word and rating', req.body);
    const { word, rating } = await req.json();
    const intRating = parseInt(rating, 10);
    const final_prompt = generatePrompt(word, intRating);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 250,
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant, help me to explain this concept.\n' + final_prompt,
        },
        {
          role: 'user',
          content: `What is ${word}?`,
        },
      ],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch response from OpenAI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}