import bcrypt from 'bcryptjs';
import readline from 'readline';
import dotenv from 'dotenv';
import { query, queryOne, initDb } from '../config/db.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (queryText) => {
  return new Promise((resolve) => rl.question(queryText, resolve));
};

const createAdmin = async () => {
  try {
    console.log('--- DMD JEWELLERY ADMIN INITIALIZATION ---');
    await initDb();

    let name = process.env.INITIAL_ADMIN_NAME || '';
    let email = process.env.ADMIN_EMAIL || '';
    let password = process.env.INITIAL_ADMIN_PASSWORD || '';

    if (!email || !password) {
      name = await askQuestion('Enter Admin Full Name [Default: Admin]: ') || 'Admin';
      email = await askQuestion('Enter Admin Email [e.g. admin@dmdjewellery.com]: ') || 'admin@dmdjewellery.com';
      password = await askQuestion('Enter Secure Admin Password (min 6 chars): ');
    }

    if (!email || !password || password.length < 6) {
      console.error('Error: Email and password (at least 6 characters) are required.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      await query('UPDATE users SET name = ?, password_hash = ?, role = "admin" WHERE id = ?', [
        name,
        passwordHash,
        existing.id,
      ]);
      console.log(`Successfully updated existing admin user (${email})!`);
    } else {
      await query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "admin")', [
        name,
        email,
        passwordHash,
      ]);
      console.log(`Successfully created new admin user (${email})!`);
    }

    console.log('\nAdmin credentials configured securely.');
    console.log(`Email: ${email}`);
    console.log('Role: admin\n');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  }
};

createAdmin();
