import { db, doc, getDoc, updateDoc } from "./config.js"

const id = localStorage.getItem("transacaoId")
const mode = localStorage.getItem("transacaoMode")

const formEditar = document.getElementById("form-editar")
const inputValor = document.getElementById("input-valor")
const inputData = document.getElementById("input-data")
const inputMetodo = document.getElementById("input-metodo")
const inputDesc = document.getElementById("input-desc")
const btnSalvar = document.getElementById("btn-salvar")

let transacaoAntiga = null

async function loadForm() {
    if (!id || !mode) {
        window.location.href = "../extrato/"
        return
    }

    const docRef = doc(db, mode, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        transacaoAntiga = docSnap.data()

        inputValor.value = Number(transacaoAntiga.value).toFixed(2)
        inputData.value = transacaoAntiga.date
        inputMetodo.value = transacaoAntiga.method
        inputDesc.value = transacaoAntiga.desc
    } else {
        alert("Transação não encontrada!")
        window.location.href = "../extrato/"
    }
}

formEditar.addEventListener("submit", async (e) => {
    e.preventDefault()

    btnSalvar.disabled = true
    btnSalvar.textContent = "SALVANDO..."

    const novoValor = Number(inputValor.value)

    try {
        // Atualiza o documento da transação
        const docRef = doc(db, mode, id)
        await updateDoc(docRef, {
            value: novoValor,
            date: inputData.value,
            method: inputMetodo.value,
            desc: inputDesc.value
        })

        // Calcula a diferença para ajustar o total da categoria correta
        if (transacaoAntiga.value !== novoValor) {
            const diferenca = novoValor - Number(transacaoAntiga.value)
            const tipoTransacao = transacaoAntiga.type

            const totalRef = doc(db, "valores-totais", mode)
            const totalSnap = await getDoc(totalRef)

            if (totalSnap.exists()) {
                const totaisAtuais = totalSnap.data()
                const novoTotal = (totaisAtuais[tipoTransacao] || 0) + diferenca

                await updateDoc(totalRef, {
                    [tipoTransacao]: novoTotal
                })
            }
        }

        alert("Transação atualizada com sucesso!")
        window.location.href = "../detalhes/"
    } catch (error) {
        console.error(error)
        alert("Erro ao salvar alterações.")
        btnSalvar.disabled = false
        btnSalvar.textContent = "SALVAR ALTERAÇÕES"
    }
})

loadForm()