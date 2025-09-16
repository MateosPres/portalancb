// js/modules/jogos.js (NOVO ARQUIVO)
import { doc, getDoc, updateDoc, addDoc, deleteDoc, collection } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
import { openModal, closeModal } from '../components/modal.js';
import { getJogadores } from './jogadores.js';

const modalJogo = document.getElementById('modal-jogo');
const formJogo = document.getElementById('form-jogo');
const placar5x5 = document.getElementById('placar-5x5');
const placar3x3 = document.getElementById('placar-3x3');
const listaStatsJogadores = document.getElementById('lista-estatisticas-jogadores');
const loadingOverlay = modalJogo.querySelector('.loading-overlay');

export async function openJogoModal(campeonatoId, tipo, jogoId = null) {
    formJogo.reset();
    formJogo['jogo-campeonato-id'].value = campeonatoId;
    formJogo['jogo-id'].value = jogoId || '';
    placar5x5.classList.toggle('active', tipo === '5x5');
    placar3x3.classList.toggle('active', tipo === '3x3');
    const jogadores = getJogadores();
    listaStatsJogadores.innerHTML = jogadores.map(j => `<div class="estatistica-jogador-item" data-jogador-id="${j.id}"><label>${j.nome}</label><input type="number" class="pontos-jogador" min="0" value="0"></div>`).join('');

    if (jogoId) {
        document.getElementById('modal-jogo-titulo').innerText = 'Editar Jogo';
        const jogoRef = doc(db, "campeonatos", campeonatoId, "jogos", jogoId);
        const jogoSnap = await getDoc(jogoRef);
        if (jogoSnap.exists()) {
            const jogo = jogoSnap.data();
            formJogo['jogo-adversario'].value = jogo.adversario;
            formJogo['jogo-data'].value = jogo.data;
            if (tipo === '5x5') {
                Object.keys(jogo.placarANCB).forEach(key => { if(formJogo[`ancb-${key}`]) formJogo[`ancb-${key}`].value = jogo.placarANCB[key] });
                Object.keys(jogo.placarAdversario).forEach(key => { if(formJogo[`adv-${key}`]) formJogo[`adv-${key}`].value = jogo.placarAdversario[key] });
            } else {
                formJogo['ancb-total-3x3'].value = jogo.placarANCB.total;
                formJogo['adv-total-3x3'].value = jogo.placarAdversario.total;
            }
            jogo.estatisticas.forEach(stat => {
                const input = listaStatsJogadores.querySelector(`[data-jogador-id="${stat.jogadorId}"] .pontos-jogador`);
                if (input) input.value = stat.pontos;
            });
        }
    } else { document.getElementById('modal-jogo-titulo').innerText = 'Adicionar Jogo'; }
    openModal(modalJogo);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const saveButton = formJogo.querySelector('button[type="submit"]');
    loadingOverlay.classList.add('active');
    saveButton.disabled = true;

    const campeonatoId = formJogo['jogo-campeonato-id'].value;
    const jogoId = formJogo['jogo-id'].value;
    const tipo = placar5x5.classList.contains('active') ? '5x5' : '3x3';
    let placarANCB = {}, placarAdversario = {};

    if (tipo === '5x5') {
        placarANCB = { q1: +formJogo['ancb-q1'].value, q2: +formJogo['ancb-q2'].value, q3: +formJogo['ancb-q3'].value, q4: +formJogo['ancb-q4'].value, total: +formJogo['ancb-q1'].value + +formJogo['ancb-q2'].value + +formJogo['ancb-q3'].value + +formJogo['ancb-q4'].value };
        placarAdversario = { q1: +formJogo['adv-q1'].value, q2: +formJogo['adv-q2'].value, q3: +formJogo['adv-q3'].value, q4: +formJogo['adv-q4'].value, total: +formJogo['adv-q1'].value + +formJogo['adv-q2'].value + +formJogo['adv-q3'].value + +formJogo['adv-q4'].value };
    } else {
        placarANCB = { total: +formJogo['ancb-total-3x3'].value };
        placarAdversario = { total: +formJogo['adv-total-3x3'].value };
    }

    const estatisticas = [];
    listaStatsJogadores.querySelectorAll('.estatistica-jogador-item').forEach(item => {
        const pontos = +item.querySelector('.pontos-jogador').value;
        if (pontos > 0) { estatisticas.push({ jogadorId: item.dataset.jogadorId, pontos: pontos }); }
    });
    const dados = { adversario: formJogo['jogo-adversario'].value, data: formJogo['jogo-data'].value, placarANCB, placarAdversario, estatisticas };
    try {
        const colRef = collection(db, "campeonatos", campeonatoId, "jogos");
        if (jogoId) { await updateDoc(doc(colRef, jogoId), dados); } else { await addDoc(colRef, dados); }
        closeModal(modalJogo);
        document.querySelector(`#grid-campeonatos [data-id="${campeonatoId}"]`).click(); // Reabre o modal de camp para atualizar
    } catch (error) {
        console.error("Erro ao salvar jogo: ", error);
        alert("Não foi possível salvar o jogo.");
    } finally {
        loadingOverlay.classList.remove('active');
        saveButton.disabled = false;
    }
}

export async function deleteJogo(campeonatoId, jogoId) {
    if(!campeonatoId || !jogoId) return;
    await deleteDoc(doc(db, "campeonatos", campeonatoId, "jogos", jogoId));
}

export function initJogos() {
    formJogo.addEventListener('submit', handleFormSubmit);
    placar5x5.addEventListener('input', () => {
        const anbc_total = +formJogo['ancb-q1'].value + +formJogo['ancb-q2'].value + +formJogo['ancb-q3'].value + +formJogo['ancb-q4'].value;
        const adv_total = +formJogo['adv-q1'].value + +formJogo['adv-q2'].value + +formJogo['adv-q3'].value + +formJogo['adv-q4'].value;
        formJogo['ancb-total-5x5'].value = anbc_total;
        formJogo['adv-total-5x5'].value = adv_total;
    });
}