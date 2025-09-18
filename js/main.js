import { initModals } from './components/modal.js';
import { initAuth } from './modules/auth.js';
import { initJogadores, setJogadoresUserRole } from './modules/jogadores.js';
import { initEventos, setEventosUserRole } from './modules/eventos.js';
import { initAdmin, setAdminVisibility } from './modules/admin.js';
import { initPainelJogo } from './modules/painelJogo.js';

let currentUser = null;
let currentUserProfile = null;

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
    currentUser = user;
    currentUserProfile = userProfile;
    const role = userProfile ? userProfile.role : null;
    updateGlobalUI(true, userProfile);
    setJogadoresUserRole(role);
    setEventosUserRole(role);
    // Não chamamos setAdminVisibility aqui para não carregar os dados sem necessidade
}

function onUserLogout() {
    currentUser = null;
    currentUserProfile = null;
    updateGlobalUI(false);
    setJogadoresUserRole(null);
    setEventosUserRole(null);
    setAdminVisibility(false, null);
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
            // Apenas carregamos os dados de admin quando o botão é clicado
            if (currentUser && currentUserProfile.role === 'admin') {
                setAdminVisibility(true, currentUser.uid);
            }
            switchTab('admin');
        });
    }

    switchTab('ultimas-noticias');
    
    // --- REGISTO DO SERVICE WORKER ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // CORREÇÃO: O caminho deve ser relativo para funcionar no GitHub Pages
            navigator.serviceWorker.register('sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    console.log("Aplicação ANCB-MT inicializada com sucesso!");
}

main();

