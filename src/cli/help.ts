import commandLineUsage from 'command-line-usage';

const sections = [
  {
    header: 'Screenshots to Clip',
    content: 'create a short clip from a list of image files with ffmpeg.',
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'input -i',
        typeLabel: '{underline path}',
        description: 'Input files and folders, support multiple -i flags.'
      },
      {
        name: 'output -o',
        typeLabel: '{underline path}',
        description: 'Output file path',
      },
      {
        name: 'ffmpegpath -f',
        typeLabel: '{underline path}',
        description: 'Path to ffmpeg executable, defaults to the one in $PATH',
      },
      {
        name: 'length -l',
        typeLabel: '{underline seconds}',
        description: 'Length of the output clip, defaults to 30 seconds',
      },
      {
        name: 'ext -e',
        typeLabel: '{underline file_extension}',
        description: 'Output format, supported extensions: mp4, gif, apng. Defaults to mp4',
      },
      {
        name: 'help -h',
        typeLabel: ' ',
        description: 'Print this usage guide.',
      },
    ],
  },
];

export default function printHelp(): void {
  // console.log(usage);
  console.log(commandLineUsage(sections));
}
