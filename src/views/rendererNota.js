/**
 * Processo de renderização do documento nota.html
 */

// Para "debugar" e testar a aplicação é necessário ativar as ferramentas do desenvolvedor <ctrl><shift><i>
// console.log("Teste")

// Capturar o foco da caixa de texto
const foco = document.getElementById('inputNote')

// Alterar as propriedades do documento HTML ao iniciar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    foco.focus() // Iniciar o documento com foco na caixa de texto
})

// Capturar os dados do formulário (Passo 1: fluxo)
let frmNote = document.getElementById('frmNote')
let note = document.getElementById('inputNote')
let color = document.getElementById('selectColor')

// ============================================================
// CRUD - Create ==============================================

// Evento relacionado ao botão submit
frmNote.addEventListener('submit', (event) => {
    // Evitar o comportamento padrão (recarregar a página)
    event.preventDefault()
    // IMPORTANTE! Teste de recebimento dos dados do form - Passo 1
    console.log(`Nota: ${note.value} - Cor: ${color.value}`)
    // Criar um objeto para enviar ao main os dados da nota
    const stickyNote = {
        textNote: note.value,
        colorNote: color.value
    }
    // Enviar o objeto para o main (Passo 2: fluxo)
    api.createNote(stickyNote)
})

// == Fim - CRUD - Create =====================================
// ============================================================