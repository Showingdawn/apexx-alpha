import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { db } from '../config/firebase';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // First time user, seed with $10,000
      await db.collection('users').doc(uid).set({
        balance: 10000,
        createdAt: new Date().toISOString()
      });
      return res.json({ balance: 10000 });
    }

    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.post('/reset', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    await db.collection('users').doc(uid).update({ balance: 10000 });
    res.json({ success: true, balance: 10000 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset balance' });
  }
});

export default router;
