import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');

const files = {
	users: path.join(dataDir, 'users.json'),
	otps: path.join(dataDir, 'otps.json'),
	notes: path.join(dataDir, 'notes.json'),
};

function ensureFile(filePath) {
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, '[]', 'utf-8');
	}
}

Object.values(files).forEach(ensureFile);

function readJson(filePath) {
	try {
		const raw = fs.readFileSync(filePath, 'utf-8');
		return raw ? JSON.parse(raw) : [];
	} catch (err) {
		return [];
	}
}

function writeJson(filePath, data) {
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function loadUsers() {
	return readJson(files.users);
}

export function saveUsers(users) {
	writeJson(files.users, users);
}

export function loadOtps() {
	return readJson(files.otps);
}

export function saveOtps(otps) {
	writeJson(files.otps, otps);
}

export function loadNotes() {
	return readJson(files.notes);
}

export function saveNotes(notes) {
	writeJson(files.notes, notes);
}



