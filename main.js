const { app, BrowserWindow, globalShortcut, ipcMain, powerSaveBlocker } = require('electron');
const path = require('path');

let fullscreenBlockerId = null;

const setFullscreenKeepAwake = (shouldPreventSleep) => {
  if (shouldPreventSleep) {
    if (fullscreenBlockerId === null) {
      fullscreenBlockerId = powerSaveBlocker.start('display');
    }
  } else if (fullscreenBlockerId !== null) {
    powerSaveBlocker.stop(fullscreenBlockerId);
    fullscreenBlockerId = null;
  }
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (app.isPackaged) {
    // Load from built files in production
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  } else {
    // Load from Vite dev server in development
    win.loadURL('http://localhost:5173')
  }

  // Register keyboard shortcuts
  // F12 or Ctrl+Shift+I to toggle DevTools
  globalShortcut.register('F12', () => {
    win.webContents.toggleDevTools();
  });

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    win.webContents.toggleDevTools();
  });

  // Cleanup shortcuts when window is closed
  win.on('closed', () => {
    globalShortcut.unregisterAll();
  });
}

ipcMain.handle('fullscreen-keep-awake', (_event, shouldPreventSleep) => {
  setFullscreenKeepAwake(Boolean(shouldPreventSleep));
  return fullscreenBlockerId !== null;
});

app.on('ready', () => {
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('before-quit', () => {
  setFullscreenKeepAwake(false);
});
