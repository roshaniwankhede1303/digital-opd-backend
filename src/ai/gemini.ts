// // src/ai/gemini.ts
// import { createGoogleGenerativeAI } from '@ai-sdk/google';
// import { streamText } from 'ai';

// import dotenv from 'dotenv';
// import { tools } from './tools';
// dotenv.config();

// const google = createGoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
// });

// // Stream Gemini response with tools enabled
// export async function generateResponse(messages: any[]) {
//   return await streamText({
//     model: google('gemini-1.5-pro'),
//     messages,
//     tools,
//   });
// }