import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { loadUsers, saveUsers, loadOtps, saveOtps } from './db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function isValidEmail(email) {
	return typeof email === 'string' && /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
}

function generateOtp() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

async function storeOtp(email, otpCode) {
	const otps = loadOtps();
	const hashed = await bcrypt.hash(otpCode, 8);
	const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
	const filtered = otps.filter(o => o.email !== email);
	filtered.push({ email, hashed, expiresAt });
	saveOtps(filtered);
}

async function verifyOtp(email, otpCode) {
	const otps = loadOtps();
	const record = otps.find(o => o.email === email);
	if (!record) return { ok: false, error: 'OTP not found' };
	if (Date.now() > record.expiresAt) return { ok: false, error: 'OTP expired' };
	const match = await bcrypt.compare(otpCode, record.hashed);
	if (!match) return { ok: false, error: 'Invalid OTP' };
	// remove used OTP
	saveOtps(otps.filter(o => o.email !== email));
	return { ok: true };
}

function upsertUserForEmail(email, name) {
	const users = loadUsers();
	let user = users.find(u => u.email === email);
	if (!user) {
		user = { id: uuidv4(), email, name: name || email.split('@')[0], provider: 'email', createdAt: new Date().toISOString() };
		users.push(user);
		saveUsers(users);
	} else if (name && !user.name) {
		user.name = name;
		saveUsers(users);
	}
	return user;
}

function upsertUserForGoogle(profile) {
	const users = loadUsers();
	let user = users.find(u => u.email === profile.email);
	if (!user) {
		user = { id: uuidv4(), email: profile.email, name: profile.name, provider: 'google', googleSub: profile.sub, createdAt: new Date().toISOString() };
		users.push(user);
		saveUsers(users);
	} else {
		user.name = profile.name || user.name;
		user.provider = user.provider || 'google';
		saveUsers(users);
	}
	return user;
}

function createToken(user) {
	const payload = { sub: user.id };
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req, res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Missing token' });
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.userId = decoded.sub;
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

router.post('/request-otp', async (req, res) => {
	try {
		const { email } = req.body || {};
		if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email required' });
		const otp = generateOtp();
		await storeOtp(email, otp);
		// In real app, send OTP via email provider. For demo, return it when NODE_ENV=development
		const shouldReveal = (process.env.NODE_ENV || 'development') === 'development';
		return res.json({ message: 'OTP sent', otp: shouldReveal ? otp : undefined });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to generate OTP' });
	}
});

router.post('/verify-otp', async (req, res) => {
	try {
		const { email, otp, name } = req.body || {};
		if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email required' });
		if (!otp || typeof otp !== 'string') return res.status(400).json({ error: 'OTP required' });
		const result = await verifyOtp(email, otp);
		if (!result.ok) return res.status(400).json({ error: result.error });
		const user = upsertUserForEmail(email, name);
		const token = createToken(user);
		return res.json({ token, user });
	} catch (err) {
		return res.status(500).json({ error: 'OTP verification failed' });
	}
});

router.post('/google', async (req, res) => {
	try {
		const { idToken } = req.body || {};
		if (!idToken) return res.status(400).json({ error: 'idToken required' });
		if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: 'GOOGLE_CLIENT_ID not configured' });
		const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
		const payload = ticket.getPayload();
		const profile = { email: payload.email, name: payload.name, sub: payload.sub };
		const user = upsertUserForGoogle(profile);
		const token = createToken(user);
		return res.json({ token, user });
	} catch (err) {
		return res.status(400).json({ error: 'Google authentication failed' });
	}
});

export default router;



