import { db, doc, getDoc, updateDoc, arrayUnion } from "./config.js"

const form = document.querySelector("form")

// 1. PROTEÇÃO DE PLURAL: Garante que "entrada" vira "entradas" para bater com o banco de dados
let mode = document.body.id
if (mode === "entrada") mode = "entradas"
if (mode === "saida") mode = "saidas"

const tipoTransacao = form.id // Espera-se "empresa" ou "pessoal"

form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const btnSalvar = form.querySelector('button[type="submit"]')
    const textoOriginal = btnSalvar.textContent
    btnSalvar.disabled = true
    btnSalvar.textContent = "SALVANDO..."

    const uid = JSON.parse(localStorage.getItem("uid"))
    
    if (!uid) {
        alert("Usuário não autenticado. Faça login novamente.")
        window.location.href = "../login/"
        return
    }

    const data = new FormData(form)
    const checkRepasse = document.getElementById("check-repasse")

    let valor = parseFloat(data.get("price"))
    const metodo = data.get("pay")
    const descricao = data.get("desc")

    const dataAtual = new Date()
    const dataStr = dataAtual.toISOString().split("T")[0]

    if (valor <= 0 || isNaN(valor)) {
        alert("O valor deve ser um número maior que zero.")
        btnSalvar.disabled = false
        btnSalvar.textContent = textoOriginal
        return
    }

    let valorPrincipal = valor
    let valorRepasse = 0

    if (checkRepasse && checkRepasse.checked) {
        valorRepasse = valor * 0.5
        valorPrincipal = valor - valorRepasse
    }

    try {
        const userRef = doc(db, `users/${uid}`)
        const userSnap = await getDoc(userRef)

        // 2. PARADA OBRIGATÓRIA: Se não tem doc, não tente continuar
        if (!userSnap.exists()) {
            throw new Error("Documento do usuário não encontrado no banco de dados.")
        }

        const userData = userSnap.data()
        
        const transacaoPrincipal = {
            value: valorPrincipal,
            type: tipoTransacao,
            date: dataStr,
            desc: descricao,
            method: metodo
        }

        let novasTransacoes = [transacaoPrincipal]

        if (valorRepasse > 0) {
            const transacaoRepasse = {
                value: valorRepasse,
                type: "pessoal",
                date: dataStr,
                desc: descricao ? `${descricao} (Repasse 50%)` : "Repasse automático (50%)",
                method: metodo
            }
            novasTransacoes.push(transacaoRepasse)
        }

        // 3. ESCUDO PROTETOR DOS VALORES (Usando || 0)
        let totalPrincipal = userData.valoresTotais?.[mode]?.[tipoTransacao] || 0
        totalPrincipal += valorPrincipal

        let updates = {
            [mode]: arrayUnion(...novasTransacoes), 
            [`valoresTotais.${mode}.${tipoTransacao}`]: totalPrincipal
        }

        if (valorRepasse > 0) {
            let totalPessoal = userData.valoresTotais?.[mode]?.pessoal || 0
            totalPessoal += valorRepasse
            
            updates[`valoresTotais.${mode}.pessoal`] = totalPessoal
        }

        await updateDoc(userRef, updates)

        alert("Transação registrada com sucesso!")
        window.location.href = "../extrato/"
        
    } catch (error) {
        console.error(error)
        alert("Erro ao salvar transação. Verifique sua conexão.")
        btnSalvar.disabled = false
        btnSalvar.textContent = textoOriginal
    }
})