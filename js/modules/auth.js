// js/modules/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { auth, db } from '../services/firebase.js';
import { closeAllModals } from '../components/modal.js';

const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

function showAuthModal(type) {
    loginError.style.display = 'none';
    registerError.style.display = 'none';
    registerContainer.classList.remove('active');
    loginContainer.classList.remove('active');
    if (type === 'login') {
        loginContainer.classList.add('active');
    } else {
        registerContainer.classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginForm.reset();
        closeAllModals();
    } catch (error) {
        loginError.textContent = "Email ou senha inválidos.";
        loginError.style.display = 'block';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    registerError.style.display = 'none';
    const nome = registerForm['register-nome'].value;
    const apelido = registerForm['register-apelido'].value;
    const nascimento = registerForm['register-nascimento'].value;
    const email = registerForm['register-email'].value;
    const password = registerForm['register-password'].value;
    const passwordConfirm = registerForm['register-password-confirm'].value;

    if (password !== passwordConfirm) {
        registerError.textContent = "As senhas não conferem.";
        registerError.style.display = 'block';
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "usuarios", userCredential.user.uid), { nome, apelido, dataNascimento: nascimento, email, role: "jogador", status: "active" });
        await signOut(auth);
        alert('Cadastro realizado com sucesso! Por favor, faça o login.');
        registerForm.reset();
        showAuthModal('login');
    } catch (error) {
        let msg = "Ocorreu um erro.";
        if (error.code === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
        else if (error.code === 'auth/weak-password') msg = "A senha é muito fraca.";
        registerError.textContent = msg;
        registerError.style.display = 'block';
    }
}

export function initAuth(onLogin, onLogout) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const docSnap = await getDoc(doc(db, "usuarios", user.uid));
            const userProfile = docSnap.exists() ? docSnap.data() : null;

            if (userProfile && userProfile.status === 'banned') {
                signOut(auth);
                return;
            }
            onLogin(user, userProfile);
        } else {
            onLogout();
        }
    });

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));
    document.getElementById('btn-show-login').addEventListener('click', () => showAuthModal('login'));
    document.getElementById('btn-show-register').addEventListener('click', () => showAuthModal('register'));
    document.getElementById('toggle-to-register').addEventListener('click', () => showAuthModal('register'));
    document.getElementById('toggle-to-login').addEventListener('click', () => showAuthModal('login'));
}