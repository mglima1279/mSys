import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, doc, setDoc, getDoc, arrayUnion } from "./config.js" //"https://mglima1279.github.io/mSys/js/config.js"

const toggleMode = document.getElementById('toggle-mode')
const authTitle = document.getElementById('auth-title')
const btnAuth = document.getElementById('btn-auth')
const authQuestion = document.getElementById('auth-question')
const form = document.querySelector("form")

let isLoginMode = true

toggleMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode

    if (isLoginMode) {
        authTitle.textContent = 'Entrar no Sistema'
        btnAuth.textContent = 'ENTRAR'
        authQuestion.textContent = 'Não tem uma conta?'
        toggleMode.textContent = 'Cadastre-se'
    } else {
        authTitle.textContent = 'Criar Nova Conta'
        btnAuth.textContent = 'CADASTRAR'
        authQuestion.textContent = 'Já possui uma conta?'
        toggleMode.textContent = 'Faça Login'
    }
})

const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    // Verifica o tipo atual e inverte
    const isPassword = passwordInput.getAttribute('type') === 'password';

    if (isPassword) {
        passwordInput.setAttribute('type', 'text');
        togglePassword.textContent = 'ESCONDER'; // Muda o emoji para o macaquinho/olho fechado
    } else {
        passwordInput.setAttribute('type', 'password');
        togglePassword.textContent = 'MOSTRAR'; // Volta para o olho aberto
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault()

    btnAuth.disabled = true

    const data = new FormData(e.target)

    const info = {
        email: data.get("email"),
        password: data.get("password")
    }

    if (isLoginMode) {
        try {
            const userCred = await signInWithEmailAndPassword(auth, info.email, info.password)
            const uid = userCred.user.uid

            const docRef = doc(db, `users/${uid}`)
            try {
                const docRead = await getDoc(docRef)

                if (docRead.exists()) {
                    localSaveUser(uid)
                } else {
                    alert("Usuário não encontrado")
                }
            }
            catch (err) {
                console.error("Erro ao buscar documento: ", err)
            }
        }
        catch (err) {
            console.error("Erro no login:", err)
            alert("Não foi possível fazer o login")
        }

        btnAuth.disabled = false
        return
    }
    //else

    try {
        const userCred = await createUserWithEmailAndPassword(auth, info.email, info.password)

        const uid = userCred.user.uid

        const model = {
            entradas: [],
            saidas: [],
            valoresTotais: {
                entradas: {
                    empresa: 0,
                    pessoal: 0
                },
                saidas: {
                    empresa: 0,
                    pessoal: 0
                },

            }
        }

        const docRef = doc(db, `users/${uid}`)
        await setDoc(docRef, model)

        localSaveUser(uid)
    }
    catch (err) {
        console.error("Erro no cadastro:", err)

        if (err.code === 'auth/email-already-in-use') {
            alert('Email já cadastrado')
        } else if (err.code === 'auth/weak-password') {
            alert('A senha deve ter pelo menos 6 caracteres')
        } else {
            alert('Não foi possível criar o usuário')
        }
    }
    btnAuth.disabled = false
})

function localSaveUser(id) {
    form.reset()
    alert("Cadastro concluído com sucesso")
    id = JSON.stringify(id)
    localStorage.setItem("uid", id)
    window.location.href = "../"
}

function checkUser() {
    const tempUserData = localStorage.getItem("uid")
    if (tempUserData) {
        if (confirm(`Você já está cadastrado!! Deseja sair de sua conta???`)) {
            localStorage.removeItem("uid")
        } else {
            window.location.href = "../"
        }
    }
}

checkUser()
