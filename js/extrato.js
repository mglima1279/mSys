import { db, collection, getDocs } from "./config.js"

const listaExtrato = document.getElementById("lista-extrato")

async function loadExtrato() {
    try {
        const entradasSnapshot = await getDocs(collection(db, "entrada"))
        const saidasSnapshot = await getDocs(collection(db, "saida"))

        let transacoes = []

        entradasSnapshot.forEach(doc => {
            transacoes.push({ id: doc.id, mode: "entrada", ...doc.data() })
        })

        saidasSnapshot.forEach(doc => {
            transacoes.push({ id: doc.id, mode: "saida", ...doc.data() })
        })

        // Ordena para os mais recentes primeiro (considerando timestamp ou ID)
        transacoes.sort((a, b) => Number(b.id) - Number(a.id))

        listaExtrato.innerHTML = ""
        let dataAtual = ""

        transacoes.forEach(item => {
            if (item.date !== dataAtual) {
                const dataDiv = document.createElement("div")
                dataDiv.className = "extrato-data"
                const [ano, mes, dia] = item.date.split("-")
                dataDiv.textContent = item.date.includes("-") ? `${dia}/${mes}/${ano}` : item.date
                listaExtrato.appendChild(dataDiv)
                dataAtual = item.date
            }

            const linkItem = document.createElement("a")
            linkItem.href = "../detalhes/"
            linkItem.className = "lista-item"

            // Salva no Local Storage qual item foi clicado
            linkItem.addEventListener("click", () => {
                localStorage.setItem("transacaoId", item.id)
                localStorage.setItem("transacaoMode", item.mode) // "entrada" ou "saida"
            })

            const isEntrada = item.mode === "entrada"
            const corValor = isEntrada ? "text-success" : "text-danger"
            const sinal = isEntrada ? "+ R$" : "- R$"
            const valorFormatado = Number(item.value).toFixed(2).replace(".", ",")

            const tipoExibicao = item.type.toUpperCase() // 'PESSOAL' ou 'EMPRESA'

            linkItem.innerHTML = `
                <span class="extrato-valor ${corValor}">${sinal} ${valorFormatado}</span>
                <span class="extrato-tipo">${tipoExibicao}</span>
            `

            listaExtrato.appendChild(linkItem)
        })

        if (transacoes.length === 0) {
            listaExtrato.innerHTML = "<p style='text-align: center;'>Nenhuma transação encontrada.</p>"
        }

    } catch (error) {
        console.error(error)
        listaExtrato.innerHTML = "<p style='text-align: center; color: var(--danger);'>Erro ao carregar extrato.</p>"
    }
}

loadExtrato()