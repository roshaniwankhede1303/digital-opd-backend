export interface PatientCase {
  patient: {
    name: string;
    age: number;
    gender: string;
    history: string;
    symptoms: string;
    additionalInfo: string;
  };
  correctTest: string;
  correctDiagnosis: string;
}

export const patientCases: PatientCase[] = [
  {
    patient: {
      name: "Mrs. Kavita",
      age: 32,
      gender: "Female",
      history: "Pregnant",
      symptoms: "Mild bleeding and pain",
      additionalInfo: "Uterus tender, fetal heart sounds absent"
    },
    correctTest: "Physical examination and ultrasound",
    correctDiagnosis: "Abruptio placenta"
  },
  {
    patient: {
      name: "Master Rohan",
      age: 5,
      gender: "Male",
      history: "Posterior superior retraction pocket",
      symptoms: "—",
      additionalInfo: "Posterior superior retraction pocket present"
    },
    correctTest: "Otoscopy and audiometry",
    correctDiagnosis: "Chronic suppurative otitis media (unsafe type)"
  },
  {
    patient: {
      name: "Mr. Aryan",
      age: 48,
      gender: "Male",
      history: "—",
      symptoms: "Painful raised red lesion on hand",
      additionalInfo: "Nests of round cells + branching vascular spaces"
    },
    correctTest: "Skin biopsy",
    correctDiagnosis: "Glomus tumor"
  }
];