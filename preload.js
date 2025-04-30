const { ipcRenderer, contextBridge } = require('electron')
const Renderer = require('electron/renderer')

ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api', {
    dbConnect: () => ipcRenderer.send('db-connect'),
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    aboutExit: () => ipcRenderer.send('about-exit'),
    createNote: (stickyNote) => ipcRenderer.send('create-note', stickyNote),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    listNotes: () => ipcRenderer.send('list-notes'),
    renderNotes: (notes) => ipcRenderer.on('render-notes', notes),
    updateList: () => ipcRenderer.send('update-list'),
    mainReload: (args) => ipcRenderer.on('main-reload', args),
    deleteNote: (id) => ipcRenderer.send('delete-note', id)
})
