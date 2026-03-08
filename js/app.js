import { db, setDoc, doc, getDoc } from "https://mglima1279.github.io/mSys/js/config.js"

const totalSaldo = document.getElementById("total-saldo")
const saldoPessoal = document.getElementById("saldo-pessoal")
const saldoEmpresa = document.getElementById("saldo-empresa")

const totalEntradas = document.getElementById("total-entradas")
const entradaPessoal = document.getElementById("entrada-pessoal")
const entradaEmpresa = document.getElementById("entrada-empresa")

const totalDespesas = document.getElementById("total-despesas")
const despesaPessoal = document.getElementById("despesa-pessoal")
const despesaEmpresa = document.getElementById("despesa-empresa")

async function fetchTotalData(tipo) {
    const docRef = doc(db, `valores-totais/${tipo}`)
    const docRead = await getDoc(docRef)

    if (docRead.exists()) {
        const data = docRead.data()
        return {
            empresa: data.empresa || 0,
            pessoal: data.pessoal || 0
        }
    }

    const defaultInfo = { empresa: 0, pessoal: 0 }
    await setDoc(docRef, defaultInfo)

    return defaultInfo
}

async function main() {
    const entrada = await fetchTotalData("entrada")
    const saida = await fetchTotalData("saida")

    const calcSaldoPessoal = entrada.pessoal - saida.pessoal
    const calcSaldoEmpresa = entrada.empresa - saida.empresa
    const calcSaldoTotal = calcSaldoPessoal + calcSaldoEmpresa

    totalSaldo.textContent = calcSaldoTotal.toFixed(2)
    saldoPessoal.textContent = calcSaldoPessoal.toFixed(2)
    saldoEmpresa.textContent = calcSaldoEmpresa.toFixed(2)

    totalEntradas.textContent = (entrada.empresa + entrada.pessoal).toFixed(2)
    entradaPessoal.textContent = entrada.pessoal.toFixed(2)
    entradaEmpresa.textContent = entrada.empresa.toFixed(2)

    totalDespesas.textContent = (saida.empresa + saida.pessoal).toFixed(2)
    despesaPessoal.textContent = saida.pessoal.toFixed(2)
    despesaEmpresa.textContent = saida.empresa.toFixed(2)
}

main()