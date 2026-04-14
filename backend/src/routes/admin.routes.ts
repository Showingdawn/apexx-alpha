import { Router } from 'express';
import { db } from '../config/firebase';

const router = Router();

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/trades - Get all trades
router.get('/trades', async (req, res) => {
  try {
    const snapshot = await db.collection('trades').get();
    const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

export default router;
