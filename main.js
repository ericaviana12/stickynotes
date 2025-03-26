console.log("Electron - Processo principal")

// Importação dos recursos do framework
// app -> Aplicação
// BrowserWindow -> Criação da janela
// nativeTheme -> Definir o tema claro, escuro ou padrão do sistema
// Menu -> Definir um menu personalizado
// Shell -> Acessar links externos no navegador padrão
// ipcMain -> Permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain } = require('electron/main')

// Ativação do preload.js (importação do path (caminho))
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// Importação do modelo de dados (Notes.js)
const noteModel = require('./src/models/Notes.js')

// Janela principal
let win
const createWindow = () => {
  // definindo tema da janela claro ou escuro
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1010, // Largura
    height: 720, // Altura
    // frame: false, // Tela para totem de autoatendimento
    // resizable: false, // Maximizar
    // minimizable: false, // Minimizar
    // closable: false, // Fechar
    // autoHideMenuBar: true, // Esconder o menu do browser

    // Linhas abaixo para ativação do preload. Importado através da linha de Importação ds métodos conectar e desconectar (módulo de conexão)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Carregar o menu personalizado
  // Atenção! Antes importar o recurso Menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  // Carregar o documento HTML na janela
  win.loadFile('./src/views/index.html')
}

// Janela sobre
let about
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  // Obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // Validação (se existir a janela principal)
  if (mainWindow) {
    about = new BrowserWindow({
      width: 300, // Largura
      height: 300, // Altura
      // Comentar as três linhas abaixo para verificar possíveis erros pelo DevTools
      autoHideMenuBar: true, // Esconder o menu do browser
      resizable: false, // Maximizar
      minimizable: false, // Minimizar
      parent: mainWindow, // Estabelecer uma relação hierárquica entre janelas
      modal: true, // Criar uma janela modal
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }

  about.loadFile('./src/views/sobre.html')

  // Recebimento da mensagem do renderizador da tela "sobre" para fechar a janela usando o botão Ok
  ipcMain.on('about-exit', () => {
    // Validação (se existir a janela e ela não estiver destruída, fechar)
    if (about && !about.isDestroyed()) {
      about.close()
    }
  })
}

// Janela nota
let note
function noteWindow() {
  nativeTheme.themeSource = 'light'
  // Obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // Validação (se existir a janela principal)
  if (mainWindow) {
    note = new BrowserWindow({
      width: 400, // Largura
      height: 270, // Altura
      // Comentar as três linhas abaixo para verificar possíveis erros pelo DevTools
      autoHideMenuBar: true, // Esconder o menu do browser
      // resizable: false, // Maximizar
      // minimizable: false, // Minimizar
      parent: mainWindow, // Estabelecer uma relação hierárquica entre janelas
      modal: true, // Criar uma janela modal
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }

  note.loadFile('./src/views/nota.html')
}

// Inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
  createWindow()

  // Melhor local para estebelecer a conexão com o banco de dados
  // No MongoDb é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e fechar a conexão e encerrar quando o aplicativo for finalizado
  // ipcMain.on (receber mensagem)
  // db-connect (rótulo da mensagem)
  ipcMain.on('db-connect', async (event) => {
    // A linha abaixo estabelece a conexão com o banco de dados e verifica se foi conectado com sucesso (return true)
    const conectado = await conectar()
    if (conectado) {
      // Enviar ao rendereizador uma mensagem para trocar a imagem do ícone do status do banco de dados (criar um delay de 0.5s ou 1s para sincronização com a nuvem)
      setTimeout(() => {
        // Enviar ao renderizador a mensagem "conectado"
        // db-status (IPC - comunicação entre processos - autorizada pelo preload.js)
        event.reply('db-status', "conectado")
      }, 500) // 500ms = 0.5s
    }
  })

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

// IMPORTANTE! Desconectar do banco de dados quando a aplicação for finalizada
app.on('before-quit', async () => {
  await desconectar()
})

// Reduzir a verbosidade de logs não críticos (devtools)
app.commandLine.appendSwitch('log-level', '3')

// Template do menu
// Abertura e fechamento em [] é para a criação de um vetor
// Obs.: Abertura e fechamento em {} é para a criação de um objeto
const template = [
  {
    label: 'Notas',
    submenu: [
      {
        label: 'Criar nota',
        accelerator: 'Ctrl+N',
        click: () => noteWindow()
      },
      {
        type: 'separator'
      },
      {
        label: 'Sair',
        accelerator: 'Alt+F4',
        click: () => app.quit()
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir zoom',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'DevTools',
        role: 'toggleDevTools'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('https://github.com/ericaviana12/stickynotes')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]

// ============================================================
// CRUD - Create ==============================================

// Recebimento do objeto que contém os dados da nota
ipcMain.on('create-note', async (event, stickyNote) => {
  // IMPORTANTE! Teste de recebimento do objeto - Passo 2
  console.log(stickyNote)
  // Criar uma nova estrutura de dados para salvar no banco
  // ATENÇÃP! Os atributos da estrutura precisam ser idênticos ao modelo e os valores são obtidos através do objeto stickyNote
  const newNote = noteModel({
    texto: stickyNote.textNote,
    cor: stickyNote.colorNote
  })
  // Salvar a nota no banco de dados (Passo 3: fluxo)
  newNote.save()

})

// == Fim - CRUD - Create =====================================
// ============================================================