import sharp from 'sharp';
import { Plugin } from 'vite';
import { promises as fs } from 'fs';
import path from 'path';

export function imageOptimizer(): Plugin {
  return {
    name: 'vite-plugin-image-optimizer',
    async transform(code, id) {
      if (!id.match(/\.(png|jpg|jpeg|webp)$/)) return null;

      const image = await fs.readFile(id);
      const fileName = path.basename(id, path.extname(id));
      const publicDir = path.resolve('public');
      const optimizedDir = path.join(publicDir, 'optimized');

      // Ensure optimized directory exists
      await fs.mkdir(optimizedDir, { recursive: true });

      // Generate WebP version
      await sharp(image)
        .resize(800) // Max width
        .webp({ quality: 80 })
        .toFile(path.join(optimizedDir, `${fileName}.webp`));

      // Generate fallback JPEG version
      await sharp(image)
        .resize(800)
        .jpeg({ quality: 80, progressive: true })
        .toFile(path.join(optimizedDir, `${fileName}.jpg`));

      return code;
    },
  };
}
