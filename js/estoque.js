import { db, collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "https://mglima1279.github.io/mSys/js/config.js"

const listaEstoque = document.getElementById("lista-estoque")
const btnSalvar = document.getElementById("btn-salvar")
const btnAdicionar = document.getElementById("btn-adicionar")
const inputNovoNome = document.getElementById("novo-nome")
const inputNovoQtd = document.getElementById("novo-qtd")

async function loadEstoque() {
    try {
        const estoqueSnapshot = await getDocs(collection(db, "estoque"))
        listaEstoque.innerHTML = ""

        if (estoqueSnapshot.empty) {
            listaEstoque.innerHTML = "<p style='text-align: center;' id='msg-vazio'>Estoque vazio.</p>"
            return
        }

        estoqueSnapshot.forEach(docSnap => {
            const item = docSnap.data()
            renderItemDOM(docSnap.id, item.nome, item.qtd)
        })
    } catch (error) {
        console.error(error)
        listaEstoque.innerHTML = "<p style='text-align: center; color: red;'>Erro ao carregar estoque.</p>"
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
            try {
                await deleteDoc(doc(db, "estoque", itemId))
                divItem.remove()

                if (listaEstoque.children.length === 0) {
                    listaEstoque.innerHTML = "<p style='text-align: center;' id='msg-vazio'>Estoque vazio.</p>"
                }
            } catch (error) {
                alert("Erro ao remover item.")
                e.target.disabled = false
            }
        }
    })
}

btnAdicionar.addEventListener("click", async () => {
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
        const docRef = await addDoc(collection(db, "estoque"), {
            nome: nome,
            qtd: qtd
        })

        renderItemDOM(docRef.id, nome, qtd)

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
    const inputs = document.querySelectorAll(".estoque-input")
    let temZero = false

    inputs.forEach(input => {
        if (Number(input.value) <= 0) temZero = true
    })

    if (temZero) {
        alert("Não é possível salvar itens com 0 unidades. Use o botão 'X' para remover o item se ele acabou.")
        return
    }

    btnSalvar.disabled = true
    const textoOriginal = btnSalvar.innerText
    btnSalvar.innerText = "SALVANDO..."

    try {
        const promessas = []

        inputs.forEach(input => {
            const id = input.getAttribute("data-id")
            const novaQtd = Number(input.value)
            const docRef = doc(db, "estoque", id)
            promessas.push(updateDoc(docRef, { qtd: novaQtd }))
        })

        await Promise.all(promessas)
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