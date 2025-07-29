// api/influencer.js
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
  const { method, query } = req;

  try {
    if (method === 'GET' && !query.id) {
      const result = await pool.query('SELECT id, username FROM scrapped.instagram_profile_analysis');
      return res.status(200).json(result.rows);
    }

    if (method === 'GET' && query.id) {
      const result = await pool.query(
        'SELECT * FROM scrapped.instagram_profile_analysis WHERE id = $1',
        [query.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Influencer not found' });
      }

      const influencer = result.rows[0];

      if (influencer.ai_analysis && influencer.ai_analysis.startsWith('```json')) {
        try {
          const jsonString = influencer.ai_analysis
            .replace(/```json\s*/, '')
            .replace(/\s*```$/, '');
          influencer.ai_analysis = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
        }
      }

      return res.status(200).json(influencer);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
