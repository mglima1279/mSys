import { db, collection, addDoc, doc, getDoc, updateDoc } from "../config.js"

const form = document.querySelector("form")

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const btnSalvar = form.querySelector('button[type="submit"]')
        const textoOriginal = btnSalvar.innerText
        btnSalvar.disabled = true
        btnSalvar.innerText = "SALVANDO..."

        const mode = document.body.id
        const tipoTransacao = form.id

        const priceInput = document.getElementById("price")
        const paySelect = document.getElementById("pay")
        const descInput = document.getElementById("desc")
        const checkRepasse = document.getElementById("check-repasse")

        let valor = Number(priceInput.value)
        const metodo = paySelect.value
        const descricao = descInput.value

        const dataAtual = new Date()
        const dataStr = dataAtual.toISOString().split("T")[0]

        if (valor <= 0) {
            alert("O valor deve ser maior que zero.")
            btnSalvar.disabled = false
            btnSalvar.innerText = textoOriginal
            return
        }

        let valorPrincipal = valor
        let valorRepasse = 0

        if (checkRepasse && checkRepasse.checked && mode === "entrada" && tipoTransacao === "empresa") {
            valorRepasse = valor * 0.5
            valorPrincipal = valor - valorRepasse
        }

        try {
            await addDoc(collection(db, mode), {
                value: valorPrincipal,
                type: tipoTransacao,
                date: dataStr,
                desc: descricao,
                method: metodo
            })

            if (valorRepasse > 0) {
                await addDoc(collection(db, mode), {
                    value: valorRepasse,
                    type: "pessoal",
                    date: dataStr,
                    desc: descricao ? `${descricao} (Repasse 50%)` : "Repasse automático (50%)",
                    method: metodo
                })
            }

            const totalRef = doc(db, "valores-totais", mode)
            const totalSnap = await getDoc(totalRef)

            if (totalSnap.exists()) {
                const totaisAtuais = totalSnap.data()

                let novoValorPrincipal = (totaisAtuais[tipoTransacao] || 0) + valorPrincipal
                let atualizacoes = { [tipoTransacao]: novoValorPrincipal }

                if (valorRepasse > 0) {
                    let novoValorPessoal = (totaisAtuais["pessoal"] || 0) + valorRepasse
                    atualizacoes["pessoal"] = novoValorPessoal
                }

                await updateDoc(totalRef, atualizacoes)
            } else {
                let criacao = { [tipoTransacao]: valorPrincipal }
                if (valorRepasse > 0) {
                    criacao["pessoal"] = valorRepasse
                }
                await updateDoc(totalRef, criacao)
            }

            alert("Transação registrada com sucesso!")
            window.location.href = "../extrato/"
        } catch (error) {
            console.error(error)
            alert("Erro ao salvar transação.")
            btnSalvar.disabled = false
            btnSalvar.innerText = textoOriginal
        }
    })
}