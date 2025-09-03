import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { loadNotes, saveNotes } from './db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
	const all = loadNotes();
	const mine = all.filter(n => n.userId === req.userId);
	return res.json({ notes: mine });
});

router.post('/', authMiddleware, (req, res) => {
	const { title, content } = req.body || {};
	if (!title || typeof title !== 'string') return res.status(400).json({ error: 'Title required' });
	if (!content || typeof content !== 'string') return res.status(400).json({ error: 'Content required' });
	const all = loadNotes();
	const note = { id: uuidv4(), userId: req.userId, title, content, createdAt: new Date().toISOString() };
	all.push(note);
	saveNotes(all);
	return res.status(201).json({ note });
});

router.delete('/:id', authMiddleware, (req, res) => {
	const { id } = req.params;
	const all = loadNotes();
	const note = all.find(n => n.id === id);
	if (!note) return res.status(404).json({ error: 'Note not found' });
	if (note.userId !== req.userId) return res.status(403).json({ error: 'Not allowed' });
	const remaining = all.filter(n => n.id !== id);
	saveNotes(remaining);
	return res.json({ success: true });
});

export default router;



