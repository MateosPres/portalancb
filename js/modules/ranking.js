// js/modules/ranking.js

import { collection, collectionGroup, getDocs, query } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from "../services/firebase.js";
import { getJogadores } from "./jogadores.js"; // Vamos reutilizar a função que busca jogadores

// Estado da página
let allPlayers = [];
let allBaskets = [];
let allGames = [];

let currentSeason = new Date().getFullYear().toString();
let currentCategory = 'Aberto';
let currentFilter = 'pontos';

// --- FUNÇÕES DE LÓGICA ---

/**
 * Busca todos os dados necessários do Firestore de uma só vez.
 */
async function fetchData() {
    allPlayers = getJogadores();
    if (allPlayers.length === 0) {
        const playersSnapshot = await getDocs(query(collection(db, "jogadores")));
        allPlayers = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // NOVO: Busca todos os eventos para saber a modalidade
    const eventosSnapshot = await getDocs(query(collection(db, "eventos")));
    const eventosMap = new Map();
    eventosSnapshot.forEach(doc => eventosMap.set(doc.id, doc.data()));

    const gamesSnapshot = await getDocs(query(collectionGroup(db, 'jogos')));
    allGames = gamesSnapshot.docs.map(doc => {
        const gameData = doc.data();
        const eventoId = doc.ref.parent.parent.id;
        const evento = eventosMap.get(eventoId);
        // Adiciona a modalidade do evento diretamente no objeto do jogo
        return { id: doc.id, ...gameData, modalidade: evento ? evento.modalidade : '5x5' };
    });

    const basketsSnapshot = await getDocs(query(collectionGroup(db, 'cestas')));
    allBaskets = basketsSnapshot.docs.map(doc => {
        const data = doc.data();
        const gameId = doc.ref.parent.parent.id;
        return { ...data, gameId };
    });
}

/**
 * Processa os dados brutos e gera as estatísticas consolidadas dos jogadores.
 */
function processStats() {
    const playerStats = {};

    allPlayers.forEach(player => {
        playerStats[player.id] = {
            info: player,
            jogos: new Set(),
            pontos: 0,
            cestasFora: 0,
            cestasDentro: 0,
            lancesLivres: 0,
        };
    });

    allBaskets.forEach(basket => {
        const game = allGames.find(g => g.id === basket.gameId);
        const player = playerStats[basket.jogadorId];

        if (player && game) {
            player.jogos.add(game.id);
            player.pontos += basket.pontos;

            // --- LÓGICA DE CONTAGEM CORRIGIDA ---
            if (game.modalidade === '3x3') {
                // No 3x3: 1 ponto = dentro, 2 pontos = fora
                if (basket.pontos === 1) {
                    player.cestasDentro++;
                } else if (basket.pontos === 2) {
                    player.cestasFora++;
                }
            } else { 
                // No 5x5 (padrão): 1=LL, 2=dentro, 3=fora
                if (basket.pontos === 1) {
                    player.lancesLivres++;
                } else if (basket.pontos === 2) {
                    player.cestasDentro++;
                } else if (basket.pontos === 3) {
                    player.cestasFora++;
                }
            }
        }
    });
    
    return Object.values(playerStats).map(p => ({ ...p, jogos: p.jogos.size }));
}

/**
 * Renderiza a tabela de classificação com base nos filtros atuais.
 */
function render() {
    const container = document.getElementById('ranking-table-container');
    const title = document.getElementById('ranking-title');
    if (!container || !title) return;

    // 1. Processa as estatísticas gerais
    let processedData = processStats();

    // 2. Filtra por Temporada
    const seasonGames = allGames.filter(g => g.dataJogo.startsWith(currentSeason)).map(g => g.id);
    let seasonData = processedData.filter(p => {
        return allBaskets.some(b => b.jogadorId === p.info.id && seasonGames.includes(b.gameId));
    });

    // 3. Filtra por Categoria
    if (currentCategory === 'Juvenil') {
        seasonData = seasonData.filter(p => {
            if (!p.info.nascimento) return false;
            const birthDate = new Date(p.info.nascimento);
            const age = currentSeason - birthDate.getFullYear();
            return age <= 17;
        });
    }

    // 4. Ordena pelo Filtro de Desempenho
    seasonData.sort((a, b) => b[currentFilter] - a[currentFilter]);

    // 5. Define os textos para título e cabeçalho da tabela
    const filterText = {
        pontos: 'Geral (Pontos)',
        cestasFora: 'Cestas de Fora',
        cestasDentro: 'Cestas de Dentro',
        lancesLivres: 'Lances Livres',
    };
    title.textContent = `Ranking ${currentCategory} ${currentSeason}: ${filterText[currentFilter]}`;

    // 6. Gera e insere o HTML da tabela (LÓGICA ATUALIZADA)
    if (seasonData.length === 0) {
        container.innerHTML = '<p>Nenhum dado encontrado para os filtros selecionados.</p>';
        return;
    }
    
    // CABEÇALHO DA TABELA SIMPLIFICADO
    let tableHTML = `
        <table class="ranking-table">
            <thead>
                <tr>
                    <th>Pos.</th>
                    <th class="player-col">Jogador</th>
                    <th>${filterText[currentFilter]}</th>
                </tr>
            </thead>
            <tbody>
    `;

    // LINHAS DA TABELA COM NOVO FORMATO DE JOGADOR E COLUNAS SIMPLIFICADAS
    seasonData.forEach((player, index) => {
        const primeiroNome = player.info.nome.split(' ')[0];
        const nomeExibicao = player.info.apelido ? `${primeiroNome} "${player.info.apelido}"` : primeiroNome;
        const fotoHTML = player.info.foto 
            ? `<img src="${player.info.foto}" alt="${nomeExibicao}" class="player-photo-ranking">`
            : '<div class="player-photo-ranking placeholder">🏀</div>';

        tableHTML += `
            <tr>
                <td>#${index + 1}</td>
                <td class="player-cell">
                    ${fotoHTML}
                    <span>${nomeExibicao}</span>
                </td>
                <td class="main-stat">${player[currentFilter]}</td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    container.innerHTML = tableHTML;
}

/**
 * Função principal que é chamada quando a página de ranking é carregada.
 */
async function loadAndRenderRanking() {
    const container = document.getElementById('ranking-table-container');
    if (!container) return;
    container.innerHTML = '<div class="grid-loader"></div>';

    await fetchData();
    
    // Popula o seletor de temporadas
    const seasonSelect = document.getElementById('season-select');
    const seasons = [...new Set(allGames.map(g => g.dataJogo.substring(0, 4)))].sort((a,b) => b-a);
    seasonSelect.innerHTML = seasons.map(s => `<option value="${s}">${s}</option>`).join('');
    seasonSelect.value = currentSeason;

    render();
}


export function initRanking() {
    document.body.addEventListener('page-loaded', (e) => {
        if (e.detail.page === 'ranking') {
            loadAndRenderRanking();
        }
    });

    // Adiciona listeners para os controles
    document.body.addEventListener('change', (e) => {
        if (e.target.id === 'season-select') {
            currentSeason = e.target.value;
            render();
        }
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.btn-category')) {
            document.querySelectorAll('.btn-category').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            render();
        }
        if (e.target.matches('.btn-filter')) {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            render();
        }
    });
}
