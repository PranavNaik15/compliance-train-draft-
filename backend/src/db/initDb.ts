import { Pool } from 'pg';
import { webinars } from '../data/webinars';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'webinar_platform',
  user: process.env.PGUSER || process.env.USER,
  password: process.env.PGPASSWORD || undefined,
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('📦 Initializing PostgreSQL tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS webinars (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        short_description TEXT NOT NULL,
        full_description TEXT NOT NULL,
        speaker JSONB NOT NULL,
        date VARCHAR(100) NOT NULL,
        time VARCHAR(100) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        level VARCHAR(100) NOT NULL,
        agenda JSONB NOT NULL DEFAULT '[]'::jsonb,
        prerequisites TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(100) PRIMARY KEY,
        webinar_id VARCHAR(50) NOT NULL REFERENCES webinars(id) ON DELETE CASCADE,
        webinar_title VARCHAR(255) NOT NULL,
        webinar_date VARCHAR(100) NOT NULL,
        webinar_time VARCHAR(100) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        company_name VARCHAR(150) NOT NULL,
        work_email VARCHAR(255) NOT NULL,
        job_role VARCHAR(150) NOT NULL,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_webinar_registration 
      ON registrations (webinar_id, LOWER(work_email));
    `);

    await client.query('DELETE FROM webinars WHERE id NOT LIKE $1', ['webinar-hipaa-%']);

    console.log('🌱 Seeding HIPAA & SAMHSA webinars...');
    for (const w of webinars) {
      await client.query(
        `INSERT INTO webinars (
          id, title, short_description, full_description,
          speaker, date, time, duration, category, level, agenda, prerequisites
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          short_description = EXCLUDED.short_description,
          full_description = EXCLUDED.full_description,
          speaker = EXCLUDED.speaker,
          date = EXCLUDED.date,
          time = EXCLUDED.time,
          duration = EXCLUDED.duration,
          category = EXCLUDED.category,
          level = EXCLUDED.level,
          agenda = EXCLUDED.agenda,
          prerequisites = EXCLUDED.prerequisites;`,
        [
          w.id,
          w.title,
          w.shortDescription,
          w.fullDescription,
          JSON.stringify(w.speaker),
          w.date,
          w.time,
          w.duration,
          w.category,
          w.level,
          JSON.stringify(w.agenda || []),
          w.prerequisites || null,
        ],
      );
    }

    const { rows } = await client.query('SELECT COUNT(*) FROM webinars');
    console.log(`🎉 Database ready! Total webinars: ${rows[0].count}`);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
