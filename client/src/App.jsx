import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-abcdefghijklmnop.apps.googleusercontent.com';

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });
  useEffect(() => {
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
  }, [token]);
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user');
  }, [user]);
  return { token, setToken, user, setUser };
}

function EmailOtpPage({ setToken, setUser }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function requestOtp() {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      if (data.otp) setSentOtp(data.otp);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp, name }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setToken(data.token); setUser(data.user);
      navigate('/notes'); // Navigate to notes page after successful login
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="auth-container border-0 shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">📝 Notes App</h2>
                <p className="text-muted">Sign up or login to get started</p>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Full Name (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>

                <div className="d-flex gap-2 align-items-center mb-3">
                  <Button
                    variant="primary"
                    onClick={requestOtp}
                    disabled={loading || !email}
                    className="btn-primary"
                  >
                    {loading ? <Spinner size="sm" /> : '📧 Request OTP'}
                  </Button>
                  {sentOtp && (
                    <small className="text-success fw-bold">
                      Dev OTP: {sentOtp}
                    </small>
                  )}
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">OTP Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="form-control text-center"
                    style={{ fontSize: '1.2em' }}
                    maxLength={6}
                  />
                </Form.Group>

                <Button
                  variant="success"
                  size="lg"
                  onClick={verifyOtp}
                  disabled={loading || !otp}
                  className="w-100 mb-3"
                  style={{ borderRadius: '25px', padding: '12px' }}
                >
                  {loading ? <Spinner size="sm" /> : '✅ Verify & Continue'}
                </Button>

                {error && (
                  <Alert variant="danger" className="text-center">
                    <strong>Error:</strong> {error}
                  </Alert>
                )}

                <hr className="my-4" />
                
                <div className="text-center">
                  <p className="text-muted mb-2">Or continue with</p>
                  <Link to="/google" className="btn btn-google w-100">
                    <i className="fab fa-google me-2"></i>
                    Google Account
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

function GooglePage({ setToken, setUser }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  async function handleGoogleCredential(credential) {
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/google`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: credential }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setToken(data.token); setUser(data.user);
      navigate('/notes'); // Navigate to notes page after successful login
    } catch (e) { setError(e.message); }
  }
  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="auth-container border-0 shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">🔐 Google Login</h2>
                <p className="text-muted">Continue with your Google account</p>
              </div>

              {GOOGLE_CLIENT_ID ? (
                <div className="text-center">
                  <GoogleButton onToken={handleGoogleCredential} />
                </div>
              ) : (
                <Alert variant="warning" className="text-center">
                  <strong>Google Login Disabled</strong><br />
                  Set VITE_GOOGLE_CLIENT_ID to enable Google login.
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="text-center mt-3">
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              <hr className="my-4" />
              
              <div className="text-center">
                <Link to="/" className="btn btn-outline-secondary">
                  ← Back to Email Login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

function GoogleButton({ onToken }) {
  // Google Identity Services script
  useEffect(() => {
    const id = 'google-js';
    if (document.getElementById(id)) return;
    const s = document.createElement('script');
    s.id = id;
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (resp) => onToken(resp.credential) });
    window.google.accounts.id.renderButton(document.getElementById('gbtn'), { theme: 'outline', size: 'large' });
  }, [onToken]);

  return <div id="gbtn" className="d-flex justify-content-center"></div>;
}

function NotesPage({ token, user, setToken, setUser }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    console.log('Loading notes with token:', token);
    fetch(`${API_URL}/notes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        console.log('Notes response:', r.status);
        return { ok: r.ok, data: await r.json()};
      })
      .then(({ ok, data }) => { 
        console.log('Notes data:', data);
        if (ok) setNotes(data.notes || []); 
        else setError(data.error || 'Failed to load notes'); 
      })
      .catch((err) => {
        console.error('Notes error:', err);
        setError('Network error');
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function addNote() {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content');
      return;
    }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title, content }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setNotes([data.note, ...notes]); setTitle(''); setContent('');
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  async function delNote(id) {
    setError('');
    try {
      const res = await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setNotes(notes.filter(n => n.id !== id));
    } catch (e) { setError(e.message); }
  }

  function logout() {
    setToken(''); setUser(null);
  }

  if (!token) return <Navigate to="/" replace />;

  return (
    <Container fluid className="min-vh-100 p-4">
      <Row>
        <Col>
          {/* Welcome Header */}
          <Card className="welcome-header border-0 mb-4">
            <Card.Body className="d-flex justify-content-between align-items-center">
      <div>
                <h4 className="mb-1">👋 Welcome back, {user?.name}!</h4>
                <small className="opacity-75">{user?.email}</small>
      </div>
              <Button variant="outline-light" onClick={logout}>
                🚪 Logout
              </Button>
            </Card.Body>
          </Card>

          {/* Add Note Form */}
          <Card className="note-form border-0 mb-4">
            <Card.Body>
              <h5 className="mb-3">✍️ Create New Note</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Note title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Write your note here..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={addNote}
                  disabled={loading || !title.trim() || !content.trim()}
                  className="btn-primary"
                >
                  {loading ? <Spinner size="sm" /> : '💾 Save Note'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading your notes...</p>
            </div>
          )}

          {/* Notes Grid */}
          {!loading && (
            <Row>
              {notes.length === 0 ? (
                <Col>
                  <Card className="text-center py-5">
                    <Card.Body>
                      <h5 className="text-muted">📝 No notes yet</h5>
                      <p className="text-muted">Create your first note above!</p>
                    </Card.Body>
                  </Card>
                </Col>
              ) : (
              notes.map(note => (
                <Col key={note.id} xs={12} sm={6} lg={4} className="mb-3">
                  <Card className="note-card h-100 border-0">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">{note.title}</h6>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => delNote(note.id)}
                          className="btn-sm"
                        >
                          🗑️
                        </Button>
      </div>
                      <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {note.content}
                      </p>
                      <small className="text-muted d-block mt-2">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

function AppRoutes() {
  const { token, setToken, user, setUser } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={token && user ? <Navigate to="/notes" replace /> : <EmailOtpPage setToken={setToken} setUser={setUser} />} />
      <Route path="/google" element={token && user ? <Navigate to="/notes" replace /> : <GooglePage setToken={setToken} setUser={setUser} />} />
      <Route path="/notes" element={<NotesPage token={token} user={user} setToken={setToken} setUser={setUser} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
