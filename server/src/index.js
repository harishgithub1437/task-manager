import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './auth.js';
import notesRouter from './notes.js';

dotenv.config();

const app = express();
app.use(cors({ origin: '*'}));
app.use(express.json());

app.get('/', (req, res) => {
	return res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/notes', notesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on http://localhost:${PORT}`);
});


