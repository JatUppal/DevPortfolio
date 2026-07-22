import { useState, useEffect } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import { Trash2 } from 'lucide-react';
import {
  firebaseEnabled,
  subscribeGuestbook,
  addGuestbookEntry,
  deleteGuestbookEntry,
} from '../lib/cloudStore';

const MINE_KEY = 'jatinuppal:guestbook-mine';

function loadMine() {
  try {
    const raw = localStorage.getItem(MINE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveMine(set) {
  try {
    localStorage.setItem(MINE_KEY, JSON.stringify([...set]));
  } catch {}
}

function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: '', message: '' });
  const [mine, setMine] = useState(() => loadMine());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!firebaseEnabled) {
      setError('Guestbook backend is not configured.');
      return;
    }
    const unsub = subscribeGuestbook(setEntries, () =>
      setError('Could not load guestbook.')
    );
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const id = await addGuestbookEntry(form);
      const next = new Set(mine);
      next.add(id);
      setMine(next);
      saveMine(next);
      setForm({ name: '', message: '' });
    } catch (err) {
      console.error(err);
      setError('Could not post your note. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGuestbookEntry(id);
      const next = new Set(mine);
      next.delete(id);
      setMine(next);
      saveMine(next);
    } catch (err) {
      console.error(err);
      setError('Could not delete that note.');
    }
  };

  return (
    <>
      <h5>Guestbook</h5>
      <Form onSubmit={handleSubmit} className="aurora-form mb-3">
        <Form.Control placeholder="Your name" className="mb-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <Form.Control placeholder="Leave a note!" className="mb-2" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
        <div className="d-flex justify-content-between align-items-center">
          <Button type="submit" variant="outline-primary" size="sm" disabled={submitting || !firebaseEnabled}>
            {submitting ? 'Posting…' : 'Post'}
          </Button>
          <small className="text-muted">
            {entries.length} {entries.length === 1 ? 'comment' : 'comments'}
          </small>
        </div>
        {error && <div className="text-danger small mt-2">{error}</div>}
      </Form>
      <div className="neon-card guestbook-card">
        <ListGroup variant="flush" className="guestbook-list">
          {entries.map((entry) => (
            <ListGroup.Item key={entry.id} className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <strong>{entry.name}</strong>{entry.date && <> <small className="text-muted">· {entry.date}</small></>}
                <p className="mb-0 small">{entry.message}</p>
              </div>
              {mine.has(entry.id) && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-muted p-0 ms-2 delete-btn"
                  onClick={() => handleDelete(entry.id)}
                  aria-label="Delete your post"
                  title="Delete your post"
                >
                  <Trash2 />
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </>
  );
}

export default Guestbook;
