// js/modules/classificacao.js (NOVO ARQUIVO)
import { collectionGroup, getDocs, query } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
import { getJogadores } from './jogadores.js';

const container = document.getElementById('classificacao-container');

export async function renderClassificacao() {
    container.innerHTML = '<p>Calculando classificação, por favor aguarde...</p>';
    const jogadores = getJogadores();
    if (jogadores.length === 0) {
        container.innerHTML = '<p>Nenhum jogador cadastrado.</p>';
        return;
    }
    const pontosMap = new Map();
    jogadores.forEach(j => pontosMap.set(j.id, { nome: j.nome, pontos: 0, jogos: 0 }));

    const jogosQuery = query(collectionGroup(db, 'jogos'));
    const jogosSnapshot = await getDocs(jogosQuery);

    jogosSnapshot.forEach(doc => {
        const jogo = doc.data();
        if (jogo.estatisticas) {
            jogo.estatisticas.forEach(stat => {
                if (pontosMap.has(stat.jogadorId)) {
                    const current = pontosMap.get(stat.jogadorId);
                    current.pontos += stat.pontos;
                    current.jogos += 1;
                }
            });
        }
    });

    const classificacaoArray = Array.from(pontosMap.values());
    classificacaoArray.sort((a, b) => b.pontos - a.pontos);
    container.innerHTML = `<table><thead><tr><th>Pos.</th><th>Jogador</th><th>Pontos</th><th>Jogos</th><th>Média</th></tr></thead><tbody>${classificacaoArray.map((j, index) => `<tr><td>${index + 1}º</td><td>${j.nome}</td><td>${j.pontos}</td><td>${j.jogos}</td><td>${j.jogos > 0 ? (j.pontos / j.jogos).toFixed(1) : '0.0'}</td></tr>`).join('')}</tbody></table>`;
}

export function initClassificacao() {
    document.getElementById('btn-atualizar-classificacao').addEventListener('click', renderClassificacao);
}