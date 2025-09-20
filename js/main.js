// js/main.js (VERSÃO FINAL CENTRALIZADA)

import { initModals, closeModal } from './components/modal.js';
import { db } from './services/firebase.js';
import { initAuth } from './modules/auth.js';
import { initJogadores, showJogadorModal, showFichaJogador, deleteJogador, setJogadoresUserRole } from './modules/jogadores.js';
import { eventos, initEventos, showEventoModal, showFichaEvento, deleteEvento, updateEventStatus, setEventosUserRole, showFichaJogoDetalhes, showFichaTime, deleteJogo, showJogoModal } from './modules/eventos.js';
import { initAdmin, handleTableClick as handleAdminActions, setAdminVisibility } from './modules/admin.js';
import { initPainelJogo, abrirPainelJogo } from './modules/painelJogo.js';
import { initHome } from './modules/home.js';
import { initRanking } from './modules/ranking.js'; // <-- ADICIONE ESTA LINHA
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";



let currentUser = null;
let currentUserProfile = null;

const appContainer = document.getElementById('app-container');
const welcomeMessage = document.getElementById('welcome-message');

export function navigateTo(page) {
    const template = document.getElementById(`template-${page}`);
    if (template) {
        appContainer.innerHTML = template.innerHTML;
        const event = new CustomEvent('page-loaded', { detail: { page: page } });
        document.body.dispatchEvent(event);
    } else {
        console.error(`Template para a página "${page}" não encontrado.`);
        appContainer.innerHTML = `<p>Erro: Página não encontrada.</p>`;
    }
}

// Listener ÚNICO e CENTRALIZADO para TODAS as ações de clique
async function handleGlobalClick(e) {
    const target = e.target;

    // --- 1. LÓGICA DE FECHAR MODAL (Maior Prioridade) ---
    const closeButton = target.closest('.close-button');
    if (closeButton) {
        const modalToClose = closeButton.closest('.modal, .auth-container');
        if (modalToClose) closeModal(modalToClose);
        return;
    }

    // --- 2. LÓGICA PARA CLIQUES DENTRO DO MODAL DE EVENTO ---
    const modalVerEvento = target.closest('#modal-ver-campeonato');
    if (modalVerEvento) {
        // Ações específicas dos botões (Editar, Excluir, Painel)
        const btnEditExterno = target.closest('.btn-edit-jogo-view');
        if (btnEditExterno) {
            const { eventoId, jogoId } = btnEditExterno.dataset;
            closeModal(modalVerEvento);
            showJogoModal(eventoId, jogoId);
            return;
        }

        const btnDeleteExterno = target.closest('.btn-delete-jogo-view');
        if (btnDeleteExterno) {
            const { eventoId, jogoId } = btnDeleteExterno.dataset;
            deleteJogo(eventoId, jogoId);
            return;
        }

        const btnPainelExterno = target.closest('.btn-painel-jogo-view');
        if (btnPainelExterno) {
            const { eventoId, jogoId } = btnPainelExterno.dataset;
            const role = currentUserProfile ? currentUserProfile.role : null;
            const evento = eventos.find(c => c.id === eventoId);
            const jogoRef = doc(db, "eventos", eventoId, "jogos", jogoId);
            const jogoDoc = await getDoc(jogoRef);
            if (jogoDoc.exists()) {
                abrirPainelJogo(role, evento, { id: jogoDoc.id, ...jogoDoc.data() });
            }
            return;
        }
        
        const btnDeleteJogoInterno = target.closest('.btn-delete-jogo-interno');
        if (btnDeleteJogoInterno) {
            const { eventoId, jogoId } = btnDeleteJogoInterno.dataset;
            deleteJogo(eventoId, jogoId);
            return;
        }

        // Cliques em itens de lista (Times, Jogos)
        const timeCard = target.closest('#times-container-view .clickable');
        if (timeCard) {
            const { timeId, eventoId } = timeCard.dataset;
            if (timeId && eventoId) showFichaTime(eventoId, timeId);
            return;
        }

        const jogoInternoCard = target.closest('#jogos-internos-container .clickable');
        if (jogoInternoCard) {
            const { eventoId, jogoId } = jogoInternoCard.dataset;
            const evento = eventos.find(ev => ev.id === eventoId);
            const jogoRef = doc(db, "eventos", eventoId, "jogos", jogoId);
            const jogoDoc = await getDoc(jogoRef);
            if (evento && jogoDoc.exists()) {
                const jogo = { id: jogoDoc.id, ...jogoDoc.data() };
                const role = currentUserProfile ? currentUserProfile.role : null;
                abrirPainelJogo(role, evento, jogo);
            }
            return;
        }
        
        const itemJogoExterno = target.closest('#jogos-realizados-container .clickable');
        if (itemJogoExterno) {
            const { eventoId, jogoId } = itemJogoExterno.dataset;
            if (eventoId && jogoId) showFichaJogoDetalhes(eventoId, jogoId);
            return;
        }
    }

    // --- 3. LÓGICA DE NAVEGAÇÃO E AÇÕES GLOBAIS ---
    const card = target.closest('.player-card, .championship-card');
    if (card && card.closest('#grid-jogadores, #grid-eventos-andamento, #grid-eventos-proximos, #grid-eventos-finalizados')) {
        if (card.classList.contains('player-card')) {
            const id = card.dataset.id;
            if (target.closest('.btn-edit-jogador')) showJogadorModal(id);
            else if (target.closest('.btn-delete-jogador')) deleteJogador(id);
            else showFichaJogador(id);
        } else if (card.classList.contains('championship-card')) {
            const id = card.dataset.id;
            if (target.dataset.action === 'start') updateEventStatus(id, 'andamento');
            else if (target.dataset.action === 'finish') updateEventStatus(id, 'finalizado');
            else if (target.closest('.btn-edit-camp')) showEventoModal(id);
            else if (target.closest('.btn-delete-camp')) deleteEvento(id);
            else showFichaEvento(id);
        }
        return;
    }

    if (target.id === 'btn-abrir-modal-jogador') {
        showJogadorModal();
        return;
    }
    if (target.id === 'btn-abrir-modal-evento') {
        showEventoModal();
        return;
    }

    if (target.closest('#admin-users-table')) {
        handleAdminActions(e);
        return;
    }

    const navCard = target.closest('.nav-card');
    if (navCard) {
        const page = navCard.getAttribute('data-target');
        if (page) navigateTo(page);
        return;
    }

    const eventoCardHome = target.closest('.ongoing-event-card');
    if (eventoCardHome) {
        const eventoId = eventoCardHome.dataset.id;
        if (eventoId) showFichaEvento(eventoId);
        return;
    }

    const backButton = target.closest('.btn-back-home');
    if (backButton) {
        navigateTo('home');
        return;
    }

    const btnManageUsers = target.closest('#btn-manage-users');
    if (btnManageUsers) {
        navigateTo('admin');
        if (currentUser && currentUserProfile.role === 'admin') {
            setAdminVisibility(true, currentUser.uid);
        }
        return;
    }

    const homeLink = target.closest('.header-left');
    if (homeLink) {
        navigateTo('home');
        return;
    }
}

