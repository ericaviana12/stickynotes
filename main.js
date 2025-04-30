console.log("Electron - Processo principal")

// Importação dos recursos do framework
// app -> aplicação
// BrowserWindow -> criação da janela
// nativeTheme -> definir o tema claro, escuro ou padrão do sistema
// Menu -> definir um menu personalizado
// Shell -> Acessar links e aplicações externos no navegador padrão
// ipcMain -> Permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
// dialog -> Módulo electron para ativar caixa de mensagens
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

// Ativação do preload.js (importação do path)
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { connectDB, disconnectDB } = require('./database.js')

// Importação do modelo de dados (Notes.js)
const noteModel = require('./src/models/Notes.js')

// Janela principal
let win
const createWindow = () => {
  // definindo o tema da janela claro ou ecuro
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1010,
    height: 720,
    //frame: false,
    //resizable: false,
    //minimizable: false,
    //closable: false,
    //autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Carregar o menu personalizado
  // Atenção! Antes importar o recurso Menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  // carregar o documento html na janela
  win.loadFile('./src/views/index.html')
}

// janela sobre
let about
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  // obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // validação (se existir a janela principal)
  if (mainWindow) {
    about = new BrowserWindow({
      width: 300,
      height: 200,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      // estabelecer uma relação hierárquica entre janelas
      parent: mainWindow,
      // criar uma janela modal (só retorna a principal quando encerrada)
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }

  about.loadFile('./src/views/sobre.html')

  //recebimento da mensagem do renderizador da tela sobre para fechar a janela usando o botão OK
  ipcMain.on('about-exit', () => {
    //validação (se existir a janela e ela não estiver sido destruída, fechar)
    if (about && !about.isDestroyed()) {
      about.close()
    }
  })
}

// janela nota
let note
function noteWindow() {
  nativeTheme.themeSource = 'light'
  // obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // validação (se existir a janela principal)
  if (mainWindow) {
    note = new BrowserWindow({
      width: 400,
      height: 270,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      // estabelecer uma relação hierárquica entre janelas
      parent: mainWindow,
      // criar uma janela modal (só retorna a principal quando encerrada)
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }

  note.loadFile('./src/views/nota.html')
}

// inicialização da aplicação (assíncronismo)
app.whenReady().then(() => {
  createWindow()

  // Melhor local para estabelecer a conexão com o banco de dados
  // No MongoDB é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e encerrar a conexão quando o aplicativo for finalizado
  // ipcMain.on (receber mensagem)
  // db-connect (rótulo da mensagem)
  ipcMain.on('db-connect', async (event) => {
    //a linha abaixo estabelece a conexão com o banco de dados e verifica se foi conectado com sucesso (return true)
    const connected = await connectDB()
    if (connected) {
      // enviar ao renderizador uma mensagem para trocar a imagem do ícone do status do banco de dados (criar um delay de 0.5 ou 1s para sincronização com a nuvem)
      setTimeout(() => {
        // enviar ao renderizador a mensagem "conectado"
        // db-status (IPC - comunicação entre processos - preload.js)
        event.reply('db-status', "conectado")
      }, 500) //500ms = 0.5s
    }
  })

  // só ativar a janela principal se nenhuma outra estiver ativa
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// se o sistem não for MAC encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IMPORTANTE! Desconectar do banco de dados quando a aplicação for finalizada
app.on('before-quit', async () => {
  await disconnectDB()
})

// Reduzir a verbosidade de logs não críticos (devtools)
app.commandLine.appendSwitch('log-level', '3')

// template do menu
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
        label: 'Reduzir',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar o zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        click: () => updateList()
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

// =================================================
// == CRUD Create ==================================

// Recebimento do objeto que contem os dados da nota
ipcMain.on('create-note', async (event, stickyNote) => {
  //IMPORTANTE! Teste de recebimento do objeto - Passo 2
  console.log(stickyNote)
  //uso do try-catch para tratamento de excessões
  try {
    //Criar uma nova estrutura de dados para salvar no banco
    //Atenção! Os atributos da estrutura precisam ser idênticos ao modelo e os valores são obtidos através do objeto stickNote
    const newNote = noteModel({
      // Esse dois abaixo permanecem em inglês, pois é relacionado ao campo da tabela
      texto: stickyNote.textNote,
      cor: stickyNote.colorNote
    })
    // Salvar a nota no banco de dados (Passo 3: fluxo)
    newNote.save()
    // Enviar ao renderizador um pedido para limpar os campos e setar o formulário com os padrões originais (foco no texto), usando o preload.js
    event.reply('reset-form')
  } catch (error) {
    console.log(error)
  }
})

// == Fim - CRUD Create ============================
// =================================================


// =================================================
// == CRUD Read ====================================

// Passo 2: Receber do renderer.js o pedido para listar as notas e fazer a busca no banco de dados
ipcMain.on('list-notes', async (event) => {
  // console.log("Teste IPC [list-notes]")
  try {
    // Passo 3: Obter do banco de dados a listagem de notas cadastradas
    const notes = await noteModel.find()
    console.log(notes) // Teste do Passo 3
    // Passo 4: Enviar ao renderer a listagem das notas
    // OBS.: IPC (string) | Banco de dados (JSON) -> É necessário uma conversão usando JSON.stringify()
    // event.reply() -> Reposta à solicitação (específica do solicitante)
    event.reply('render-notes', JSON.stringify(notes))
  } catch (error) {
    console.log(error)
  }
})

// == Fim - CRUD Read ==============================
// =================================================


// =================================================
// Atualização da lista de notas ===================

ipcMain.on('update-list', () => {
  updateList()
})

function updateList() {
  // Validação (se a janela principal exixtir e não tiver sido encerrada)
  if (win && !win.isDestroyed()) {
    // Enviar ao renderer.js um pedido para recarregar a página
    win.webContents.send('main-reload')
    // Enviar novamente um pedido para troca do ícone de status 
    setTimeout(() => {
      win.webContents.send('db-status', "conectado")
    }, 200) // tempo para garantir que o renderer esteja pronto
  }
}

// Fim - Atualização da lista de notas =============
// =================================================


// =================================================
// == CRUD Delete ==================================

ipcMain.on('delete-note', async (event, id) => {
  console.log(id) // Teste do passo 2 (IMPORTANTE!)
  // Excluir o registro do banco - Passo 3 (IMPORTANTE! -> confirmar antes da exclusão)
  // win -> Janela principal
  const result = await dialog.showMessageBox(win, {
    type: 'warning',
    title: 'Atenção',
    message: 'Tem certeza que deseja excluir esta nota?\nEsta ação não poderá ser desfeita.',
    buttons: ['Cancelar', 'Excluir'] // [0, 1]
  })
  if (result.response === 1) {
    try {
      const deleteNote = await noteModel.findByIdAndDelete(id)
      updateList()
    } catch (error) {
      console.log(error)
    }
  }
})

// == Fim - CRUD Delete ============================
// =================================================
