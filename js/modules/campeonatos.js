// js/modules/campeonatos.js (CORRIGIDO)

import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, addDoc, getDocs, writeBatch, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
import { openModal, closeModal } from '../components/modal.js';
import { getJogadores } from './jogadores.js';

let campeonatos = [];
let userRole = null;

// --- Elementos do DOM ---
const gridCampeonatos = document.getElementById('grid-campeonatos');
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
function render() {
    gridCampeonatos.innerHTML = '';
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
        } catch (error) {
            alert("Não foi possível excluir o campeonato.");
        }
    }
}

// --- LÓGICA DE JOGOS ---

async function renderJogosList(campeonatoId) {
    const listaJogosContainer = document.getElementById('lista-de-jogos');
    listaJogosContainer.innerHTML = 'Carregando jogos...';
    
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
            <span>vs <strong>${jogo.adversario}</strong> (${formatDate(jogo.dataJogo)}) - ${jogo.placarANCB_final} x ${jogo.placarAdversario_final}</span>
            <div>
                <button class="btn-edit-jogo btn-sm">✏️</button>
                <button class="btn-delete-jogo btn-sm">🗑️</button>
            </div>
        `;
        item.querySelector('.btn-edit-jogo').addEventListener('click', () => showJogoModal(campeonatoId, jogo.id));
        item.querySelector('.btn-delete-jogo').addEventListener('click', () => deleteJogo(campeonatoId, jogo.id));
        listaJogosContainer.appendChild(item);
    });
}


async function showJogoModal(campeonatoId, jogoId = null) {
    formJogo.reset();
    formJogo['jogo-campeonato-id'].value = campeonatoId;
    formJogo['jogo-id'].value = jogoId || '';
    
    const campeonato = campeonatos.find(c => c.id === campeonatoId);
    if (!campeonato) return;

    const placarContainer = document.getElementById('placar-container');
    if (campeonato.tipo === '3x3') {
        placarContainer.innerHTML = `
            <div class="form-group">
                <label>Placar Final</label>
                <div class="score-input-group">
                    <input type="number" id="placarANCB_final" placeholder="ANCB" required>
                    <span>x</span>
                    <input type="number" id="placarAdversario_final" placeholder="Adversário" required>
                </div>
            </div>`;
    } else {
        placarContainer.innerHTML = `
            <div class="form-group">
                <label>Placar por Período</label>
                <div class="score-grid">
                    <span></span><span>ANCB</span><span>ADV</span>
                    <span>Q1</span><input type="number" id="placarANCB_q1" value="0"><input type="number" id="placarAdversario_q1" value="0">
                    <span>Q2</span><input type="number" id="placarANCB_q2" value="0"><input type="number" id="placarAdversario_q2" value="0">
                    <span>Q3</span><input type="number" id="placarANCB_q3" value="0"><input type="number" id="placarAdversario_q3" value="0">
                    <span>Q4</span><input type="number" id="placarANCB_q4" value="0"><input type="number" id="placarAdversario_q4" value="0">
                </div>
            </div>`;
    }

    const estatisticasContainer = document.getElementById('estatisticas-jogadores-container');
    estatisticasContainer.innerHTML = '';
    const todosJogadores = getJogadores();
    const jogadoresEscalados = campeonato.jogadoresEscalados || [];
    
    const jogadoresParaEstatistica = todosJogadores.filter(j => jogadoresEscalados.includes(j.id));
    jogadoresParaEstatistica.forEach(j => {
        estatisticasContainer.innerHTML += `
            <div class="player-stat-row">
                <label for="stat-player-${j.id}">${j.nome} (#${j.numero_uniforme})</label>
                <input type="number" id="stat-player-${j.id}" data-player-id="${j.id}" data-player-name="${j.nome}" placeholder="Pontos" value="0">
            </div>
        `;
    });
    
    if (jogoId) {
        document.getElementById('modal-jogo-titulo').innerText = 'Editar Jogo';
        const jogoRef = doc(db, "campeonatos", campeonatoId, "jogos", jogoId);
        const jogoDoc = await getDoc(jogoRef);
        if (jogoDoc.exists()) {
            const jogo = jogoDoc.data();
            formJogo['jogo-data'].value = jogo.dataJogo;
            formJogo['jogo-adversario'].value = jogo.adversario;
            
            if (campeonato.tipo === '3x3') {
                formJogo['placarANCB_final'].value = jogo.placarANCB_final;
                formJogo['placarAdversario_final'].value = jogo.placarAdversario_final;
            } else {
                ['q1', 'q2', 'q3', 'q4'].forEach(q => {
                    formJogo[`placarANCB_${q}`].value = jogo[`placarANCB_${q}`] || 0;
                    formJogo[`placarAdversario_${q}`].value = jogo[`placarAdversario_${q}`] || 0;
                });
            }
            
            const estatisticasRef = collection(db, "campeonatos", campeonatoId, "jogos", jogoId, "estatisticas");
            const estatisticasSnapshot = await getDocs(estatisticasRef);
            estatisticasSnapshot.forEach(statDoc => {
                const stat = statDoc.data();
                const input = document.getElementById(`stat-player-${stat.jogadorId}`);
                if (input) {
                    input.value = stat.pontos;
                }
            });
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

    let dadosJogo = {
        dataJogo: formJogo['jogo-data'].value,
        adversario: formJogo['jogo-adversario'].value
    };

    if (campeonato.tipo === '3x3') {
        dadosJogo.placarANCB_final = parseInt(formJogo['placarANCB_final'].value) || 0;
        dadosJogo.placarAdversario_final = parseInt(formJogo['placarAdversario_final'].value) || 0;
    } else {
        dadosJogo.placarANCB_q1 = parseInt(formJogo['placarANCB_q1'].value) || 0;
        dadosJogo.placarANCB_q2 = parseInt(formJogo['placarANCB_q2'].value) || 0;
        dadosJogo.placarANCB_q3 = parseInt(formJogo['placarANCB_q3'].value) || 0;
        dadosJogo.placarANCB_q4 = parseInt(formJogo['placarANCB_q4'].value) || 0;
        dadosJogo.placarAdversario_q1 = parseInt(formJogo['placarAdversario_q1'].value) || 0;
        dadosJogo.placarAdversario_q2 = parseInt(formJogo['placarAdversario_q2'].value) || 0;
        dadosJogo.placarAdversario_q3 = parseInt(formJogo['placarAdversario_q3'].value) || 0;
        dadosJogo.placarAdversario_q4 = parseInt(formJogo['placarAdversario_q4'].value) || 0;

        dadosJogo.placarANCB_final = dadosJogo.placarANCB_q1 + dadosJogo.placarANCB_q2 + dadosJogo.placarANCB_q3 + dadosJogo.placarANCB_q4;
        dadosJogo.placarAdversario_final = dadosJogo.placarAdversario_q1 + dadosJogo.placarAdversario_q2 + dadosJogo.placarAdversario_q3 + dadosJogo.placarAdversario_q4;
    }
    
    try {
        const batch = writeBatch(db);
        let jogoRef;
        let effectiveJogoId;

        if (jogoId) {
            effectiveJogoId = jogoId;
            jogoRef = doc(db, "campeonatos", campeonatoId, "jogos", effectiveJogoId);
            batch.update(jogoRef, dadosJogo);
        } else {
            jogoRef = doc(collection(db, "campeonatos", campeonatoId, "jogos"));
            effectiveJogoId = jogoRef.id;
            batch.set(jogoRef, dadosJogo);
        }

        // CORREÇÃO: Deleta estatísticas antigas ANTES de adicionar as novas no modo de edição.
        if (jogoId) {
            const oldStatsRef = collection(db, "campeonatos", campeonatoId, "jogos", jogoId, "estatisticas");
            const oldStatsSnapshot = await getDocs(oldStatsRef);
            oldStatsSnapshot.forEach(d => batch.delete(d.ref));
        }
        
        // CORREÇÃO: Cria a referência para a subcoleção de estatísticas corretamente.
        const statsCollectionRef = collection(db, "campeonatos", campeonatoId, "jogos", effectiveJogoId, "estatisticas");
        const statsInputs = document.querySelectorAll('#estatisticas-jogadores-container input');
        
        statsInputs.forEach(input => {
            const pontos = parseInt(input.value) || 0;
            if (pontos >= 0) {
                const statRef = doc(statsCollectionRef); // Cria um novo documento dentro da coleção correta
                batch.set(statRef, {
                    jogadorId: input.dataset.playerId,
                    nomeJogador: input.dataset.playerName,
                    pontos: pontos
                });
            }
        });

        await batch.commit();
        
        closeModal(modalJogo);
        await renderJogosList(campeonatoId);

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
            await renderJogosList(campeonatoId);
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
    
    const tabButtons = modalVerCampeonato.querySelectorAll('.tab-like-btn');
    const tabContents = modalVerCampeonato.querySelectorAll('.tab-like-content');
    
    // Reset tabs to default state
    tabButtons.forEach((btn, index) => {
        btn.classList.toggle('active', index === 0);
    });
    tabContents.forEach((content, index) => {
        content.classList.toggle('active', index === 0);
    });
    
    renderEscalacao(camp);
    
    // CORREÇÃO: Abre o modal imediatamente e mostra o status de carregamento.
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

// Em js/modules/campeonatos.js, substitua a função inteira por esta:

async function renderJogosEClassificacao(campeonatoId) {
    const jogosContainer = document.getElementById('jogos-realizados-container');
    const classContainer = document.getElementById('classificacao-container');
    jogosContainer.innerHTML = '<p>Carregando jogos...</p>';
    classContainer.innerHTML = '<p>Calculando classificação...</p>';

    const todosJogadores = getJogadores(); // Pega a lista de todos os jogadores
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

        const resultadoClass = jogo.placarANCB_final > jogo.placarAdversario_final ? 'vitoria' : (jogo.placarANCB_final < jogo.placarAdversario_final ? 'derrota' : 'empate');
        // Alteração da Etapa 1 já incluída aqui:
        jogosContainer.innerHTML += `
            <div class="jogo-realizado-item">
                <span><strong>ANCB</strong> vs <strong>${jogo.adversario}</strong></span>
                <span class="resultado ${resultadoClass}">${jogo.placarANCB_final} x ${jogo.placarAdversario_final}</span>
            </div>`;

        const estatisticasRef = collection(db, "campeonatos", campeonatoId, "jogos", jogo.id, "estatisticas");
        const snapshotStats = await getDocs(estatisticasRef);
        snapshotStats.forEach(statDoc => {
            const stat = statDoc.data();
            if (!leaderboard[stat.jogadorId]) {
                leaderboard[stat.jogadorId] = { 
                    jogadorId: stat.jogadorId, // <<< Importante manter o ID
                    nome: stat.nomeJogador, 
                    pontos: 0, 
                    jogos: 0 
                };
            }
            leaderboard[stat.jogadorId].pontos += stat.pontos;
            if (stat.pontos > 0) {
                leaderboard[stat.jogadorId].jogos += 1;
            }
        });
    }

    const sortedLeaderboard = Object.values(leaderboard).sort((a, b) => b.pontos - a.pontos);

    if (sortedLeaderboard.length === 0) {
        classContainer.innerHTML = '<p>Nenhuma estatística de pontos registrada.</p>';
        return;
    }

    // NOVO HTML para a lista de artilheiros
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

// --- INICIALIZAÇÃO E EVENT LISTENERS ---

function setupTabEventListeners() {
    const tabContainer = document.querySelector('#modal-ver-campeonato .tab-like-container');
    if (tabContainer.dataset.listenerAttached) return; // Evita adicionar múltiplos listeners

    tabContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-like-btn')) {
            const targetId = e.target.dataset.target;
            tabContainer.querySelectorAll('.tab-like-btn').forEach(b => b.classList.remove('active'));
            tabContainer.querySelectorAll('.tab-like-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            tabContainer.querySelector(`#${targetId}`).classList.add('active');
        }
    });
    tabContainer.dataset.listenerAttached = 'true';
}

export function setCampeonatosUserRole(role) {
    userRole = role;
    render();
}

export function initCampeonatos() {
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

    formCampeonato.addEventListener('submit', handleFormSubmitCampeonato);
    formJogo.addEventListener('submit', handleFormSubmitJogo);
    document.getElementById('btn-abrir-modal-campeonato').addEventListener('click', () => showCampeonatoModal());
    setupTabEventListeners();
}