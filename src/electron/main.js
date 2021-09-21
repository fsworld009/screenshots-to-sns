/* eslint-disable */
const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const path = require("path");
const fs = require("fs");

const hotreload = require('electron-hot-reload');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

async function createWindow() {

  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      // preload: path.join(__dirname, "preload.js") // use a preload script
    }
  });

  // Load app
  //win.loadFile(path.join(__dirname, "dist/index.html"));
  win.loadURL('http://localhost:8080')

  // rest of code..
}

app.on("ready", createWindow);

if (process.env.NODE_ENV === 'development') {
  const mainFile = path.join(app.getAppPath(), 'main.js');
  console.log('mainFile', mainFile);

  hotreload.mainReloader(mainFile, undefined, (error, path) => {
    console.log("It is a main's process hook!");
  });
}