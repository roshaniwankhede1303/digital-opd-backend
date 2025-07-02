export interface PatientData {
  id: string;
  age: number;
  name: string;
  gender: 'Male' | 'Female';
  history: string;
  symptoms: string;
  additionalInfo: string;
  correctTest: string;
  correctDiagnosis: string;
  createdAt: Date;
  senior_doctor_summary: string;
}

export class Patient {
  public readonly id: string;
  public readonly age: number;
  public readonly name: string;
  public readonly gender: 'Male' | 'Female';
  public readonly history: string;
  public readonly symptoms: string;
  public readonly additionalInfo: string;
  public readonly correctTest: string;
  public readonly correctDiagnosis: string;
  public readonly createdAt: Date;
  public readonly senior_doctor_summary: string;

  constructor(data: Omit<PatientData, 'id' | 'createdAt'> & { id?: string; createdAt?: Date }) {
    this.id = data.id || this.generateId();
    this.age = data.age;
    this.name = data.name;
    this.gender = data.gender;
    this.history = data.history;
    this.symptoms = data.symptoms;
    this.additionalInfo = data.additionalInfo;
    this.correctTest = data.correctTest.toLowerCase().trim();
    this.correctDiagnosis = data.correctDiagnosis.toLowerCase().trim();
    this.createdAt = data.createdAt || new Date();
    this.senior_doctor_summary = data.senior_doctor_summary;
  }

  public getName(): string {
    return this.name;
  }

  private generateId(): string {
    return `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getDisplayName(): string {
    const genderPrefix = this.gender === 'Male' ? 'MR.' : 'MRS.';
    return `${genderPrefix} ${this.name} (${this.age} Y/O)`;
  }

  public toJSON(): PatientData {
    return {
      id: this.id,
      age: this.age,
      name: this.name,
      gender: this.gender,
      history: this.history,
      symptoms: this.symptoms,
      additionalInfo: this.additionalInfo,
      correctTest: this.correctTest,
      correctDiagnosis: this.correctDiagnosis,
      createdAt: this.createdAt,
      senior_doctor_summary: this.senior_doctor_summary
    };
  }

  public static fromJSON(data: PatientData): Patient {
    return new Patient({
      id: data.id,
      age: data.age,
      name: data.name,
      gender: data.gender,
      history: data.history,
      symptoms: data.symptoms,
      additionalInfo: data.additionalInfo,
      correctTest: data.correctTest,
      correctDiagnosis: data.correctDiagnosis,
      createdAt: data.createdAt,
      senior_doctor_summary: data.senior_doctor_summary
    });
  }
}
