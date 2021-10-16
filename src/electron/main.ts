import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
// import makeVideo from './ffmpeg';

const IS_DEV = process.env.NODE_ENV === 'development';
console.log('IS_DEV', IS_DEV);

let win: BrowserWindow;
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.resolve(__dirname, './preload.js'),
      devTools: IS_DEV,
    },
  });
  // Load app
  win.loadURL('http://localhost:8080');
  if (IS_DEV) {
    win.webContents.openDevTools();
  }
}

app.on('ready', createWindow);

ipcMain.on('test', (event, args) => {
  console.log('test backend request', args);
  // send response to renderer (webpage)
  win.webContents.send('test', { ...args, hello2: 'world2' });
});

ipcMain.on('selectImages', (event, args) => {
  const selectedFiles = dialog.showOpenDialogSync(win, { properties: ['openFile', 'multiSelections'] });
  win.webContents.send('onSelectImages', { files: selectedFiles });
});

ipcMain.on('makeVideo', async (event, args) => {
  console.log('makeVideo, TODO', args);
  // const outputPath = await makeVideo(args.files);
  // win.webContents.send('onVideoOutput', { outputPath });
});
