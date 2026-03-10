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

    let entradaTotal = { empresa: 0, pessoal: 0 }
    let saidaTotal = { empresa: 0, pessoal: 0 }
    
    let entradaMes = { empresa: 0, pessoal: 0 }
    let saidaMes = { empresa: 0, pessoal: 0 }

    const hoje = new Date()
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0')
    const anoAtual = String(hoje.getFullYear())
    const prefixoMesAtual = `${anoAtual}-${mesAtual}`

    if (docRead.exists()) {
        const data = docRead.data()

        if (data.valoresTotais) {
            if (data.valoresTotais.entradas) {
                entradaTotal.empresa = data.valoresTotais.entradas.empresa || 0
                entradaTotal.pessoal = data.valoresTotais.entradas.pessoal || 0
            }
            if (data.valoresTotais.saidas) {
                saidaTotal.empresa = data.valoresTotais.saidas.empresa || 0
                saidaTotal.pessoal = data.valoresTotais.saidas.pessoal || 0
            }
        }

        const listaEntradas = data.entradas || []
        listaEntradas.forEach(item => {
            if (item.date && item.date.startsWith(prefixoMesAtual)) {
                if (item.type === "empresa") entradaMes.empresa += Number(item.value)
                if (item.type === "pessoal") entradaMes.pessoal += Number(item.value)
            }
        })

        const listaSaidas = data.saidas || []
        listaSaidas.forEach(item => {
            if (item.date && item.date.startsWith(prefixoMesAtual)) {
                if (item.type === "empresa") saidaMes.empresa += Number(item.value)
                if (item.type === "pessoal") saidaMes.pessoal += Number(item.value)
            }
        })
    }

    const calcSaldoPessoal = entradaTotal.pessoal - saidaTotal.pessoal
    const calcSaldoEmpresa = entradaTotal.empresa - saidaTotal.empresa
    const calcSaldoTotal = calcSaldoPessoal + calcSaldoEmpresa

    const formatar = (valor) => valor.toFixed(2).replace('.', ',')

    totalSaldo.textContent = formatar(calcSaldoTotal)
    saldoPessoal.textContent = formatar(calcSaldoPessoal)
    saldoEmpresa.textContent = formatar(calcSaldoEmpresa)

    totalEntradas.textContent = formatar(entradaMes.empresa + entradaMes.pessoal)
    entradaPessoal.textContent = formatar(entradaMes.pessoal)
    entradaEmpresa.textContent = formatar(entradaMes.empresa)

    totalDespesas.textContent = formatar(saidaMes.empresa + saidaMes.pessoal)
    despesaPessoal.textContent = formatar(saidaMes.pessoal)
    despesaEmpresa.textContent = formatar(saidaMes.empresa)
}

main()