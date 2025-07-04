import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { GameEngine } from './game/engine';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Send welcome message immediately

  const game = new GameEngine();

  socket.on('join', async () => {
    console.log('join roshan');

    const { patient } = await game.startNewGame();
    socket.emit('game_ready');

    socket.emit('case_started', {
      patient_query: `Hi Dr. Roshni, Good to see you. I have been having ${patient.symptoms} and ${patient.history}`,
      patient_info: patient.getDisplayName()
    });

    socket.emit('senior_doctor_message', {
      message: patient.senior_doctor_summary,
      next_event: 'submit_test'
    });
  });

  socket.on('submit_test', async (msg: string) => {
    const result = await game.submitTest(msg);
    const test_score = game.getTestScore();
    if (result.includes('Correct test')) {
      socket.emit('senior_doctor_message', {
        message: `Great choice, Doctor! Here are the results from the report: 
        ${result}
        Now enter your diagnosis.`,
        test_score: test_score,
        next_event: 'submit_diagnosis'
      });
    } else {
      socket.emit('senior_doctor_message', {
        message: result,
        test_score: test_score,
        next_event: 'submit_test'
      });
    }
  });

  socket.on('submit_diagnosis', async (msg: string) => {
    const result = await game.submitDiagnosis(msg);
    const test_score = game.getTestScore();
    const diagnosis_score = game.getDiagnosisScore();

    if (result.includes('Correct')) {
      socket.emit('senior_doctor_message', {
        message: `🎉 Case complete! diagnosis Score: ${diagnosis_score}/5`,
        next_event: 'next-patient',
        test_score: test_score,
        diagnosis_score: diagnosis_score
      });
    } else {
      socket.emit('senior_doctor_message', {
        message: result,
        diagnosis_score: diagnosis_score,
        next_event: 'submit_diagnosis'
      });
    }
  });

  socket.on('next-patient', async () => {
    console.log('🔄 Starting next patient');

    const { patient } = await game.startNewGame();

    // Send the same structure as initial join
    socket.emit('case_started', {
      patient_query: `Hi Dr. Roshni, Good to see you.
I have been having ${patient.symptoms} and ${patient.history}`,
      patient_info: patient.getDisplayName()
    });

    socket.emit('senior_doctor_message', {
      message: patient.senior_doctor_summary,
      next_event: 'submit_test'
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Game server running on http://localhost:${PORT}`);
});
