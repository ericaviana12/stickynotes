/**
 * Processo de renderização do documento sobre.html
 */

// Enviar uma mensagem para o processo principal fechar a janela sobre
function exit() {
    // Executar a função aboutExit() vinculada ao preload.js, através da API dp electron (ipcRenderer)
    api.aboutExit()
}