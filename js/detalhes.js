import { db, doc, getDoc, deleteDoc, updateDoc } from "https://mglima1279.github.io/mSys/js/config.js"

const id = localStorage.getItem("transacaoId")
const mode = localStorage.getItem("transacaoMode")

const detalheValor = document.getElementById("detalhe-valor")
const detalheMetodo = document.getElementById("detalhe-metodo")
const detalheData = document.getElementById("detalhe-data")
const detalheCategoria = document.getElementById("detalhe-categoria")
const detalheDescricao = document.getElementById("detalhe-descricao")
const btnRemover = document.getElementById("btn-remover")

let transacaoAtual = null

async function loadDetalhes() {
    if (!id || !mode) {
        alert("Transação não encontrada!")
        window.location.href = "../extrato/"
        return
    }

    const docRef = doc(db, mode, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        transacaoAtual = docSnap.data()

        const isEntrada = mode === "entrada"
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
        alert("O documento não existe no banco de dados!")
        window.location.href = "../extrato/"
    }
}

btnRemover.addEventListener("click", async () => {
    const confirmar = confirm("Tem certeza que deseja apagar esta transação?")
    if (!confirmar || !transacaoAtual) return

    btnRemover.disabled = true
    btnRemover.textContent = "APAGANDO..."

    try {
        await deleteDoc(doc(db, mode, id))

        const totalRef = doc(db, "valores-totais", mode)
        const totalSnap = await getDoc(totalRef)

        if (totalSnap.exists()) {
            const totaisAtuais = totalSnap.data()
            const tipoTransacao = transacaoAtual.type

            const novoValor = (totaisAtuais[tipoTransacao] || 0) - Number(transacaoAtual.value)

            await updateDoc(totalRef, {
                [tipoTransacao]: novoValor < 0 ? 0 : novoValor
            })
        }

        alert("Transação removida com sucesso!")
        window.location.href = "../extrato/"
    } catch (error) {
        console.error(error)
        alert("Erro ao remover transação.")
        btnRemover.disabled = false
        btnRemover.textContent = "REMOVER"
    }
})

loadDetalhes()