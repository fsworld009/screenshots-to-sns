"use strict";
/* eslint-disable */
const { app, BrowserWindow, ipcMain } = require("electron");
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
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });
    // Load app
    //win.loadFile(path.join(__dirname, "dist/index.html"));
    win.loadURL('http://localhost:8080');
    // rest of code..
}
app.on("ready", createWindow);
if (process.env.NODE_ENV === 'development') {
    // const mainFile = path.join(app.getAppPath(), 'main.js');
    // console.log('mainFile', mainFile);
    // hotreload.mainReloader(mainFile, undefined, (error, path) => {
    //   console.log("It is a main's process hook!");
    // });
}
//# sourceMappingURL=main.js.map