const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (app.isPackaged) {
    // Load from built files in production
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  } else {
    // Load from Vite dev server in development
    win.loadURL('http://localhost:5175')
  }
  win.webContents.openDevTools();
}

app.on('ready', () => {
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})