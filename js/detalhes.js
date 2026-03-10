import { db, doc, getDoc, updateDoc } from "./config.js" 

const idIndex = localStorage.getItem("transacaoId") 
const mode = localStorage.getItem("transacaoMode")

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
        uid = JSON.parse(localStorage.getItem("uid"))
        
        if (!uid) {
            alert("Usuário não autenticado.")
            window.location.href = "../login/"
            return
        }

        if (idIndex === null || !mode) {
            alert("Transação não encontrada!")
            window.location.href = "../extrato/"
            return
        }

        const docRef = doc(db, `users/${uid}`)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const userData = docSnap.data()
            const listaTransacoes = userData[mode] || []

            transacaoAtual = listaTransacoes[Number(idIndex)]

            if (!transacaoAtual) {
                alert("Transação não encontrada no banco de dados!")
                window.location.href = "../extrato/"
                return
            }

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

            listaTransacoes.splice(Number(idIndex), 1)

            const tipoTransacao = transacaoAtual.type
            let valorTotalAtual = userData.valoresTotais?.[mode]?.[tipoTransacao] || 0

            let novoValorTotal = valorTotalAtual - Number(transacaoAtual.value)

            if (novoValorTotal < 0) novoValorTotal = 0

            const updates = {
                [mode]: listaTransacoes,
                [`valoresTotais.${mode}.${tipoTransacao}`]: novoValorTotal
            }

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

loadDetalhes()