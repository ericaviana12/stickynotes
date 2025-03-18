// Importação dos recursos do framework electron
// ipcRenderer permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
const {ipcRenderer} = require('electron')

// Enviar uma mensagem para o main.js e estabelecer uma conexão com o banco de dados quando iniciar a aplicação
// send (enviar)
//db-connect (rótulo para identificar a mensagem)
ipcRenderer.send('db-connect')
