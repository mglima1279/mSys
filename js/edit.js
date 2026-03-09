import { db, doc, getDoc, updateDoc } from "./config.js"

const idIndex = localStorage.getItem("transacaoId")
const mode = localStorage.getItem("transacaoMode")

const formEditar = document.getElementById("form-editar")
const inputValor = document.getElementById("input-valor")
const inputData = document.getElementById("input-data")
const inputMetodo = document.getElementById("input-metodo")
const inputDesc = document.getElementById("input-desc")
const btnSalvar = document.getElementById("btn-salvar")

let transacaoAntiga = null
let uid = null

async function loadForm() {
    uid = JSON.parse(localStorage.getItem("uid"))
    
    if (!uid || !idIndex || !mode) {
        window.location.href = "../extrato/"
        return
    }

    const docRef = doc(db, `users/${uid}`)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        const userData = docSnap.data()
        const listaTransacoes = userData[mode] || []
        
        transacaoAntiga = listaTransacoes[Number(idIndex)]

        if (!transacaoAntiga) {
            alert("Transação não encontrada!")
            window.location.href = "../extrato/"
            return
        }

        inputValor.value = Number(transacaoAntiga.value).toFixed(2)
        inputData.value = transacaoAntiga.date
        inputMetodo.value = transacaoAntiga.method
        inputDesc.value = transacaoAntiga.desc
    } else {
        alert("Conta de usuário não encontrada!")
        window.location.href = "../login/"
    }
}

formEditar.addEventListener("submit", async (e) => {
    e.preventDefault()

    btnSalvar.disabled = true
    btnSalvar.textContent = "SALVANDO..."

    const novoValor = Number(inputValor.value)

    try {
        const docRef = doc(db, `users/${uid}`)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const userData = docSnap.data()
            let listaTransacoes = userData[mode] || []

            listaTransacoes[Number(idIndex)] = {
                ...transacaoAntiga,
                value: novoValor,
                date: inputData.value,
                method: inputMetodo.value,
                desc: inputDesc.value
            }

            const diferenca = novoValor - Number(transacaoAntiga.value)
            const tipoTransacao = transacaoAntiga.type

            let valorTotalAtual = userData.valoresTotais?.[mode]?.[tipoTransacao] || 0
            let novoTotal = valorTotalAtual + diferenca

            if (novoTotal < 0) novoTotal = 0

            await updateDoc(docRef, {
                [mode]: listaTransacoes,
                [`valoresTotais.${mode}.${tipoTransacao}`]: novoTotal
            })

            alert("Transação atualizada com sucesso!")
            window.location.href = "../detalhes/"
        }
    } catch (error) {
        console.error(error)
        alert("Erro ao salvar alterações.")
        btnSalvar.disabled = false
        btnSalvar.textContent = "SALVAR ALTERAÇÕES"
    }
})

loadForm()