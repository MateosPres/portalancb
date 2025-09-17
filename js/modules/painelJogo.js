// js/modules/painelJogo.js (VERSÃO FINAL E COMPLETA)

import { db } from '../services/firebase.js';
import { collection, addDoc, query, where, orderBy, onSnapshot, limit, getDocs, deleteDoc, doc, updateDoc, getDoc, increment, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { openModal } from '../components/modal.js';
import { getJogadores } from './jogadores.js';

// --- Elementos do DOM ---
const modalPainelJogo = document.getElementById('modal-painel-jogo');
const painelTitulo = document.getElementById('painel-jogo-titulo');
const placarTimeADisplay = document.getElementById('placar-ancb-display');
const placarTimeBDisplay = document.getElementById('placar-adversario-display');
const nomeTimeADisplay = document.querySelector('.painel-scoreboard .team-score:first-child .team-name');
const nomeTimeBDisplay = document.querySelector('.painel-scoreboard .team-score:last-child .team-name');
const controlesTimeA = document.getElementById('controles-ancb');
const controlesTimeB = document.getElementById('controles-adversario');
const registroCestasContainer = document.getElementById('registro-cestas-container');
const painelDistribuicaoContainer = document.getElementById('painel-distribuicao-container');
const painelLayoutGrid = document.querySelector('.painel-layout-grid');


const painelDivisor = document.querySelector('.painel-divisor');
const logSection = document.querySelector('.painel-log-section');
const painelControls = document.querySelector('.painel-controls-grid'); // Container dos botões



// --- Variáveis de Estado ---
let currentEvento = null;
let currentGame = null;
let listaDeCestas = [];
let unsubCestas = null;
let unsubJogo = null;
let painelUserRole = null; // Guarda o 'role' do utilizador que abriu o painel

// --- LÓGICA DE PONTUAÇÃO ---

async function adicionarCesta(pontos, timeKey) {
    if (!currentEvento?.id || !currentGame?.id) return;
    const timeId = currentGame[`time${timeKey}_id`];
    if (timeId === undefined) return;
    const jogoRef = doc(db, "eventos", currentEvento.id, "jogos", currentGame.id);
    if (timeId !== 'adversario') {
        const cestasRef = collection(jogoRef, "cestas");
        await addDoc(cestasRef, { pontos, timestamp: new Date(), timeId, jogadorId: null, nomeJogador: null });
    }
    const placarField = currentGame.type === 'torneio_interno' ? `placarTime${timeKey}_final` : (timeKey === 'A' ? 'placarANCB_final' : 'placarAdversario_final');
    await updateDoc(jogoRef, { [placarField]: increment(pontos) });
}

async function desfazerUltimaCesta(timeKey) {
    if (!currentEvento?.id || !currentGame?.id) return;
    const timeId = currentGame[`time${timeKey}_id`];
    if (timeId === undefined) return;
    try {
        const jogoRef = doc(db, "eventos", currentEvento.id, "jogos", currentGame.id);
        if (timeId !== 'adversario') {
            const cestasRef = collection(jogoRef, "cestas");
            const q = query(cestasRef, where("timeId", "==", timeId), orderBy("timestamp", "desc"), limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const ultimaCesta = snapshot.docs[0].data();
                await deleteDoc(snapshot.docs[0].ref);
                const placarField = currentGame.type === 'torneio_interno' ? `placarTime${timeKey}_final` : 'placarANCB_final';
                await updateDoc(jogoRef, { [placarField]: increment(-ultimaCesta.pontos) });
                if (ultimaCesta.jogadorId) {
                    await recalcularEstatisticasJogador(ultimaCesta.jogadorId);
                }
            }
        } else {
            await updateDoc(jogoRef, { placarAdversario_final: increment(-1) });
        }
    } catch (error) {
        console.error("Erro ao desfazer cesta:", error);
        alert(`Não foi possível desfazer a cesta. Verifique a consola (F12) para mais detalhes.`);
    }
}


// --- LÓGICA DE RENDERIZAÇÃO E DISTRIBUIÇÃO ---

function renderPainelAoVivo() {
    const logTitle = logSection.querySelector('h3');
    logTitle.textContent = `Registro de Cestas`;
    registroCestasContainer.innerHTML = '';
    const cestasParaMostrar = listaDeCestas.filter(cesta => cesta.timeId !== 'adversario');
    if (cestasParaMostrar.length === 0) {
        registroCestasContainer.innerHTML = '<p>Nenhuma cesta registada.</p>';
    } else {
        const nomesTimes = {
            [currentGame.timeA_id]: currentGame.timeA_nome,
            [currentGame.timeB_id]: currentGame.timeB_nome,
        };
        const todosJogadores = getJogadores(); // Pega a lista de jogadores para aceder ao apelido
        [...cestasParaMostrar].reverse().forEach(cesta => {
            const item = document.createElement('div');
            item.className = 'cesta-item';
            let textoCesta = `Cesta de ${cesta.pontos} ponto(s) - ${nomesTimes[cesta.timeId]}`;
            
            // Lógica para adicionar o apelido
            if (cesta.jogadorId && cesta.nomeJogador) {
                const jogador = todosJogadores.find(j => j.id === cesta.jogadorId);
                const nomeExibicao = jogador?.apelido ? `${jogador.nome.split(' ')[0]} "${jogador.apelido}"` : cesta.nomeJogador;
                textoCesta += ` (${nomeExibicao})`;
            }
            
            item.textContent = textoCesta;
            registroCestasContainer.appendChild(item);
        });
    }
}

async function recalcularEstatisticasJogador(jogadorId) {
    if (!currentEvento?.id || !currentGame?.id || !jogadorId) return;
    const cestasRef = collection(db, "eventos", currentEvento.id, "jogos", currentGame.id, "cestas");
    const q = query(cestasRef, where("jogadorId", "==", jogadorId));
    const snapshot = await getDocs(q);
    let cestas1 = 0, cestas2 = 0, cestas3 = 0, totalPontos = 0;
    snapshot.forEach(doc => {
        const cesta = doc.data();
        totalPontos += cesta.pontos;
        if (cesta.pontos === 1) cestas1++;
        else if (cesta.pontos === 2) cestas2++;
        else if (cesta.pontos === 3) cestas3++;
    });
    const jogador = getJogadores().find(j => j.id === jogadorId);
    if (!jogador) return;
    const statRef = doc(db, "eventos", currentEvento.id, "jogos", currentGame.id, "estatisticas", jogadorId);
    await setDoc(statRef, {
        jogadorId: jogadorId, nomeJogador: jogador.nome, pontos: totalPontos, cestas1, cestas2, cestas3
    }, { merge: true });
}

function renderPainelDistribuicao() {
    painelDistribuicaoContainer.innerHTML = '';

    // CORREÇÃO: Verifica se é admin antes de renderizar
    if (painelUserRole !== 'admin') {
        painelDistribuicaoContainer.style.display = 'none';
        return;
    }
    painelDistribuicaoContainer.style.display = currentGame.type === 'torneio_interno' ? 'grid' : 'block';

    const todosJogadores = getJogadores();
    const timesParaDistribuir = [];
    if (currentGame.type === 'torneio_interno') {
        timesParaDistribuir.push({ key: 'A', id: currentGame.timeA_id, nome: currentGame.timeA_nome });
        timesParaDistribuir.push({ key: 'B', id: currentGame.timeB_id, nome: currentGame.timeB_nome });
    } else {
        timesParaDistribuir.push({ key: 'A', id: 'ancb', nome: 'ANCB' });
    }
    timesParaDistribuir.forEach(time => {
        let timeJogadoresIds = [];
        if (currentGame.type === 'torneio_interno') {
            timeJogadoresIds = currentEvento.times?.find(t => t.id === time.id)?.jogadores || [];
        } else {
            if (time.id === 'ancb') timeJogadoresIds = currentEvento.jogadoresEscalados || [];
        }
        const cestasNaoAtribuidas = listaDeCestas.filter(c => c.timeId === time.id && !c.jogadorId);
        const contagemCestas = cestasNaoAtribuidas.reduce((acc, cesta) => {
            acc[cesta.pontos] = (acc[cesta.pontos] || 0) + 1;
            return acc;
        }, {});

        let timeHTML = `
            <div class="distribuicao-coluna">
                <h3>${time.nome}</h3>
                <div class="saldo-cestas">
                    <div class="saldo-item"><strong>${contagemCestas[1] || 0}</strong> x 1 Ponto</div>
                    <div class="saldo-item"><strong>${contagemCestas[2] || 0}</strong> x 2 Pontos</div>
                    <div class="saldo-item"><strong>${contagemCestas[3] || 0}</strong> x 3 Pontos</div>
                </div>
                <hr>
                <h4>Atribuir Cestas:</h4>`;
        
        const jogadoresDoTime = todosJogadores.filter(j => timeJogadoresIds.includes(j.id));
        if (jogadoresDoTime.length > 0) {
            jogadoresDoTime.forEach(jogador => {
                const primeiroNome = jogador.nome.split(' ')[0]; // Pega só o primeiro nome
                timeHTML += `
                    <div class="distribuicao-jogador-row">
                        <span>${primeiroNome}</span> 
                        <div class="botoes-distribuicao">
                            <button data-jogador-id="${jogador.id}" data-time-id="${time.id}" data-pontos="1" ${ (contagemCestas[1] || 0) === 0 ? 'disabled' : '' }>+1</button>
                            <button data-jogador-id="${jogador.id}" data-time-id="${time.id}" data-pontos="2" ${ (contagemCestas[2] || 0) === 0 ? 'disabled' : '' }>+2</button>
                            <button data-jogador-id="${jogador.id}" data-time-id="${time.id}" data-pontos="3" ${ (contagemCestas[3] || 0) === 0 ? 'disabled' : '' }>+3</button>
                        </div>
                    </div>`;
            });
        } else {
            timeHTML += '<p>Nenhum jogador escalado.</p>';
        }
        timeHTML += '</div>';
        painelDistribuicaoContainer.innerHTML += timeHTML;
    });
}

async function atribuirCesta(jogadorId, timeId, pontos) {
    let jogadorPertenceAoTime = false;
    if (currentGame.type === 'torneio_interno') {
        const timeDoJogador = currentEvento.times.find(t => t.jogadores.includes(jogadorId));
        if (timeDoJogador && timeId === timeDoJogador.id) jogadorPertenceAoTime = true;
    } else {
        if (timeId === 'ancb' && currentEvento.jogadoresEscalados.includes(jogadorId)) jogadorPertenceAoTime = true;
    }
    if (!jogadorPertenceAoTime) {
        alert(`Este jogador não pertence ao elenco deste time.`);
        return;
    }
    const cestaParaAtribuir = listaDeCestas.find(c => c.timeId === timeId && c.pontos === pontos && !c.jogadorId);
    if (!cestaParaAtribuir) {
        alert(`Não há mais cestas de ${pontos} pontos para atribuir a este time.`);
        return;
    }
    const jogador = getJogadores().find(j => j.id === jogadorId);
    if (!jogador) return;
    
    // Agora salvamos o nome completo no registro da cesta
    const cestaRef = doc(db, "eventos", currentEvento.id, "jogos", currentGame.id, "cestas", cestaParaAtribuir.id);
    await updateDoc(cestaRef, {
        jogadorId: jogadorId,
        nomeJogador: jogador.nome // Salva o nome completo
    });
    await recalcularEstatisticasJogador(jogadorId);
}

// --- FUNÇÃO PRINCIPAL E INICIALIZAÇÃO ---

export async function abrirPainelJogo(userRole, evento, jogo) {
    painelUserRole = userRole; // Guarda o 'role' para uso noutras funções
    currentEvento = evento;
    
    const jogoNormalizado = {
        id: jogo.id,
        type: evento.type,
        timeA_id: evento.type === 'torneio_interno' ? jogo.timeA_id : 'ancb',
        timeA_nome: evento.type === 'torneio_interno' ? jogo.timeA_nome : 'ANCB',
        timeB_id: evento.type === 'torneio_interno' ? jogo.timeB_id : 'adversario',
        timeB_nome: evento.type === 'torneio_interno' ? jogo.timeB_nome : jogo.adversario,
    };
    currentGame = jogoNormalizado;

    // CORREÇÃO: Controlo de visibilidade feito diretamente com JavaScript
    if (userRole === 'admin') {
        painelControls.style.display = 'flex';
        painelDistribuicaoContainer.style.display = 'grid';
        painelDivisor.style.display = 'block';
    } else {
        painelControls.style.display = 'none';
        painelDistribuicaoContainer.style.display = 'none';
        painelDivisor.style.display = 'none';
    }

    if (evento.type === 'torneio_interno') {
        const timesRef = collection(db, "eventos", evento.id, "times");
        const timesSnapshot = await getDocs(timesRef);
        currentEvento.times = timesSnapshot.docs.map(d => ({id: d.id, ...d.data()}));
    }

    painelTitulo.textContent = `Painel: ${currentGame.timeA_nome} vs ${currentGame.timeB_nome}`;
    nomeTimeADisplay.textContent = currentGame.timeA_nome;
    nomeTimeBDisplay.textContent = currentGame.timeB_nome;

    if (unsubCestas) unsubCestas();
    if (unsubJogo) unsubJogo();

    const cestasRef = collection(db, "eventos", evento.id, "jogos", jogo.id, "cestas");
    const qCestas = query(cestasRef, orderBy("timestamp", "asc"));
    unsubCestas = onSnapshot(qCestas, (cestaSnapshot) => {
        listaDeCestas = cestaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderPainelAoVivo();
        renderPainelDistribuicao();
    });

    const jogoDoc = doc(db, "eventos", evento.id, "jogos", jogo.id);
    unsubJogo = onSnapshot(jogoDoc, (jogoSnapshot) => {
        const dadosJogo = jogoSnapshot.data();
        if (dadosJogo) {
            placarTimeADisplay.textContent = (evento.type === 'torneio_interno' ? dadosJogo.placarTimeA_final : dadosJogo.placarANCB_final) || 0;
            placarTimeBDisplay.textContent = (evento.type === 'torneio_interno' ? dadosJogo.placarTimeB_final : dadosJogo.placarAdversario_final) || 0;
        }
    });

    openModal(modalPainelJogo);
}


export function initPainelJogo() {
    controlesTimeA.addEventListener('click', (e) => {
        if (painelUserRole !== 'admin') return;
        const target = e.target.closest('.btn-placar');
        if (!target || !currentGame) return;
        if (target.classList.contains('add')) {
            adicionarCesta(parseInt(target.dataset.points, 10), 'A');
        } else if (target.id === 'btn-undo-point') {
            desfazerUltimaCesta('A');
        }
    });
    controlesTimeB.addEventListener('click', (e) => {
        if (painelUserRole !== 'admin') return;
        const target = e.target.closest('.btn-placar');
        if (!target || !currentGame) return;
        const pontos = parseInt(target.dataset.points, 10);
        if (target.classList.contains('add')) {
            adicionarCesta(pontos, 'B');
        } else if (target.classList.contains('remove')) {
            desfazerUltimaCesta('B');
        }
    });
    painelDistribuicaoContainer.addEventListener('click', (e) => {
        if (painelUserRole !== 'admin') return;
        const target = e.target.closest('button');
        if (target && target.dataset.jogadorId) {
            const { jogadorId, timeId, pontos } = target.dataset;
            atribuirCesta(jogadorId, timeId, parseInt(pontos, 10));
        }
    });
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