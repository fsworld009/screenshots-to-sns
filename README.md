# Screenshots to SNS

WIP

## CLI

Converts images into video clips

## UI

Built with Vue, the main UI

## Electron

Render UI in desktop environments.


## Development

### Electron+UI
```bash
npm run dev-ui
npm run dev-electron
```

### CLI

create test_cli.sh to test cli arguments, e.g.
```bash
npx ts-node src/cli/screenshots-to-clip.ts -f ffmpeg -i ~/screenshots/*.png -o ~/Videos/clip1.mp4 -l 30
```

then run `npm run dev-cli`


## Build

?


## TODO

1. Complete UI, integrate CLI to UI
2. SNS integration
