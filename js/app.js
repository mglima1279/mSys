import { db, doc, getDoc } from "./config.js"

const totalSaldo = document.getElementById("total-saldo")
const saldoPessoal = document.getElementById("saldo-pessoal")
const saldoEmpresa = document.getElementById("saldo-empresa")

const totalEntradas = document.getElementById("total-entradas")
const entradaPessoal = document.getElementById("entrada-pessoal")
const entradaEmpresa = document.getElementById("entrada-empresa")

const totalDespesas = document.getElementById("total-despesas")
const despesaPessoal = document.getElementById("despesa-pessoal")
const despesaEmpresa = document.getElementById("despesa-empresa")

async function main() {
    const uid = JSON.parse(localStorage.getItem("uid"))

    if (!uid) {
        window.location.href = "login/"
        return
    }

    const docRef = doc(db, `users/${uid}`)
    const docRead = await getDoc(docRef)

    let entrada = { empresa: 0, pessoal: 0 }
    let saida = { empresa: 0, pessoal: 0 }

    if (docRead.exists()) {
        const data = docRead.data()
        
        if (data.valoresTotais) {
            if (data.valoresTotais.entradas) {
                entrada.empresa = data.valoresTotais.entradas.empresa || 0
                entrada.pessoal = data.valoresTotais.entradas.pessoal || 0
            }
            if (data.valoresTotais.saidas) {
                saida.empresa = data.valoresTotais.saidas.empresa || 0
                saida.pessoal = data.valoresTotais.saidas.pessoal || 0
            }
        }
    } else {
        console.warn("Documento do usuário não encontrado. Os saldos serão zerados.")
    }

    const calcSaldoPessoal = entrada.pessoal - saida.pessoal
    const calcSaldoEmpresa = entrada.empresa - saida.empresa
    const calcSaldoTotal = calcSaldoPessoal + calcSaldoEmpresa

    const formatar = (valor) => valor.toFixed(2).replace('.', ',')

    totalSaldo.textContent = formatar(calcSaldoTotal)
    saldoPessoal.textContent = formatar(calcSaldoPessoal)
    saldoEmpresa.textContent = formatar(calcSaldoEmpresa)

    totalEntradas.textContent = formatar(entrada.empresa + entrada.pessoal)
    entradaPessoal.textContent = formatar(entrada.pessoal)
    entradaEmpresa.textContent = formatar(entrada.empresa)

    totalDespesas.textContent = formatar(saida.empresa + saida.pessoal)
    despesaPessoal.textContent = formatar(saida.pessoal)
    despesaEmpresa.textContent = formatar(saida.empresa)
}

main()