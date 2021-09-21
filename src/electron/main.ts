import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let win: BrowserWindow;
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.resolve(__dirname, './preload.js'),
    },
  });
  // Load app
  win.loadURL('http://localhost:8080');
}

app.on('ready', createWindow);

ipcMain.on('test', (event, args) => {
  console.log('test backend request', args);
  // send response to renderer (webpage)
  win.webContents.send('test', { ...args, hello2: 'world2' });
});
