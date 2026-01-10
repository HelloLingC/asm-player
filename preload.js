const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setFullscreenKeepAwake: (shouldKeepAwake) => {
    ipcRenderer.invoke('fullscreen-keep-awake', Boolean(shouldKeepAwake));
  },
});
