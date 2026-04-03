const { app, BrowserWindow } = require('electron');

// THIS IS THE MAGIC LINE FOR OBS
app.disableHardwareAcceleration(); 

function createWindow () {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        transparent: false, // Keep this false for our green screen!
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});