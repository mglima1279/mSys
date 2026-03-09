import { db, doc, getDoc, updateDoc } from "./config.js" 

const idIndex = JSON.parse(localStorage.getItem("transacaoId")) 
const mode =  JSON.parse(localStorage.getItem("transacaoMode"))// "entradas" ou "saidas"

const detalheValor = document.getElementById("detalhe-valor")
const detalheMetodo = document.getElementById("detalhe-metodo")
const detalheData = document.getElementById("detalhe-data")
const detalheCategoria = document.getElementById("detalhe-categoria")
const detalheDescricao = document.getElementById("detalhe-descricao")
const btnRemover = document.getElementById("btn-remover")

let transacaoAtual = null
let uid = null

async function loadDetalhes() {
    try {
        // 1. Pega o UID do utilizador
        uid = JSON.parse(localStorage.getItem("uid"))
        if (!uid) {
            alert("Usuário não autenticado.")
            window.location.href = "../login/"
            return
        }

        // 2. Verifica se a transação foi clicada corretamente
        if (idIndex === null || !mode) {
            alert("Transação não encontrada!")
            window.location.href = "../extrato/"
            return
        }

        // 3. Puxa os dados APENAS do documento do utilizador
        const docRef = doc(db, `users/${uid}`)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const userData = docSnap.data()
            const listaTransacoes = userData[mode] || []
            
            // 4. Encontra a transação exata baseada no index que o extrato salvou
            transacaoAtual = listaTransacoes[Number(idIndex)]

            if (!transacaoAtual) {
                alert("Transação não encontrada no banco de dados!")
                window.location.href = "../extrato/"
                return
            }

            // 5. Preenche a tela
            const isEntrada = mode === "entradas"
            detalheValor.className = isEntrada ? "text-success" : "text-danger"
            detalheValor.textContent = `R$ ${Number(transacaoAtual.value).toFixed(2).replace(".", ",")}`

            const metodoPagamento = transacaoAtual.payMethod || transacaoAtual.method || "N/A"
            detalheMetodo.textContent = metodoPagamento.toUpperCase().replace("_", " ")

            const [ano, mes, dia] = transacaoAtual.date.split("-")
            detalheData.textContent = transacaoAtual.date.includes("-") ? `${dia}/${mes}/${ano}` : transacaoAtual.date

            const tipoCategoria = transacaoAtual.type || "N/A"
            detalheCategoria.textContent = `${tipoCategoria.toUpperCase()} (${isEntrada ? 'Entrada' : 'Saída'})`

            detalheDescricao.textContent = transacaoAtual.desc || "Sem descrição."
        } else {
            alert("Conta de utilizador não encontrada!")
            window.location.href = "../login/"
        }
    } catch (error) {
        console.error(error)
        alert("Erro ao carregar detalhes da transação.")
    }
}

btnRemover.addEventListener("click", async () => {
    const confirmar = confirm("Tem certeza que deseja apagar esta transação? Esta ação não pode ser desfeita.")
    if (!confirmar || !transacaoAtual || !uid) return

    btnRemover.disabled = true
    btnRemover.textContent = "APAGANDO..."

    try {
        const userRef = doc(db, `users/${uid}`)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
            const userData = userSnap.data()
            let listaTransacoes = userData[mode] || []
            
            // 1. Remove a transação da lista usando o Splice
            // Ele vai na posição exata (idIndex) e remove 1 item
            listaTransacoes.splice(Number(idIndex), 1)

            // 2. Calcula o novo valor total (subtraindo o valor da transação apagada)
            const tipoTransacao = transacaoAtual.type // "empresa" ou "pessoal"
            let valorTotalAtual = userData.valoresTotais?.[mode]?.[tipoTransacao] || 0
            
            let novoValorTotal = valorTotalAtual - Number(transacaoAtual.value)
            
            // Impede que o total fique negativo por algum erro de arredondamento
            if (novoValorTotal < 0) novoValorTotal = 0

            // 3. Prepara as modificações para enviar de uma vez só
            const updates = {
                [mode]: listaTransacoes, // Substitui o array antigo pelo array sem o item
                [`valoresTotais.${mode}.${tipoTransacao}`]: novoValorTotal // Atualiza a "gaveta" de totais
            }

            // 4. Salva no banco de dados
            await updateDoc(userRef, updates)

            alert("Transação removida com sucesso!")
            window.location.href = "../extrato/"
        }
    } catch (error) {
        console.error(error)
        alert("Erro ao remover transação.")
        btnRemover.disabled = false
        btnRemover.textContent = "REMOVER"
    }
})

// Inicia a leitura da tela
loadDetalhes()