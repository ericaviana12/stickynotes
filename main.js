console.log("Electron - Processo principal")

// Importação dos recursos do framework
// app -> aplicação
// BrowserWindow -> criação da janela
// nativeTheme está relacionado ao tema claro ou escuro (definir)
const { app, BrowserWindow, nativeTheme} = require('electron/main')

// Janela principal
let win
const createWindow = () => {
  // definindo tema da janela claro ou escuro
  nativeTheme.themeSource = 'dark'
  win = new BrowserWindow({
    width: 1010, // Largura
    height: 720, // Altura
    // frame: false, // Tela para totem de autoatendimento
    // resizable: false, // Maximizar
    // minimizable: false, // Minimizar
    // closable: false, // Fechar
    // autoHideMenuBar: true // Esconder o menu do browser
  })

  // Carregar o documento HTML na janela
  win.loadFile('./src/views/index.html')
}

// Inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
  createWindow()

  // Só ativar a janela principal se nenhuma outra estiver ativa
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Se o sistema não for MAC, encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
