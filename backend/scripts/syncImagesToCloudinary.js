import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!dbUrl) {
  console.error('ERROR: DATABASE_URL missing.');
  process.exit(1);
}

const isCloudinaryConfigured = () => {
  return (
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
  );
};

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function syncImages() {
  console.log('Checking Cloudinary configuration status...');
  if (!isCloudinaryConfigured()) {
    console.log('Notice: Cloudinary credentials not configured in environment variables.');
    console.log('Images are currently served via local static path /uploads/. Add Cloudinary keys to sync to cloud.');
    pool.end();
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const res = await pool.query("SELECT * FROM product_images WHERE image_url LIKE '/uploads/%'");
  console.log(`Found ${res.rows.length} local images to migrate to Cloudinary.`);

  for (const img of res.rows) {
    const localPath = path.resolve(__dirname, '../../', img.image_url.substring(1));
    if (fs.existsSync(localPath)) {
      try {
        console.log(`Uploading ${localPath} to Cloudinary...`);
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'dmd_jewellery/products',
          resource_type: 'image',
        });
        await pool.query('UPDATE product_images SET image_url = $1 WHERE id = $2', [result.secure_url, img.id]);
        console.log(`Updated Image ID ${img.id} URL to: ${result.secure_url}`);
      } catch (err) {
        console.error(`Failed to upload ${img.image_url}:`, err.message);
      }
    } else {
      console.warn(`Local file not found at ${localPath}`);
    }
  }

  pool.end();
}

syncImages();
