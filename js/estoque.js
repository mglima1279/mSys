import { db, doc, getDoc, updateDoc, arrayUnion } from "./config.js"

const listaEstoque = document.getElementById("lista-estoque")
const btnSalvar = document.getElementById("btn-salvar")
const btnAdicionar = document.getElementById("btn-adicionar")
const inputNovoNome = document.getElementById("novo-nome")
const inputNovoQtd = document.getElementById("novo-qtd")

// Função auxiliar para pegar o ID do usuário (usada em várias partes)
function getUserId() {
    const uid = JSON.parse(localStorage.getItem("uid"))
    if (!uid) {
        alert("Usuário não autenticado. Faça login novamente.")
        window.location.href = "../login/"
        return null
    }
    return uid
}

async function loadEstoque() {
    const uid = getUserId()
    if (!uid) return

    try {
        const userRef = doc(db, `users/${uid}`)
        const userSnap = await getDoc(userRef)

        listaEstoque.innerHTML = ""

        if (userSnap.exists()) {
            const userData = userSnap.data()
            const estoque = userData.estoque || [] // Pega o array de estoque ou cria um vazio

            if (estoque.length === 0) {
                listaEstoque.innerHTML = "<p style='text-align: center;' id='msg-vazio'>Estoque vazio.</p>"
                return
            }

            estoque.forEach(item => {
                renderItemDOM(item.id, item.nome, item.qtd)
            })
        }
    } catch (error) {
        console.error(error)
        listaEstoque.innerHTML = "<p style='text-align: center; color: var(--danger);'>Erro ao carregar estoque.</p>"
    }
}

function renderItemDOM(id, nome, qtd) {
    const msgVazio = document.getElementById("msg-vazio")
    if (msgVazio) msgVazio.remove()

    const divItem = document.createElement("div")
    divItem.className = "lista-item"

    divItem.innerHTML = `
        <span class="estoque-nome">${nome}</span>
        <div class="item-controls">
            <input type="number" class="estoque-input" data-id="${id}" value="${qtd}" min="1" style="width: 60px;">
            <button class="btn-remover" data-id="${id}">X</button>
        </div>
    `

    listaEstoque.appendChild(divItem)

    const btnRemover = divItem.querySelector(".btn-remover")
    btnRemover.addEventListener("click", async (e) => {
        const itemId = e.target.getAttribute("data-id")
        const confirmar = confirm(`Tem certeza que deseja apagar "${nome}" do estoque?`)

        if (confirmar) {
            e.target.disabled = true
            const uid = getUserId()
            if(!uid) return

            try {
                const userRef = doc(db, `users/${uid}`)
                const userSnap = await getDoc(userRef)
                
                // Pega a lista atual, remove o item clicado e salva a nova lista
                const estoqueAtual = userSnap.data().estoque || []
                const novoEstoque = estoqueAtual.filter(item => item.id !== itemId)

                await updateDoc(userRef, { estoque: novoEstoque })
                divItem.remove()

                if (listaEstoque.children.length === 0) {
                    listaEstoque.innerHTML = "<p style='text-align: center;' id='msg-vazio'>Estoque vazio.</p>"
                }
            } catch (error) {
                console.error(error)
                alert("Erro ao remover item.")
                e.target.disabled = false
            }
        }
    })
}

btnAdicionar.addEventListener("click", async () => {
    const uid = getUserId()
    if (!uid) return

    const nome = inputNovoNome.value.trim().toUpperCase()
    const qtd = Number(inputNovoQtd.value)

    if (!nome) {
        alert("Por favor, digite o nome do produto.")
        return
    }

    if (qtd <= 0) {
        alert("A quantidade não pode ser zero ou negativa.")
        return
    }

    btnAdicionar.disabled = true
    btnAdicionar.innerText = "..."

    try {
        const userRef = doc(db, `users/${uid}`)
        
        // Como não usamos mais uma coleção separada, precisamos criar um ID único na mão
        const novoId = "item_" + Date.now() 
        
        const novoItem = { id: novoId, nome: nome, qtd: qtd }

        // arrayUnion adiciona o novo item ao final da lista existente no banco
        await updateDoc(userRef, {
            estoque: arrayUnion(novoItem)
        })

        renderItemDOM(novoId, nome, qtd)

        inputNovoNome.value = ""
        inputNovoQtd.value = "1"
    } catch (error) {
        console.error(error)
        alert("Erro ao adicionar produto.")
    } finally {
        btnAdicionar.disabled = false
        btnAdicionar.innerText = "+"
    }
})

btnSalvar.addEventListener("click", async () => {
    const uid = getUserId()
    if (!uid) return

    const inputs = document.querySelectorAll(".estoque-input")
    let temZero = false
    let novoEstoqueAtualizado = []

    // Varre todos os inputs da tela para montar a nova lista atualizada
    inputs.forEach(input => {
        const qtd = Number(input.value)
        if (qtd <= 0) temZero = true

        const id = input.getAttribute("data-id")
        // Pega o nome do produto subindo para a div pai e buscando o span
        const nome = input.closest(".lista-item").querySelector(".estoque-nome").innerText 

        novoEstoqueAtualizado.push({ id, nome, qtd })
    })

    if (temZero) {
        alert("Não é possível salvar itens com 0 unidades. Use o botão 'X' para remover o item se ele acabou.")
        return
    }

    btnSalvar.disabled = true
    const textoOriginal = btnSalvar.innerText
    btnSalvar.innerText = "SALVANDO..."

    try {
        const userRef = doc(db, `users/${uid}`)
        
        // Substitui a lista de estoque inteira pela nossa lista atualizada
        await updateDoc(userRef, { estoque: novoEstoqueAtualizado })
        
        alert("Estoque atualizado com sucesso!")
    } catch (error) {
        console.error(error)
        alert("Erro ao atualizar quantidades do estoque.")
    } finally {
        btnSalvar.disabled = false
        btnSalvar.innerText = textoOriginal
    }
})

loadEstoque()