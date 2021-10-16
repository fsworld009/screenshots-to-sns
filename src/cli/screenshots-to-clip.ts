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
import commandLineArgs from 'command-line-args';
import glob from 'tiny-glob';
import printHelp from './help';

const cacheFolder = path.resolve(os.homedir(), 'screenshots-to-clip-cache');

interface CliOptions {
  help: boolean;
  ffmpegpath: string;
  input: string[];
  output: string;
  length: number;
}

/* eslint-disable no-restricted-syntax, no-await-in-loop, guard-for-in */
async function deleteCache() {
  try {
    await fs.readdir(cacheFolder);
  } catch (err) {
    await fs.mkdir(cacheFolder);
  }
  // delete old cache
  const cacheFiles = await fs.readdir(cacheFolder);
  for (const file of cacheFiles) {
    await fs.unlink(path.resolve(cacheFolder, file));
  }
}

export default async function makeClip(options: CliOptions): Promise<string> {
  const files = options.input.sort();

  await deleteCache();
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
  const outputPath = path.resolve(process.cwd(), options.output);
  const clipLength = options.length || 30; // seconds
  const fps = files.length / clipLength;
  const inputPath = path.resolve(cacheFolder, `%03d${ext}`);
  const ffmpegpath = options.ffmpegpath || 'ffmpeg';

  let encodeOptions;
  let fpsOptions = '';
  switch (path.extname(outputPath)) {
    case '.gif':
      // https://superuser.com/a/556031
      // https://ffmpeg.org/ffmpeg-filters.html#setpts_002c-asetpts
      encodeOptions = `-loop 0 -f gif -vf "setpts=N/(${fps}*TB),split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"`;
      break;
    case '.apng': case '.png':
      // https://stackoverflow.com/a/48145022
      // TODO: figure out how to reduce output size
      encodeOptions = ` -plays 1 -f apng -vf "setpts=N/(${fps}*TB)" -compression_level 9 -flags -ildct`;
      break;
    default:
      encodeOptions = '-c:v libx264 -pix_fmt yuv420p';
      fpsOptions = `-framerate ${fps}`;
  }

  const command = `${ffmpegpath} -y ${fpsOptions} -start_number 1 -i ${inputPath} ${encodeOptions} ${outputPath}`;
  console.log(`Running ${command}:`);
  execSync(command);

  await deleteCache();

  return outputPath;
}

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
  let finalInput: string[] = [];
  if (options.help) {
    printHelp();
    process.exit(0);
  }
  console.log(options);
  if (options.input.length) {
    (async () => {
      for (const input of options.input) {
        console.log('input', input);
        const inputFolder = path.dirname(input);
        const inputFile = path.basename(input);
        console.log(inputFolder, inputFile);

        // Try to expand glob patterns like *.png, in case the OS doesn't resolve
        // for us. e.g. Windows doesn't do that
        const expanded = await glob(inputFile, {
          cwd: inputFolder,
          absolute: true,
        });
        console.log('expanded', expanded);
        if (expanded.length) {
          finalInput = finalInput.concat(expanded);
        } else {
          finalInput.push(input);
        }
      }
      options.input = finalInput;
      console.log('final input', options.input);
      const outputPath = await makeClip(options);
      console.log(`Clip generated: ${outputPath}`);
    })();
  }
}
