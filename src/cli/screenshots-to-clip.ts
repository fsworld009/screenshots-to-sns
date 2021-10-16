/**
 * CLI to create a short clip from a list of image files.
 * Support mp4, gif, apng output
 * Arguments:
 *
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import process from 'process';
import { execSync } from 'child_process';
import commandLineArgs, { CommandLineOptions } from 'command-line-args';
import testFiles from './test.json';
import printHelp from './help';

const outputFolder = path.resolve(os.homedir(), 'shortmovies');
const cacheFolder = path.resolve(__dirname, '../../cache/');

interface CliOptions {
  help: boolean;
  ffmpegpath: string;
  inputs: string[];
  output: string;
  length: number;
  ext: string;
}

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
// (async () => {
//   console.log('testing');
//   const outputPath = await makeVideo(testFiles);
//   console.log(outputPath);
// })();

// console.log(process.argv);

const optionDefinitions = [
  { name: 'ffmpegpath', alias: 'f', type: String },
  // TODO: support getting file names from a text file
  {
    name: 'input', alias: 'i', type: String, require: true, multiple: true,
  },
  {
    name: 'output', alias: 'o', types: String, require: true,
  },
  { name: 'length', alias: 'l', type: Number },
  { name: 'ext', alias: 'e', type: String },
  { name: 'help', alias: 'h', type: Boolean },
];


if (require.main === module) {
  const options = commandLineArgs(optionDefinitions) as CliOptions;
  if (options.help) {
    printHelp();
    process.exit(0);
  }
}
