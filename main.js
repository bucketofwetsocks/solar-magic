const { app, BrowserWindow } = require('electron');
const electron = require('electron');
const path = require('path');

function createWindow () {
    const WEB_FOLDER = 'solar-magic/dist/solar-magic';
    const PROTOCOL = 'file';
  
    // this is to edit the relative pathing, to allow the index.html
    // file to be in angular's dist directory instead.
    electron.protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
        // Strip protocol
        let url = request.url.substr(PROTOCOL.length + 1);

        // Build complete path for node require function
        const filename = path.basename(url);
        url = path.join(__dirname, WEB_FOLDER, filename);

        // Replace backslashes by forward slashes (windows)
        url = path.normalize(url);
        callback({path: url});
    });
  
    const win = new BrowserWindow({
      width: 1200,
      height: 600,
      icon: './resources/icon.png',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
  
    win.loadFile('./index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow()
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});


/** IPC Functions */
// ipcMain.on("require-Fs", (event, path) => {
//     win.webContents.send("require-Fs-response", require('fs'));
// });
  