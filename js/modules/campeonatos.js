// js/modules/campeonatos.js (VERSÃO FINAL E ESTÁVEL)

import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, addDoc, getDocs, getDoc, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
import { openModal, closeModal } from '../components/modal.js';
import { getJogadores } from './jogadores.js';
import { abrirPainelJogo } from './painelJogo.js';

let campeonatos = [];
let userRole = null;

// --- Elementos do DOM ---
const gridCampeonatos = document.getElementById('grid-campeonatos');
const loaderCampeonatos = document.querySelector('#tab-campeonatos .grid-loader');
const modalCampeonato = document.getElementById('modal-campeonato');
const modalVerCampeonato = document.getElementById('modal-ver-campeonato');
const formCampeonato = document.getElementById('form-campeonato');
const modalJogo = document.getElementById('modal-jogo');
const formJogo = document.getElementById('form-jogo');

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

// --- RENDERIZAÇÃO PRINCIPAL ---
// Em js/modules/campeonatos.js

function render() {
    loaderCampeonatos.style.display = 'none';   // esconde o loader
    gridCampeonatos.innerHTML = ''; // Limpa o conteúdo (inclusive o spinner)

    if (campeonatos.length === 0) {
        gridCampeonatos.innerHTML = '<p>Nenhum campeonato encontrado.</p>';
        return;
    }

    campeonatos.forEach(c => {
        const card = document.createElement('div');
        const isAdmin = userRole === 'admin';
        card.className = `championship-card card ${isAdmin ? 'admin-view' : ''}`;
        card.dataset.id = c.id;
        const actionsHTML = isAdmin ? `<div class="card-actions"><button class="btn-edit-camp" title="Editar">✏️</button><button class="btn-delete-camp" title="Excluir">🗑️</button></div>` : '';
        
        card.innerHTML = `
            ${actionsHTML}
            <div>
                <span class="championship-type-badge">${c.tipo || '5x5'}</span>
                <h3 class="championship-name">${c.nome}</h3>
                <div class="championship-info">
                    <p>📅 <strong>Data:</strong> ${formatDate(c.data)}</p>
                    <p>👥 <strong>Jogadores:</strong> ${c.jogadoresEscalados?.length || 0} escalado(s)</p>
                </div>
            </div>`;
        gridCampeonatos.appendChild(card);
    });
}

// --- LÓGICA DE CAMPEONATOS ---

async function showCampeonatoModal(id = null) {
    if (userRole !== 'admin') return;
    formCampeonato.reset();
    formCampeonato['campeonato-id'].value = id || '';
    document.getElementById('secao-gerenciar-jogos').style.display = 'none';
    let escalados = [];

    if (id) {
        const c = campeonatos.find(i => i.id === id);
        if (!c) return;
        document.getElementById('modal-campeonato-titulo').innerText = 'Editar Campeonato';
        formCampeonato['campeonato-nome'].value = c.nome;
        formCampeonato['campeonato-data'].value = c.data;
        formCampeonato['campeonato-tipo'].value = c.tipo || '5x5';
        escalados = c.jogadoresEscalados || [];
        
        document.getElementById('secao-gerenciar-jogos').style.display = 'block';
        document.getElementById('btn-adicionar-jogo').onclick = () => showJogoModal(id);
        renderJogosList(id);

    } else {
        document.getElementById('modal-campeonato-titulo').innerText = 'Adicionar Novo Campeonato';
    }

    const listaContainer = document.getElementById('lista-jogadores-escalar');
    listaContainer.innerHTML = '';
    const todosJogadores = getJogadores();
    todosJogadores.forEach(j => {
        const checked = escalados.includes(j.id) ? 'checked' : '';
        listaContainer.innerHTML += `<label class="checkbox-item"><input type="checkbox" value="${j.id}" ${checked}><span>${j.nome} (#${j.numero_uniforme})</span></label>`;
    });

    openModal(modalCampeonato);
}

