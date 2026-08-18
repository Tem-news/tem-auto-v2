import bcrypt from 'bcrypt';
import db from '../../lib/db'; 

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password, role } = req.body;

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, role || 'buyer']
    );
    res.status(200).json({ message: 'Lietotājs veiksmīgi reģistrēts!' });
  } catch (error) {
    res.status(500).json({ error: 'Reģistrācijas kļūda' });
  }
}