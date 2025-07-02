// File: index.js (Node.js using Vercel AI SDK with Gemini)
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import dotenv from 'dotenv';
dotenv.config();

const google = createGoogleGenerativeAI({
  "apiKey" : process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

const runChat = async () => {
  const result = await generateText({
    model: google('gemini-1.5-flash'),
    prompt: 'Suggest a test for a pregnant woman with abdominal pain and no fetal heart sounds.',
  });

  console.log('Gemini Output:', result.text);
};

runChat().catch(console.error);