import { toolHandlers } from '../ai/toolHandlers';
import { Patient } from './patients';

type GameState = {
  stage: 'intro' | 'test' | 'diagnosis' | 'done';
  patient: any | null;
  test_score: number;
  diagnosis_score: number;
  attempts: number;
};

export class GameEngine {
  private state: GameState;

  constructor() {
    this.state = {
      stage: 'intro',
      patient: null,
      test_score: 5,
      diagnosis_score: 5,
      attempts: 0
    };
  }

  async startNewGame() {
    const patient: Patient = await toolHandlers.get_next_case();
    this.state = {
      stage: 'test',
      patient: patient.toJSON(),
      test_score: 5,
      diagnosis_score: 5,
      attempts: 0
    };
    console.log('patient', patient);

    return { stage: this.state.stage, patient };
  }

  async submitTest(selectedTest: string) {
    const response = await toolHandlers.evaluate_test({
      selectedTest,
      correctTest: this.state.patient.correctTest
    });

    const isCorrect = response.result.includes('✅');

    if (isCorrect) {
      // Keep the current score as final score
      this.state.stage = 'diagnosis';
      this.state.attempts = 0;
      console.log('test score check (correct):', this.state.test_score);
    } else {
      // Reduce score by 2 for each incorrect attempt
      this.state.attempts += 1;
      this.state.test_score = Math.max(0, 5 - this.state.attempts * 2);
      console.log(
        'test score check (incorrect, attempt #' + this.state.attempts + '):',
        this.state.test_score
      );
    }

    return response.result;
  }

  async submitDiagnosis(selectedDiagnosis: string) {
    const response = await toolHandlers.evaluate_diagnosis({
      selectedDiagnosis,
      correctDiagnosis: this.state.patient.correctDiagnosis
    });

    const isCorrect = response.result.includes('✅');

    if (isCorrect) {
      // Keep the current score as final score
      this.state.stage = 'done';
      this.state.attempts = 0;
      console.log('diagnosis score check (correct):', this.state.diagnosis_score);
    } else {
      // Reduce score by 2 for each incorrect attempt
      this.state.attempts += 1;
      this.state.diagnosis_score = Math.max(0, 5 - this.state.attempts * 2);
      console.log(
        'diagnosis score check (incorrect, attempt #' + this.state.attempts + '):',
        this.state.diagnosis_score
      );
    }

    return response.result;
  }

  getCurrentStage() {
    return this.state.stage;
  }

  getTestScore() {
    return this.state.test_score;
  }

  getDiagnosisScore() {
    return this.state.diagnosis_score;
  }

  resetScore() {
    this.state.diagnosis_score = 0;
  }

  getCurrentPatient() {
    return this.state.patient;
  }
}