async function handleFormSubmitCampeonato(e) {
    e.preventDefault();
    if (userRole !== 'admin') return;
    const id = formCampeonato['campeonato-id'].value;
    const jogadoresEscalados = Array.from(document.querySelectorAll('#lista-jogadores-escalar input:checked')).map(input => input.value);
    const dados = {
        nome: formCampeonato['campeonato-nome'].value,
        data: formCampeonato['campeonato-data'].value,
        tipo: formCampeonato['campeonato-tipo'].value,
        jogadoresEscalados: jogadoresEscalados
    };
    try {
        if (id) {
            await updateDoc(doc(db, "campeonatos", id), dados);
        } else {
            await addDoc(collection(db, "campeonatos"), dados);
        }
        closeModal(modalCampeonato);
    } catch (error) {
        console.error("Erro ao salvar campeonato: ", error);
        alert("Não foi possível salvar o campeonato.");
    }
}

async function deleteCampeonato(id) {
    if (userRole !== 'admin') return;
    if (confirm('Tem certeza que deseja excluir este campeonato e TODOS os seus jogos? Esta ação é irreversível.')) {
        try {
            await deleteDoc(doc(db, "campeonatos", id));
            closeModal(modalVerCampeonato);
        } catch (error) {
            alert("Não foi possível excluir o campeonato.");
        }
    }
}

// --- LÓGICA DE JOGOS ---

