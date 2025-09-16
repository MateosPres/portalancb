// js/modules/painelJogo.js (VERSÃO FINAL COM CÁLCULO DE ESTATÍSTICAS)

import { db } from '../services/firebase.js';
import { collection, addDoc, query, where, orderBy, onSnapshot, limit, getDocs, deleteDoc, doc, updateDoc, getDoc, increment, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { openModal } from '../components/modal.js';
import { getJogadores } from './jogadores.js';

// --- Elementos do DOM ---
const modalPainelJogo = document.getElementById('modal-painel-jogo');
const placarDisplay = document.getElementById('placar-ancb-display');
const placarAdversarioDisplay = document.getElementById('placar-adversario-display');
const registroCestasContainer = document.getElementById('registro-cestas-container');
const painelDistribuicaoContainer = document.getElementById('painel-distribuicao-container');
const painelAdversarioNome = document.getElementById('painel-adversario-nome');
const painelAdversarioNomeHeader = document.getElementById('painel-adversario-nome-header');

// --- Variáveis de Estado ---
let currentCampId = null;
let currentGameId = null;
let campeonatoAtual = null;
let listaDeCestas = [];
let unsubCestas = null;
let unsubJogo = null;

// --- LÓGICA GERAL E "AO VIVO" ---

function renderPainelAoVivo(cestas, placarAdversario = 0) {
    const totalPontosANCB = cestas.reduce((sum, cesta) => sum + cesta.pontos, 0);
    placarDisplay.textContent = totalPontosANCB;
    placarAdversarioDisplay.textContent = placarAdversario;

    registroCestasContainer.innerHTML = '';
    if (cestas.length === 0) {
        registroCestasContainer.innerHTML = '<p>Nenhuma cesta registrada.</p>';
    } else {
        [...cestas].reverse().forEach(cesta => {
            const item = document.createElement('div');
            item.className = 'cesta-item';
            let textoCesta = `Cesta de ${cesta.pontos} ponto(s)`;
            if (cesta.nomeJogador) {
                textoCesta += ` - ${cesta.nomeJogador}`;
            }
            item.textContent = textoCesta;
            registroCestasContainer.appendChild(item);
        });
    }
}

async function adicionarCesta(pontos) {
    if (!currentCampId || !currentGameId || !pontos) return;
    const cestasRef = collection(db, "campeonatos", currentCampId, "jogos", currentGameId, "cestas");
    await addDoc(cestasRef, { pontos, timestamp: new Date(), jogadorId: null, nomeJogador: null });
    
    const jogoRef = doc(db, "campeonatos", currentCampId, "jogos", currentGameId);
    await updateDoc(jogoRef, { placarANCB_final: increment(pontos) });
}

async function desfazerUltimaCesta() {
    if (!currentCampId || !currentGameId) return;
    const cestasRef = collection(db, "campeonatos", currentCampId, "jogos", currentGameId, "cestas");
    const q = query(cestasRef, orderBy("timestamp", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const ultimaCesta = snapshot.docs[0].data();
        await deleteDoc(snapshot.docs[0].ref);
        const jogoRef = doc(db, "campeonatos", currentCampId, "jogos", currentGameId);
        await updateDoc(jogoRef, { placarANCB_final: increment(-ultimaCesta.pontos) });

        // Se a cesta pertencia a um jogador, recalcula as estatísticas dele
        if (ultimaCesta.jogadorId) {
            await recalcularEstatisticasJogador(ultimaCesta.jogadorId);
        }
    }
}

async function alterarPlacarAdversario(pontos) {
    if (!currentCampId || !currentGameId) return;
    const jogoRef = doc(db, "campeonatos", currentCampId, "jogos", currentGameId);
    await updateDoc(jogoRef, { placarAdversario_final: increment(pontos) });
}

// --- LÓGICA DA ABA "DISTRIBUIR PONTOS" ---

// NOVA FUNÇÃO: Recalcula e salva o total de pontos de um jogador
async function recalcularEstatisticasJogador(jogadorId) {
    if (!currentCampId || !currentGameId || !jogadorId) return;

    // 1. Busca todas as cestas atribuídas a este jogador neste jogo
    const cestasRef = collection(db, "campeonatos", currentCampId, "jogos", currentGameId, "cestas");
    const q = query(cestasRef, where("jogadorId", "==", jogadorId));
    const snapshot = await getDocs(q);

    // 2. Calcula os totais
    let cestas1 = 0, cestas2 = 0, cestas3 = 0, totalPontos = 0;
    snapshot.forEach(doc => {
        const cesta = doc.data();
        totalPontos += cesta.pontos;
        if (cesta.pontos === 1) cestas1++;
        else if (cesta.pontos === 2) cestas2++;
        else if (cesta.pontos === 3) cestas3++;
    });

    // 3. Salva os totais na subcoleção 'estatisticas'
    const jogador = getJogadores().find(j => j.id === jogadorId);
    const statRef = doc(db, "campeonatos", currentCampId, "jogos", currentGameId, "estatisticas", jogadorId);
    await setDoc(statRef, {
        jogadorId: jogadorId,
        nomeJogador: jogador.nome,
        pontos: totalPontos,
        cestas1: cestas1,
        cestas2: cestas2,
        cestas3: cestas3
    }, { merge: true }); // 'merge: true' cria o documento se não existir, ou atualiza se já existir
}


function renderPainelDistribuicao() {
    painelDistribuicaoContainer.innerHTML = '';
    const cestasNaoAtribuidas = listaDeCestas.filter(c => !c.jogadorId);
    const contagemCestas = cestasNaoAtribuidas.reduce((acc, cesta) => {
        acc[cesta.pontos] = (acc[cesta.pontos] || 0) + 1;
        return acc;
    }, {});
    
    let saldoHTML = `
        <h4>Cestas não atribuídas:</h4>
        <div class="saldo-cestas">
            <div class="saldo-item"><strong>${contagemCestas[1] || 0}</strong> x 1 Ponto</div>
            <div class="saldo-item"><strong>${contagemCestas[2] || 0}</strong> x 2 Pontos</div>
            <div class="saldo-item"><strong>${contagemCestas[3] || 0}</strong> x 3 Pontos</div>
        </div>
        <hr>`;

    const todosJogadores = getJogadores();
    const jogadoresEscalados = campeonatoAtual?.jogadoresEscalados || [];
    const jogadoresDoJogo = todosJogadores.filter(j => jogadoresEscalados.includes(j.id));

    if (jogadoresDoJogo.length === 0) {
        painelDistribuicaoContainer.innerHTML = saldoHTML + '<p>Nenhum jogador escalado para este campeonato.</p>';
        return;
    }

    let jogadoresHTML = '<h4>Atribuir Cestas:</h4>';
    jogadoresDoJogo.forEach(jogador => {
        jogadoresHTML += `
            <div class="distribuicao-jogador-row">
                <span>${jogador.nome}</span>
                <div class="botoes-distribuicao">
                    <button data-jogador-id="${jogador.id}" data-pontos="1" ${ (contagemCestas[1] || 0) === 0 ? 'disabled' : '' }>+1</button>
                    <button data-jogador-id="${jogador.id}" data-pontos="2" ${ (contagemCestas[2] || 0) === 0 ? 'disabled' : '' }>+2</button>
                    <button data-jogador-id="${jogador.id}" data-pontos="3" ${ (contagemCestas[3] || 0) === 0 ? 'disabled' : '' }>+3</button>
                </div>
            </div>`;
    });
    painelDistribuicaoContainer.innerHTML = saldoHTML + jogadoresHTML;
}

// ATUALIZAÇÃO: Agora chama a função de recalcular estatísticas
async function atribuirCesta(jogadorId, pontos) {
    const cestaParaAtribuir = listaDeCestas.find(c => c.pontos === pontos && !c.jogadorId);
    if (!cestaParaAtribuir) return;
    const jogador = getJogadores().find(j => j.id === jogadorId);
    if (!jogador) return;
    
    const cestaRef = doc(db, "campeonatos", currentCampId, "jogos", currentGameId, "cestas", cestaParaAtribuir.id);
    await updateDoc(cestaRef, {
        jogadorId: jogadorId,
        nomeJogador: jogador.nome
    });

    // PASSO FINAL: Chama a nova função para atualizar os totais do jogador
    await recalcularEstatisticasJogador(jogadorId);
}

// --- FUNÇÕES EXPORTADAS ---

export function abrirPainelJogo(campeonato, jogoId, nomeAdversario) {
    campeonatoAtual = campeonato;
    currentCampId = campeonato.id;
    currentGameId = jogoId;

    painelAdversarioNome.textContent = nomeAdversario;
    painelAdversarioNomeHeader.textContent = nomeAdversario;

    if (unsubCestas) unsubCestas();
    if (unsubJogo) unsubJogo();

    const cestasRef = collection(db, "campeonatos", currentCampId, "jogos", currentGameId, "cestas");
    const qCestas = query(cestasRef, orderBy("timestamp", "asc"));
    unsubCestas = onSnapshot(qCestas, (cestaSnapshot) => {
        listaDeCestas = cestaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderPainelDistribuicao();
    });

    const jogoDoc = doc(db, "campeonatos", currentCampId, "jogos", currentGameId);
    unsubJogo = onSnapshot(jogoDoc, (jogoSnapshot) => {
        const placarAdversario = jogoSnapshot.data()?.placarAdversario_final || 0;
        renderPainelAoVivo(listaDeCestas, placarAdversario);
    });

    openModal(modalPainelJogo);
}

// Em js/modules/painelJogo.js, substitua a função initPainelJogo

export function initPainelJogo() {
    // Controles do Placar ANCB
    document.getElementById('controles-ancb').addEventListener('click', (e) => {
        const target = e.target.closest('.btn-placar');
        if (!target) return;
        if (target.classList.contains('add')) {
            adicionarCesta(parseInt(target.dataset.points, 10));
        } else if (target.id === 'btn-undo-point') {
            desfazerUltimaCesta();
        }
    });

    // Controles do Placar Adversário
    document.getElementById('controles-adversario').addEventListener('click', (e) => {
        const target = e.target.closest('.btn-placar');
        if (!target) return;
        if (target.classList.contains('add')) {
            alterarPlacarAdversario(parseInt(target.dataset.points, 10));
        } else if (target.classList.contains('remove')) {
            alterarPlacarAdversario(-1);
        }
    });

    // Painel de Distribuição
    painelDistribuicaoContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.jogadorId) {
            atribuirCesta(e.target.dataset.jogadorId, parseInt(e.target.dataset.pontos, 10));
        }
    });
    
    // O CÓDIGO QUE CONTROLAVA AS ABAS FOI REMOVIDO DAQUI

    // Limpeza ao fechar o modal
    const stopListeners = () => {
        if (unsubCestas) unsubCestas();
        if (unsubJogo) unsubJogo();
        unsubCestas = null;
        unsubJogo = null;
    };
    
    const backdrop = document.getElementById('modal-backdrop');
    modalPainelJogo.querySelector('.close-button').addEventListener('click', stopListeners);
    backdrop.addEventListener('click', () => {
        if (modalPainelJogo.classList.contains('active')) {
            stopListeners();
        }
    });
}