import { db, doc, getDoc } from "https://mglima1279.github.io/mSys/js/config.js"

const listaExtrato = document.getElementById("lista-extrato")

async function loadExtrato() {
    try {
        // 1. Pega o UID do usuário
        const uid = JSON.parse(localStorage.getItem("uid"))
        
        if (!uid) {
            alert("Usuário não autenticado. Faça login novamente.")
            window.location.href = "../login/"
            return
        }

        const userRef = doc(db, `users/${uid}`)
        const userSnap = await getDoc(userRef)

        let transacoes = []

        if (userSnap.exists()) {
            const userData = userSnap.data()
            
            // Pega os arrays (se for usuário novo e não tiver, usa array vazio [])
            const entradas = userData.entradas || []
            const saídas = userData.saidas || []

            // 3. Junta as entradas na lista geral
            entradas.forEach((item, index) => {
                transacoes.push({ 
                    ...item, 
                    mode: "entradas", 
                    id: index // Usamos a posição no array como um ID temporário
                })
            })

            // 4. Junta as saídas na lista geral
            saídas.forEach((item, index) => {
                transacoes.push({ 
                    ...item, 
                    mode: "saidas", 
                    id: index
                })
            })
        }

        // 5. Ordena as transações pela Data (da mais recente para a mais antiga)
        transacoes.sort((a, b) => new Date(b.date) - new Date(a.date))

        listaExtrato.innerHTML = ""
        let dataAtual = ""

        transacoes.forEach(item => {
            // Lógica de agrupamento por Data (separadores visuais)
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

            // Salva no Local Storage qual item foi clicado (usando o index e o mode)
            linkItem.addEventListener("click", () => {
                localStorage.setItem("transacaoId", item.id)
                localStorage.setItem("transacaoMode", item.mode) 
            })

            // Ajuste na verificação para o plural ("entradas")
            const isEntrada = item.mode === "entradas"
            const corValor = isEntrada ? "text-success" : "text-danger"
            const sinal = isEntrada ? "+ R$" : "- R$"
            
            // Garante que o valor seja tratado como número antes de formatar
            const valorFormatado = Number(item.value).toFixed(2).replace(".", ",")
            const tipoExibicao = item.type.toUpperCase() 

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