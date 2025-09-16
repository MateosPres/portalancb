// js/main.js (VERSÃO CORRIGIDA E COMPLETA)

import { initModals } from './components/modal.js';
import { initAuth } from './modules/auth.js';
import { initJogadores, setJogadoresUserRole } from './modules/jogadores.js';
import { initCampeonatos, setCampeonatosUserRole } from './modules/campeonatos.js';
import { initAdmin, setAdminVisibility } from './modules/admin.js';
import { initPainelJogo } from './modules/painelJogo.js';

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
    setCampeonatosUserRole(role);
    setAdminVisibility(role === 'admin', user.uid);
}

function onUserLogout() {
    updateGlobalUI(false);
    setJogadoresUserRole(null);
    setCampeonatosUserRole(null);
    setAdminVisibility(false, null);
    switchTab('ultimas-noticias'); // MUDANÇA AQUI
}

function switchTab(targetTabName) {
    navTabs.querySelector('.active')?.classList.remove('active');
    tabContents.forEach(content => content.classList.remove('active'));
    
    const navTabsItem = navTabs.querySelector(`[data-tab="${targetTabName}"]`);
    if (navTabsItem) {
        navTabsItem.classList.add('active');
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

// ÚNICA DECLARAÇÃO DA FUNÇÃO 'main'
function main() {
    initModals();
    initAuth(onUserLogin, onUserLogout);
    initJogadores();
    initCampeonatos();
    initAdmin();
    initPainelJogo();
    navTabs.addEventListener('click', handleTabClick);

    const btnManageUsers = document.getElementById('btn-manage-users');
    if (btnManageUsers) {
        btnManageUsers.addEventListener('click', () => {
            switchTab('admin');
        });
    }

    switchTab('ultimas-noticias'); // MUDANÇA AQUI
    
    console.log("Aplicação ANCB-MT inicializada com sucesso!");
}

// ÚNICA CHAMADA DA FUNÇÃO 'main'
main();