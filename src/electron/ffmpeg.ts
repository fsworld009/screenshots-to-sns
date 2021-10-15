// util to produce video

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import testFiles from './test.json';

const outputFolder = path.resolve(os.homedir(), 'shortmovies');
const cacheFolder = path.resolve(__dirname, '../../cache/');

/* eslint-disable no-restricted-syntax, no-await-in-loop, guard-for-in */
export default async function makeVideo(files: string[]): Promise<string> {
  // delete old cache
  const cacheFiles = await fs.readdir(cacheFolder);
  for (const file of cacheFiles) {
    await fs.unlink(path.resolve(cacheFolder, file));
  }
  // copy to cache folder
  let ext;
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    // TODO: maybe fix ext;
    ext = path.extname(file);
    const cacheFilePath = `${String(index + 1).padStart(3, '0')}${ext}`;
    await fs.copyFile(file, path.resolve(cacheFolder, cacheFilePath));
  }
  // exec ffmpeg
  const outputPath = path.resolve(cacheFolder, 'test.mp4');
  const videoLength = 30; // seconds
  const fps = files.length / videoLength;
  const inputPath = path.resolve(cacheFolder, `%03d${ext}`);
  const command = `ffmpeg -framerate ${fps} -start_number 1 -i ${inputPath} -c:v libx264 -pix_fmt yuv420p ${outputPath}`;
  console.log('command', command);
  execSync(command);
  return outputPath;
}

// testing
(async () => {
  console.log('testing');
  const outputPath = await makeVideo(testFiles);
  console.log(outputPath);
})();
