// js/main.js

import { initModals } from './components/modal.js';
import { initAuth } from './modules/auth.js';
import { initJogadores, setJogadoresUserRole } from './modules/jogadores.js';
import { initEventos, setEventosUserRole } from './modules/eventos.js';
import { initAdmin, setAdminVisibility } from './modules/admin.js';
import { initPainelJogo } from './modules/painelJogo.js';
import { auth } from './services/firebase.js';

const navTabs = document.querySelector('.nav-tabs');
const tabContents = document.querySelectorAll('.tab-content');
const adminElements = document.querySelectorAll('.admin-only');
const welcomeMessage = document.getElementById('welcome-message');

function updateGlobalUI(isLoggedIn, userProfile = null) {
    const loggedInElements = document.querySelectorAll('.logged-in-only');
    const loggedOutElements = document.querySelectorAll('.logged-out-only');
    const userRole = userProfile ? userProfile.role : null;
    
    if (isLoggedIn) {
        loggedInElements.forEach(el => el.style.display = 'flex');
        loggedOutElements.forEach(el => el.style.display = 'none');
        welcomeMessage.textContent = `Bem vindo(a) ${userProfile.nome} (${userProfile.apelido})`;
    } else {
        loggedInElements.forEach(el => el.style.display = 'none');
        loggedOutElements.forEach(el => el.style.display = 'flex');
        welcomeMessage.textContent = '';
    }

    if (userRole === 'admin') {
        adminElements.forEach(el => el.style.display = el.matches('.nav-tab, .btn') ? 'inline-flex' : 'block');
    } else {
        adminElements.forEach(el => el.style.display = 'none');
    }
}

function onUserLogin(user, userProfile) {
    const role = userProfile ? userProfile.role : null;
    updateGlobalUI(true, userProfile);
    setJogadoresUserRole(role);
    setEventosUserRole(role);
    // A visibilidade do admin agora é tratada principalmente pelo clique no botão.
    // Podemos manter esta linha para pré-carregar os dados se quisermos.
    setAdminVisibility(role === 'admin');
}

function onUserLogout() {
    updateGlobalUI(false);
    setJogadoresUserRole(null);
    setEventosUserRole(null);
    setAdminVisibility(false);
    switchTab('ultimas-noticias');
}

function switchTab(targetTabName) {
    navTabs.querySelector('.active')?.classList.remove('active');
    tabContents.forEach(content => content.classList.remove('active'));
    
    const navTabItem = navTabs.querySelector(`[data-tab="${targetTabName}"]`);
    if (navTabItem) {
        navTabItem.classList.add('active');
    }
    
    const tabContentItem = document.getElementById(`tab-${targetTabName}`);
    if (tabContentItem) {
        tabContentItem.classList.add('active');
    }
}

function handleTabClick(e) {
    if (e.target.classList.contains('nav-tab')) {
        const targetTab = e.target.dataset.tab;
        switchTab(targetTab);
    }
}

function main() {
    initModals();
    initAuth(onUserLogin, onUserLogout);
    initJogadores();
    initEventos();
    initAdmin();
    initPainelJogo();
    navTabs.addEventListener('click', handleTabClick);

    const btnManageUsers = document.getElementById('btn-manage-users');
    if (btnManageUsers) {
        btnManageUsers.addEventListener('click', () => {
            // Primeiro, ativa a visibilidade e o carregamento dos dados
            setAdminVisibility(true);
            // Depois, muda para a aba
            switchTab('admin');
        });
    }

    switchTab('ultimas-noticias');
    
    console.log("Aplicação ANCB-MT inicializada com sucesso!");
}

main();

