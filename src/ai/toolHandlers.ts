// src/ai/toolHandlers.ts

import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import dotenv from 'dotenv';
import { Patient } from '@src/game/patients';
dotenv.config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!
});

export const toolHandlers = {
  get_next_case: async (): Promise<Patient> => {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `
Generate a realistic NEET-PG style patient case given by a actual patient (keep language simple like a human describing a health issue)
senior_doctor_summary will summarise the case for junior doctor so that junior doctor find the correct test and diagnosis by themself so dont give any hints, for in the following JSON format:
{
  "age": <number>,
  "gender": <"Male" | "Female">,
  "name": <string>,
  "history": <string>,
  "symptoms": <string>,
  "additionalInfo": <string>,
  "correctTest": <string>,
  "correctDiagnosis": <string>,
  "senior_doctor_summary": <string>
}
Only return valid JSON. No explanation. Strictly JSON only.
`
    });
    console.log('text', text);
    // Strip Markdown formatting like ```json ... ```
    const cleanText = text.replace(/```json|```/g, '').trim();

    console.log('Gemini response:\n', cleanText);

    const caseJson = JSON.parse(cleanText);
    console.log('caseJson\n', caseJson);
    // Create Patient instance
    const patient = new Patient(caseJson);
    console.log('✅ Patient created:', patient.getDisplayName());

    return patient;

    // return { patient: caseJson };
  },

  evaluate_test: async ({ selectedTest, correctTest }: any) => {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `
Given that the correct diagnostic test is: "${correctTest}", is the selected test "${selectedTest}" appropriate?
Respond with:
✅ Correct test, (Explain briefly What are the findings of the ${selectedTest} test?)
OR
❌ Incorrect test. Explain briefly on why this ${selectedTest} is not appropriate and a try again message but don't give any hint about ${correctTest}.
`
    });
    if (text.includes('Correct test')) {
      return { result: text.trim(), pass: true };
    } else {
      return { result: text.trim(), pass: false };
    }
  },

  evaluate_diagnosis: async ({ selectedDiagnosis, correctDiagnosis }: any) => {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `
Given that the correct diagnosis is: "${correctDiagnosis}", is the selected Diagnosis "${selectedDiagnosis}" correct?
Respond with:
✅ Correct Diagnosis, (Explain why ${selectedDiagnosis} is the correct Diagnosis?, don't give any hint about ${correctDiagnosis})
OR
❌ Incorrect Diagnosis. Explain briefly on why the ${selectedDiagnosis} is not the correct Diagnosis and a try again message but don't give any hint about ${correctDiagnosis}.
`
    });

    return { result: text.trim() };
  }
};
