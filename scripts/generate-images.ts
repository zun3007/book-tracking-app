import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

async function generateImages() {
  const logoSvg = await fs.readFile('public/logo.svg');

  // Generate favicons
  await sharp(logoSvg).resize(16, 16).png().toFile('public/favicon-16x16.png');

  await sharp(logoSvg).resize(32, 32).png().toFile('public/favicon-32x32.png');

  // Generate Apple Touch Icon
  await sharp(logoSvg)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  // Generate Android Chrome Icons with WebP
  await sharp(logoSvg)
    .resize(192, 192)
    .webp({ quality: 90 })
    .toFile('public/android-chrome-192x192.webp');

  await sharp(logoSvg)
    .resize(192, 192)
    .png()
    .toFile('public/android-chrome-192x192.png');

  await sharp(logoSvg)
    .resize(512, 512)
    .webp({ quality: 90 })
    .toFile('public/android-chrome-512x512.webp');

  await sharp(logoSvg)
    .resize(512, 512)
    .png()
    .toFile('public/android-chrome-512x512.png');

  // Generate social media images with WebP
  const ogSvg = await fs.readFile('public/og-image.svg');
  await sharp(ogSvg)
    .resize(1200, 630)
    .webp({ quality: 90 })
    .toFile('public/og-image.webp');

  await sharp(ogSvg)
    .resize(1200, 630)
    .jpeg({ quality: 90, progressive: true })
    .toFile('public/og-image.jpg');

  const twitterSvg = await fs.readFile('public/twitter-image.svg');
  await sharp(twitterSvg)
    .resize(800, 418)
    .webp({ quality: 90 })
    .toFile('public/twitter-image.webp');

  await sharp(twitterSvg)
    .resize(800, 418)
    .jpeg({ quality: 90, progressive: true })
    .toFile('public/twitter-image.jpg');
}

generateImages().catch(console.error);
