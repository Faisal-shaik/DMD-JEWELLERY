import pg from 'pg';
import dotenv from 'dotenv';
import { parsePgUrl } from '../config/db.js';

dotenv.config();

const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const cfg = parsePgUrl(rawUrl);

if (!cfg) {
  console.error('DATABASE_URL is missing or invalid.');
  process.exit(1);
}

console.log('==================================================');
console.log('SAFE SUPABASE CONNECTION DIAGNOSTIC');
console.log(`DB_TYPE              : ${process.env.DB_TYPE || 'postgres'}`);
console.log(`DATABASE_URL Exists  : ${!!rawUrl}`);
console.log(`Host                 : ${cfg.host}`);
console.log(`Port                 : ${cfg.port}`);
console.log(`Database             : ${cfg.database}`);
console.log(`Username             : ${cfg.user}`);
console.log(`Password Exists      : ${!!cfg.password}`);
console.log(`Password Length      : ${cfg.password ? cfg.password.length : 0}`);
console.log('==================================================');

const variants = [
  { name: 'Session Pooler Port 5432', host: cfg.host.includes('pooler') ? cfg.host : 'aws-0-ap-northeast-1.pooler.supabase.com', port: 5432, user: cfg.user },
  { name: 'Transaction Pooler Port 6543', host: cfg.host.includes('pooler') ? cfg.host : 'aws-0-ap-northeast-1.pooler.supabase.com', port: 6543, user: cfg.user },
];

async function testAll() {
  let anySuccess = false;
  for (const v of variants) {
    const client = new pg.Client({
      user: v.user,
      password: cfg.password,
      host: v.host,
      port: v.port,
      database: cfg.database || 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log(`[SUCCESS] ${v.name} Connected Successfully!`);
      const res = await client.query('SELECT NOW()');
      console.log(` -> Server Time: ${res.rows[0].now}`);
      await client.end();
      anySuccess = true;
    } catch (err) {
      console.log(`[FAILED]  ${v.name}: ${err.message}`);
    }
  }

  if (!anySuccess) {
    console.warn('\nNote: If password authentication fails, ensure the updated Supabase password is correctly set in your environment file / Render environment settings.');
  }
}

testAll();
