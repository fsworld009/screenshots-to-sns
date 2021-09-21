import { app, BrowserWindow } from 'electron';

let win;
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  // Load app
  win.loadURL('http://localhost:8080');
}

app.on('ready', createWindow);
