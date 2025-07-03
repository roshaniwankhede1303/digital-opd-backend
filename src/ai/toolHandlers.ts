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
    // Generate random elements for more variation
    const ages = [25, 35, 45, 55, 65, 72];
    const genders: ('Male' | 'Female')[] = ['Male', 'Female']; // Fix: Proper typing
    const conditions = [
      { test: 'X-ray chest', diagnosis: 'Pneumonia' },
      { test: 'ECG', diagnosis: 'Myocardial infarction' },
      { test: 'Blood glucose', diagnosis: 'Diabetes mellitus' },
      { test: 'CT scan head', diagnosis: 'Stroke' },
      { test: 'Ultrasound abdomen', diagnosis: 'Gallstones' },
      { test: 'Blood pressure', diagnosis: 'Hypertension' },
      { test: 'CBC', diagnosis: 'Anemia' },
      { test: 'Urinalysis', diagnosis: 'UTI' }
    ];

    const randomAge = ages[Math.floor(Math.random() * ages.length)];
    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const caseId = Math.random().toString(36).substring(7);

    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `
Generate a medical case with these EXACT specifications:

Requirements:
- Age: ${randomAge}
- Gender: ${randomGender}
- Correct test: "${randomCondition.test}"
- Correct diagnosis: "${randomCondition.diagnosis}"

Create a patient case where the symptoms clearly point to ${randomCondition.diagnosis} and the appropriate test is ${randomCondition.test}.

IMPORTANT: Use EXACTLY these values:
- correctTest: "${randomCondition.test}" (nothing else)
- correctDiagnosis: "${randomCondition.diagnosis}" (nothing else)

JSON format:
{
  "age": ${randomAge},
  "gender": "${randomGender}",
  "name": "<simple name>",
  "history": "<brief relevant history>",
  "symptoms": "<simple symptoms description>",
  "additionalInfo": "<brief additional info>",
  "correctTest": "${randomCondition.test}",
  "correctDiagnosis": "${randomCondition.diagnosis}",
  "senior_doctor_summary": "<brief guidance without giving answers>"
}

Only return valid JSON. No markdown formatting.`
    });

    console.log('Generated case for:', randomCondition.diagnosis);
    const cleanText = text.replace(/```json|```/g, '').trim();

    try {
      const caseJson = JSON.parse(cleanText);
      // Force the correct values to ensure consistency
      caseJson.correctTest = randomCondition.test;
      caseJson.correctDiagnosis = randomCondition.diagnosis;
      caseJson.gender = randomGender; // Ensure proper typing

      const patient = new Patient(caseJson);
      console.log('✅ Patient created:', patient.getDisplayName());
      console.log('Test:', caseJson.correctTest);
      console.log('Diagnosis:', caseJson.correctDiagnosis);

      return patient;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      // Fix: Properly typed fallback case
      const fallbackCase = {
        age: randomAge,
        gender: randomGender, // This is now properly typed as "Male" | "Female"
        name: randomGender === 'Male' ? 'John Doe' : 'Jane Doe',
        history: 'Previous medical history unremarkable',
        symptoms: 'Patient presents with typical symptoms',
        additionalInfo: 'No additional information',
        correctTest: randomCondition.test,
        correctDiagnosis: randomCondition.diagnosis,
        senior_doctor_summary:
          'Please evaluate the patient and suggest appropriate diagnostic test.'
      };
      return new Patient(fallbackCase);
    }
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
