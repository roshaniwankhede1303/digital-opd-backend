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
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  const game = new GameEngine();

  socket.on('join', async ({ userName }) => {
    const { patient } = await game.startNewGame();
    socket.emit('message',{patient}, `👩‍⚕️ Welcome ${userName}! Here's your patient case`, );
    socket.emit('case_started', { patient });
  });

  socket.on('submit_test', async (msg: string) => {
    const result = await game.submitTest(msg);
    const stage = game.getCurrentStage();
    const score = game.getScore()

    socket.emit('message', result);

    if (stage === 'diagnosis') {
      socket.emit('message', `You Scored ${score}/5 🩺 Now enter your diagnosis.`);
      game.resetScore()
    }
 
  });

  socket.on('submit_diagnosis', async (msg: string) => {
    const result = await game.submitDiagnosis(msg);
    const score = game.getScore();
    const stage = game.getCurrentStage();

    socket.emit('message', result);

    if (stage === 'done') {
      socket.emit('message', {
        message: `🎉 Case complete! diagnosis Score: ${score}/5`,
        score,
      });
    }
  });

  socket.on('next-patient', async () => {
    const { patient } = await game.startNewGame();
    socket.emit('case_started', { patient });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Game server running on http://localhost:${PORT}`);
});