function updateGlobalUI(isLoggedIn, userProfile = null) {
    // ... (esta função permanece a mesma)
    const loggedInElements = document.querySelectorAll('.logged-in-only');
    const loggedOutElements = document.querySelectorAll('.logged-out-only');
    const adminElements = document.querySelectorAll('.admin-only');
    const userRole = userProfile ? userProfile.role : null;
    
    if (isLoggedIn) {
        loggedInElements.forEach(el => el.style.display = 'flex');
        loggedOutElements.forEach(el => el.style.display = 'none');
        welcomeMessage.textContent = `Bem-vindo(a) ${userProfile.nome} (${userProfile.apelido})`;
    } else {
        loggedInElements.forEach(el => el.style.display = 'none');
        loggedOutElements.forEach(el => el.style.display = 'flex');
        welcomeMessage.textContent = '';
    }

    if (userRole === 'admin') {
        adminElements.forEach(el => el.style.display = el.matches('.btn') ? 'inline-flex' : 'block');
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
}

function onUserLogout() {
    currentUser = null;
    currentUserProfile = null;
    updateGlobalUI(false);
    setJogadoresUserRole(null);
    setEventosUserRole(null);
    setAdminVisibility(false, null);
    navigateTo('home');
}

function main() {
    initModals();
    initAuth(onUserLogin, onUserLogout);
    initJogadores();
    initEventos();
    initAdmin();
    initPainelJogo();
    initHome();
    initRanking();


    // Adiciona o ÚNICO listener de clique global
    document.body.addEventListener('click', handleGlobalClick);

     // Re-aplica as regras de visibilidade sempre que uma nova página é carregada.
    // Isso garante que os botões de admin, etc., apareçam corretamente ao navegar
    // ou recarregar a página.
    document.body.addEventListener('page-loaded', () => {
        updateGlobalUI(!!currentUser, currentUserProfile);
    });

    navigateTo('home');
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
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