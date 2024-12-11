import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

const VIDEOS = ['reading_book_landing_page', 'reading_book_landing_page_1'];

const INPUT_DIR = 'public/videos';
const OUTPUT_DIR = 'public/videos/optimized';

interface VideoConfig {
  width: number;
  bitrate: string;
  crf: number;
}

const CONFIGS = {
  mobile: {
    width: 480,
    bitrate: '150k',
    crf: 35,
  },
  desktop: {
    width: 720,
    bitrate: '300k',
    crf: 32,
  },
} as const;

async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating output directory:', error);
  }
}

async function optimizeVideo(
  inputPath: string,
  outputPath: string,
  config: VideoConfig
) {
  const { width, bitrate, crf } = config;

  // Single pass with strict compression settings
  const command = `ffmpeg -i "${inputPath}" \
    -c:v libx264 \
    -preset slower \
    -crf ${crf} \
    -maxrate ${bitrate} -bufsize ${bitrate} \
    -vf "scale=${width}:-2:flags=lanczos,fps=15" \
    -profile:v baseline \
    -level 3.0 \
    -movflags +faststart \
    -c:a aac -b:a 32k -ac 1 \
    "${outputPath}.mp4"`;

  try {
    console.log(`Optimizing ${path.basename(inputPath)}...`);
    await execAsync(command);
    console.log(`Created optimized MP4: ${path.basename(outputPath)}.mp4`);
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
    throw error;
  }
}

async function main() {
  await ensureOutputDir();

  for (const video of VIDEOS) {
    const inputPath = path.join(INPUT_DIR, `${video}.webm`);

    // Create mobile version
    await optimizeVideo(
      inputPath,
      path.join(OUTPUT_DIR, `${video}_mobile`),
      CONFIGS.mobile
    );

    // Create desktop version
    await optimizeVideo(
      inputPath,
      path.join(OUTPUT_DIR, `${video}_desktop`),
      CONFIGS.desktop
    );
  }
}

main().catch(console.error);