async function renderJogosList(campeonatoId) {
    const listaJogosContainer = document.getElementById('lista-de-jogos');
    listaJogosContainer.innerHTML = 'Carregando jogos...';
    
    const campeonato = campeonatos.find(c => c.id === campeonatoId);
    if (!campeonato) return;

    const jogosRef = collection(db, "campeonatos", campeonatoId, "jogos");
    const q = query(jogosRef, orderBy("dataJogo", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        listaJogosContainer.innerHTML = '<p>Nenhum jogo adicionado ainda.</p>';
        return;
    }

    listaJogosContainer.innerHTML = '';
    snapshot.forEach(doc => {
        const jogo = { id: doc.id, ...doc.data() };
        const item = document.createElement('div');
        item.className = 'game-list-item';
        item.innerHTML = `
            <span>vs <strong>${jogo.adversario}</strong> (${formatDate(jogo.dataJogo)})</span>
            <div class="game-item-actions">
                <button class="btn-painel-jogo btn-sm" title="Abrir Painel do Jogo">📊</button>
                <button class="btn-edit-jogo btn-sm" title="Editar Jogo">✏️</button>
                <button class="btn-delete-jogo btn-sm" title="Excluir Jogo">🗑️</button>
            </div>
        `;
        item.querySelector('.btn-painel-jogo').addEventListener('click', () => abrirPainelJogo(campeonato, jogo.id, jogo.adversario));
        item.querySelector('.btn-edit-jogo').addEventListener('click', () => showJogoModal(campeonatoId, jogo.id));
        item.querySelector('.btn-delete-jogo').addEventListener('click', () => deleteJogo(campeonatoId, jogo.id));
        listaJogosContainer.appendChild(item);
    });
}

async function showJogoModal(campeonatoId, jogoId = null) {
    formJogo.reset();
    formJogo['jogo-campeonato-id'].value = campeonatoId;
    formJogo['jogo-id'].value = jogoId || '';
    
    if (jogoId) {
        document.getElementById('modal-jogo-titulo').innerText = 'Editar Jogo';
        const jogoRef = doc(db, "campeonatos", campeonatoId, "jogos", jogoId);
        const jogoDoc = await getDoc(jogoRef);
        if (jogoDoc.exists()) {
            const jogo = jogoDoc.data();
            formJogo['jogo-data'].value = jogo.dataJogo;
            formJogo['jogo-adversario'].value = jogo.adversario;
        }
    } else {
        document.getElementById('modal-jogo-titulo').innerText = 'Adicionar Jogo';
    }
    openModal(modalJogo);
}

async function handleFormSubmitJogo(e) {
    e.preventDefault();
    if (userRole !== 'admin') return;

    const campeonatoId = formJogo['jogo-campeonato-id'].value;
    const jogoId = formJogo['jogo-id'].value;
    const campeonato = campeonatos.find(c => c.id === campeonatoId);

    const loadingOverlay = modalJogo.querySelector('.loading-overlay');
    loadingOverlay.classList.add('active');

    const adversarioNome = formJogo['jogo-adversario'].value;
    let dadosJogo = {
        dataJogo: formJogo['jogo-data'].value,
        adversario: adversarioNome,
    };
    
    try {
        if (jogoId) {
            const jogoRef = doc(db, "campeonatos", campeonatoId, "jogos", jogoId);
            await updateDoc(jogoRef, dadosJogo);
            closeModal(modalJogo);
            showFichaCampeonato(campeonatoId);
        } else {
            dadosJogo.placarANCB_final = 0;
            dadosJogo.placarAdversario_final = 0;
            const jogoRef = await addDoc(collection(db, "campeonatos", campeonatoId, "jogos"), dadosJogo);
            const effectiveJogoId = jogoRef.id;
            
            closeModal(modalJogo);
            closeModal(modalVerCampeonato);

            setTimeout(() => {
                abrirPainelJogo(campeonato, effectiveJogoId, adversarioNome);
            }, 300);
        }
    } catch (error) {
        console.error("Erro ao salvar jogo: ", error);
        alert("Não foi possível salvar os dados do jogo.");
    } finally {
        loadingOverlay.classList.remove('active');
    }
}

async function deleteJogo(campeonatoId, jogoId) {
    if (userRole !== 'admin') return;
    if (confirm('Tem certeza que deseja excluir este jogo?')) {
        try {
            await deleteDoc(doc(db, "campeonatos", campeonatoId, "jogos", jogoId));
            if (modalVerCampeonato.classList.contains('active')) {
                showFichaCampeonato(campeonatoId);
            }
            if (modalCampeonato.classList.contains('active')) {
                renderJogosList(campeonatoId);
            }
        } catch (error) {
            alert("Não foi possível excluir o jogo.");
        }
    }
}

// --- LÓGICA DE VISUALIZAÇÃO PÚBLICA ---

async function showFichaCampeonato(id) {
    const camp = campeonatos.find(c => c.id === id);
    if (!camp) return;

    document.getElementById('ver-campeonato-titulo').innerText = camp.nome;
    document.getElementById('ver-campeonato-data').innerText = `Data: ${formatDate(camp.data)}`;
    
    const btnAddGame = document.getElementById('btn-add-game-from-view');
    if (userRole === 'admin') {
        btnAddGame.style.display = 'inline-flex';
        btnAddGame.onclick = () => {
            closeModal(modalVerCampeonato);
            showJogoModal(id);
        };
    } else {
        btnAddGame.style.display = 'none';
    }
    
    const tabButtons = modalVerCampeonato.querySelectorAll('.tab-like-btn');
    const tabContents = modalVerCampeonato.querySelectorAll('.tab-like-content');
    
    tabButtons.forEach((btn, index) => btn.classList.toggle('active', index === 0));
    tabContents.forEach((content, index) => content.classList.toggle('active', index === 0));
    
    renderEscalacao(camp);
    openModal(modalVerCampeonato);

    try {
        await renderJogosEClassificacao(id);
    } catch (error) {
        console.error("Erro ao carregar dados do campeonato:", error);
        document.getElementById('jogos-realizados-container').innerHTML = '<p class="auth-error" style="display:block;">Erro ao carregar jogos.</p>';
        document.getElementById('classificacao-container').innerHTML = '<p class="auth-error" style="display:block;">Erro ao carregar classificação.</p>';
    }
}

function renderEscalacao(camp) {
    const container = document.getElementById('escalacao-container');
    container.innerHTML = '';
    
    if (!camp.jogadoresEscalados || camp.jogadoresEscalados.length === 0) {
        container.innerHTML = '<p>Nenhum jogador escalado.</p>';
        return;
    }
    
    const todosJogadores = getJogadores();
    camp.jogadoresEscalados.forEach(jogadorId => {
        const j = todosJogadores.find(p => p.id === jogadorId);
        if (j) {
            const fotoHTML = j.foto ? `<img src="${j.foto}" alt="${j.nome}">` : `<div class="placeholder">🏀</div>`;
            container.innerHTML += `<div class="jogador-escalado">${fotoHTML}<div class="info"><strong>${j.nome}</strong><br><span>#${j.numero_uniforme} - ${j.posicao}</span></div></div>`;
        }
    });
}

async function renderJogosEClassificacao(campeonatoId) {
    const jogosContainer = document.getElementById('jogos-realizados-container');
    const classContainer = document.getElementById('classificacao-container');
    jogosContainer.innerHTML = '<p>Carregando jogos...</p>';
    classContainer.innerHTML = '<p>Calculando classificação...</p>';

    const todosJogadores = getJogadores();
    const jogosRef = collection(db, "campeonatos", campeonatoId, "jogos");
    const q = query(jogosRef, orderBy("dataJogo", "desc"));
    const snapshotJogos = await getDocs(q);

    if (snapshotJogos.empty) {
        jogosContainer.innerHTML = '<p>Nenhum jogo realizado.</p>';
        classContainer.innerHTML = '<p>Nenhuma estatística para exibir.</p>';
        return;
    }

    jogosContainer.innerHTML = '';
    const leaderboard = {};

    for (const jogoDoc of snapshotJogos.docs) {
        const jogo = { id: jogoDoc.id, ...jogoDoc.data() };

        let adminActionButtons = '';
        if (userRole === 'admin') {
            adminActionButtons = `
                <div class="game-item-actions-view">
                    <button class="btn-painel-jogo-view" data-jogo-id="${jogo.id}" data-campeonato-id="${campeonatoId}" data-adversario="${jogo.adversario}" title="Painel do Jogo">📊</button>
                    <button class="btn-edit-jogo-view" data-jogo-id="${jogo.id}" data-campeonato-id="${campeonatoId}" title="Editar Jogo">✏️</button>
                    <button class="btn-delete-jogo-view" data-jogo-id="${jogo.id}" data-campeonato-id="${campeonatoId}" title="Excluir Jogo">🗑️</button>
                </div>`;
        }

        const resultadoClass = jogo.placarANCB_final > jogo.placarAdversario_final ? 'vitoria' : (jogo.placarANCB_final < jogo.placarAdversario_final ? 'derrota' : 'empate');
        
        jogosContainer.innerHTML += `
            <div class="jogo-realizado-item clickable" data-jogo-id="${jogo.id}" data-campeonato-id="${campeonatoId}">
                <div class="jogo-info">
                    <span><strong>ANCB</strong> vs <strong>${jogo.adversario}</strong></span>
                    <span class="resultado ${resultadoClass}">${jogo.placarANCB_final} x ${jogo.placarAdversario_final}</span>
                </div>
                ${adminActionButtons}
            </div>`;

        const estatisticasRef = collection(db, "campeonatos", campeonatoId, "jogos", jogo.id, "estatisticas");
        const snapshotStats = await getDocs(estatisticasRef);
        snapshotStats.forEach(statDoc => {
            const stat = statDoc.data();
            if (stat.jogadorId && !leaderboard[stat.jogadorId]) {
                leaderboard[stat.jogadorId] = { 
                    jogadorId: stat.jogadorId, nome: stat.nomeJogador, pontos: 0, jogos: 0 
                };
            }
            if(stat.jogadorId) {
                leaderboard[stat.jogadorId].pontos += stat.pontos;
                if (stat.pontos > 0) leaderboard[stat.jogadorId].jogos += 1;
            }
        });
    }

    const sortedLeaderboard = Object.values(leaderboard).sort((a, b) => b.pontos - a.pontos);
    if (sortedLeaderboard.length === 0) {
        classContainer.innerHTML = '<p>Nenhuma estatística de pontos registrada.</p>';
    } else {
        let leaderboardHTML = '<div class="leaderboard-list">';
        sortedLeaderboard.forEach((player, index) => {
            const perfilJogador = todosJogadores.find(j => j.id === player.jogadorId);
            const fotoHTML = perfilJogador?.foto 
                ? `<img src="${perfilJogador.foto}" alt="${player.nome}" class="leaderboard-player-photo">`
                : '<div class="leaderboard-player-photo placeholder">🏀</div>';
            const media = player.jogos > 0 ? (player.pontos / player.jogos).toFixed(1) : 0;
            leaderboardHTML += `
                <div class="leaderboard-item">
                    <span class="leaderboard-rank">${index + 1}</span>
                    ${fotoHTML}
                    <div class="leaderboard-player-info">
                        <span class="leaderboard-player-name">${player.nome}</span>
                    </div>
                    <div class="leaderboard-player-stats">
                        <div class="stat-item">
                            <span class="stat-value">${player.pontos}</span>
                            <span class="stat-label">Pontos</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${media}</span>
                            <span class="stat-label">Média</span>
                        </div>
                    </div>
                </div>`;
        });
        leaderboardHTML += '</div>';
        classContainer.innerHTML = leaderboardHTML;
    }
}

async function showFichaJogoDetalhes(campeonatoId, jogoId) {
    const modal = document.getElementById('modal-ver-jogo');
    const container = document.getElementById('jogo-estatisticas-container');
    container.innerHTML = '<p>Carregando estatísticas...</p>';
    openModal(modal);

    try {
        const todosJogadores = getJogadores();
        const jogoRef = doc(db, "campeonatos", campeonatoId, "jogos", jogoId);
        const jogoDoc = await getDoc(jogoRef);

        if (!jogoDoc.exists()) {
            container.innerHTML = '<p>Jogo não encontrado.</p>';
            return;
        }
        const jogo = jogoDoc.data();

        document.getElementById('ver-jogo-titulo').textContent = `ANCB vs ${jogo.adversario}`;
        document.getElementById('ver-jogo-placar-final').textContent = `${jogo.placarANCB_final} x ${jogo.placarAdversario_final}`;

        const cestasRef = collection(db, "campeonatos", campeonatoId, "jogos", jogoId, "cestas");
        const q = query(cestasRef, where("jogadorId", "!=", null));
        const cestasSnapshot = await getDocs(q);

        if (cestasSnapshot.empty) {
            container.innerHTML = '<p>Nenhuma pontuação individual registrada para este jogo.</p>';
            return;
        }

        const statsPorJogador = {};
        cestasSnapshot.forEach(doc => {
            const cesta = doc.data();
            if (!statsPorJogador[cesta.jogadorId]) {
                statsPorJogador[cesta.jogadorId] = {
                    nome: cesta.nomeJogador, cestas1: 0, cestas2: 0, cestas3: 0, total: 0
                };
            }
            statsPorJogador[cesta.jogadorId][`cestas${cesta.pontos}`]++;
            statsPorJogador[cesta.jogadorId].total += cesta.pontos;
        });

        const sortedStats = Object.entries(statsPorJogador).sort(([, a], [, b]) => b.total - a.total);

        let html = `
            <div class="stat-header">
                <span class="header-jogador">Jogador</span>
                <div class="header-pontos">
                    <span title="Cestas de 1 Ponto">1PT</span>
                    <span title="Cestas de 2 Pontos">2PT</span>
                    <span title="Cestas de 3 Pontos">3PT</span>
                    <strong>Total</strong>
                </div>
            </div>
        `;

        sortedStats.forEach(([jogadorId, stats]) => {
            const perfil = todosJogadores.find(j => j.id === jogadorId);
            const fotoHTML = perfil?.foto ? `<img src="${perfil.foto}" alt="${stats.nome}">` : '<div class="placeholder">🏀</div>';
            html += `
                <div class="stat-jogador-item">
                    <div class="stat-jogador-info">
                        ${fotoHTML}
                        <span>${stats.nome}</span>
                    </div>
                    <div class="stat-jogador-pontos">
                        <span>${stats.cestas1}</span>
                        <span>${stats.cestas2}</span>
                        <span>${stats.cestas3}</span>
                        <strong>${stats.total} Pts</strong>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

    } catch (error) {
        console.error("Erro ao buscar detalhes do jogo:", error);
        container.innerHTML = '<p>Não foi possível carregar as estatísticas.</p>';
    }
}

// --- INICIALIZAÇÃO E FUNÇÕES PÚBLICAS ---

function setupTabEventListeners() {
    const tabContainer = document.querySelector('#modal-ver-campeonato .tab-like-container');
    if (!tabContainer) return;
    if (tabContainer.dataset.listenerAttached) return;

    tabContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-like-btn')) {
            const targetId = e.target.dataset.target;
            tabContainer.querySelectorAll('.tab-like-btn').forEach(b => b.classList.remove('active'));
            tabContainer.querySelectorAll('.tab-like-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            const targetContent = tabContainer.querySelector(`#${targetId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        }
    });
    tabContainer.dataset.listenerAttached = 'true';
}

export function setCampeonatosUserRole(role) {
    userRole = role;
    render();
}

export function initCampeonatos() {
    loaderCampeonatos.style.display = 'block';  // mostra o loader enquanto carrega
    onSnapshot(query(collection(db, "campeonatos"), orderBy("data", "desc")), (snapshot) => {
        campeonatos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render();
    });

    gridCampeonatos.addEventListener('click', (e) => {
        const card = e.target.closest('.championship-card');
        if (!card) return;
        const id = card.dataset.id;
        if (e.target.closest('.btn-edit-camp')) {
            showCampeonatoModal(id);
        } else if (e.target.closest('.btn-delete-camp')) {
            deleteCampeonato(id);
        } else {
            showFichaCampeonato(id);
        }
    });

    document.getElementById('jogos-realizados-container').addEventListener('click', (e) => {
        const btnPainel = e.target.closest('.btn-painel-jogo-view');
        const btnEdit = e.target.closest('.btn-edit-jogo-view');
        const btnDelete = e.target.closest('.btn-delete-jogo-view');
        const itemJogo = e.target.closest('.jogo-realizado-item');

        if (btnPainel) {
            e.stopPropagation();
            const { campeonatoId, jogoId, adversario } = btnPainel.dataset;
            const campeonato = campeonatos.find(c => c.id === campeonatoId);
            if(campeonato && jogoId && adversario) abrirPainelJogo(campeonato, jogoId, adversario);

        } else if (btnEdit) {
            e.stopPropagation();
            const { campeonatoId, jogoId } = btnEdit.dataset;
            closeModal(modalVerCampeonato);
            showJogoModal(campeonatoId, jogoId);

        } else if (btnDelete) {
            e.stopPropagation();
            const { campeonatoId, jogoId } = btnDelete.dataset;
            deleteJogo(campeonatoId, jogoId);
            
        } else if (itemJogo) {
            const { campeonatoId, jogoId } = itemJogo.dataset;
            if (campeonatoId && jogoId) showFichaJogoDetalhes(campeonatoId, jogoId);
        }
    });

    formCampeonato.addEventListener('submit', handleFormSubmitCampeonato);
    formJogo.addEventListener('submit', handleFormSubmitJogo);
    document.getElementById('btn-abrir-modal-campeonato').addEventListener('click', () => showCampeonatoModal());
    setupTabEventListeners();
}