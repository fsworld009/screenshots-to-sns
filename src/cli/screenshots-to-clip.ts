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

/* export default async function makeClip(options: CliOptions): Promise<string> {
  const files = options.input.sort();
  console.log('options', options);

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
} */

async function generatePartClip(
  imagePaths: string[], nextPartFirstFramePath: string | null, fps: number, ffmpegPath: string, counter: number): Promise<string> {
  const BREAK_LINE = '\\\n';
  const filters = [];
  const concats = [];
  let concatCount = 2 * imagePaths.length - 1;
  for (let i = 0; i < imagePaths.length; i += 1) {
    concats.push(`[${i}:v]`);
    if (i !== imagePaths.length - 1) {
      filters.push(`[${i + 1}:v][${i}:v]blend=all_expr='A*(if(`
      + `gte(T,${fps}),1,T/${fps}))+B*(1-(if(`
      + `gte(T,${fps}),1,T/${fps})))'[b${i}v];`);
      concats.push(`[b${i}v]`);
    }
  }

  // Add the last crossfade between the last frame of current part
  // and the first frame of the next part
  let inputs = imagePaths.concat([]);
  if (nextPartFirstFramePath) {
    concatCount += 1;
    const id = imagePaths.length;
    inputs.push(nextPartFirstFramePath);
    filters.push(`[${id}:v][${id - 1}:v]blend=all_expr='A*(if(`
      + `gte(T,${fps}),1,T/${fps}))+B*(1-(if(`
      + `gte(T,${fps}),1,T/${fps})))'[b${id}v];`);
    concats.push(`[b${id}v]`);
  }
  inputs = inputs.map(
    (p) => `-loop 1 -t ${fps} -i "${p}" `,
  );

  const filterScriptPath = path.resolve(cacheFolder, 'filter_complex.txt');
  await fs.writeFile(
    filterScriptPath,
    `${filters.join('\n')}\n${concats.join('')}`
    + `concat=n=${concatCount}:v=1:a=0,format=yuv420p[v]`,
  );

  const outputPath = path.resolve(cacheFolder, `temp_${counter}.mp4`);
  const command = `${ffmpegPath} -y ${inputs.join('')}`
    + ` -filter_complex_script "${filterScriptPath}"`
    + ` -map "[v]" ${outputPath}`;
  // console.log('command::', command);
  console.log('Generating part clip', counter + 1, '::');
  execSync(command);
  return outputPath;
}

export default async function makeClip(options: CliOptions): Promise<string> {
  // command based on https://gist.github.com/anguyen8/d0630b6aef6c1cd79b9a1341e88a573e
  // only support mp4 now
  const numOfFiles = options.input.length;
  const imagePaths = options.input;
  const videoLength = options.length || 30; // unit: s
  const fps = videoLength / (numOfFiles * 2 - 1);
  const ffmpegPath = options.ffmpegpath || 'ffmpeg';
  const PART_SIZE = 20;

  await deleteCache();

  let start = 0;
  let partCounter = 0;
  const partFiles: string[] = [];
  while (start < numOfFiles) {
    let end = start + PART_SIZE;
    if (end >= numOfFiles) {
      end = numOfFiles;
    }
    partFiles.push(await generatePartClip(
      imagePaths.slice(start, end),
      imagePaths[end] || null,
      fps,
      ffmpegPath,
      partCounter,
    ));

    // next
    start = end;
    partCounter += 1;
  }
  const concatInputFilePath = path.resolve(cacheFolder, 'concat_input.txt');
  await fs.writeFile(
    concatInputFilePath,
    partFiles.map((p) => `file '${p}'\n`),
  );

  const outputPath = path.resolve(process.cwd(), options.output);
  const command = `${ffmpegPath} -y -f concat -safe 0`
    + ` -i "${concatInputFilePath}" -c copy ${outputPath}`;

  console.log('Generating Final Clip::');
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
  if (!options.input) {
    console.log('Missing -i or --input options');
    process.exit(0);
  }
  (async () => {
    for (const input of options.input) {
      const inputFolder = path.dirname(input);
      const inputFile = path.basename(input);

      // Try to expand glob patterns like *.png, in case the OS doesn't resolve
      // for us. e.g. Windows doesn't do that
      const expanded = await glob(inputFile, {
        cwd: inputFolder,
        absolute: true,
      });
      if (expanded.length) {
        finalInput = finalInput.concat(expanded.sort());
      } else {
        finalInput.push(input);
      }
    }
    options.input = finalInput;
    const outputPath = await makeClip(options);
    console.log(`Clip generated: ${outputPath}`);
  })();
}
