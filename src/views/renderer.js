/**
 * Processo de renderização do documento index.html
 */

console.log("Processo de renderização")

// Estratégia para renderizar (desenhar) as notas adesivas:
// Usar uam lista para preencher de forma dinâmica os itens (notas)

// Vetor global para manipular os dados do banco
let arrayNotes = []

// Captura do id da lista <ul> do documento index.html
const list = document.getElementById('listNotes')

// inserção da data no rodapé
function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

document.getElementById('dataAtual').innerHTML = obterData()

// Troca do ícone do banco de dados (status da conecão)
// Uso da API do preload.js
api.dbStatus((event, message) => {
    // Teste de recebimento da mensagem
    console.log(message)
    if (message === "conectado") {
        document.getElementById('iconeDB').src = "../public/img/dbon.png"
    } else {
        document.getElementById('iconeDB').src = "../public/img/dboff.png"
    }
})

// =================================================
// == CRUD Read ====================================

// Passo 1: Enviar ao main.js um pedido para listar as notas
api.listNotes()

// Passo 5: Recebimento das notas via IPC e rendereização (desenho) das notas no documento index.html
api.renderNotes((event, notes) => { // Recebe a massa de dados (pois é um vetor)
    const renderNotes = JSON.parse(notes) // JSON.parse() -> Converte de string para JSON
    console.log(renderNotes) // Teste de recebimento do passo 5
    // Renderizar no index.html o conteúdo do array
    arrayNotes = renderNotes // Atribuir ao vetor o JSON recebido
    // Uso do laço forEach para percorrer o vetor e extrair os dados
    arrayNotes.forEach((n) => {
        // Adição de tags <li> no documento index.html
        list.innerHTML += `
            <br>
            <li>
                <p onclick="deleteNote('${n._id}')" id="x"> X <\p>
                <p>${n._id}<\p>
                <p>${n.texto}<\p>
                <p>${n.cor}<\p>
            <\li>
        `
    })
})

// == Fim - CRUD Read ==============================
// =================================================

// =================================================
// === Atualização das Notas =======================

api.mainReload((args) => {
    location.reload()
})

// =================================================
// === Fim - Atualização das notas =================


// =================================================
// == CRUD Delete ==================================

function deleteNote(id) {
    console.log(id) // Passo 1 -> Receber o ID da nota a ser excluída
    api.deleteNote(id) // Passo 2 -> Enviar o ID da nota ao main.js
}

// == Fim - CRUD Delete ============================
// =================================================
