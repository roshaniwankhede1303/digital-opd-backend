// src/ai/toolHandlers.ts

import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import dotenv from 'dotenv';
dotenv.config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export const toolHandlers = {
  get_next_case: async () => {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `
Generate a realistic NEET-PG style patient case in the following JSON format:
{
  "age": <number>,
  "gender": <"Male" | "Female">,
  "history": <string>,
  "symptoms": <string>,
  "additionalInfo": <string>,
  "correctTest": <string>,
  "correctDiagnosis": <string>
}
Only return valid JSON. No explanation. Strictly JSON only.
`,
    });
    console.log("text" , text);
        // Strip Markdown formatting like ```json ... ```
    const cleanText = text.replace(/```json|```/g, '').trim();

    console.log("Gemini response:\n", cleanText);

    const caseJson = JSON.parse(cleanText);
    console.log("caseJson\n", caseJson);

    return { patient: caseJson };
  },

  evaluate_test: async ({ selectedTest, correctTest }: any) => {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `
Given that the correct diagnostic test is: "${correctTest}", is the selected test "${selectedTest}" appropriate?
Respond with either:
✅ Correct test.
OR
❌ Incorrect test. Explain briefly.
`,
    });
    console.log('eval', text)
    return { result: text.trim() };
  },

  evaluate_diagnosis: async ({ selectedDiagnosis, correctDiagnosis }: any) => {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `
Given that the correct diagnosis is: "${correctDiagnosis}", is "${selectedDiagnosis}" accurate?
Respond with either:
✅ Correct diagnosis.
OR
❌ Incorrect diagnosis. Explain briefly.
`,
    });

    return { result: text.trim() };
  },
};