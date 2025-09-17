// js/modules/jogadores.js

import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, addDoc, getDocs, collectionGroup, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
import { openModal, closeModal } from '../components/modal.js';

// --- CONFIGURAÇÃO DO CLOUDINARY ---
const CLOUDINARY_CLOUD_NAME = "dc3l3t1sl";
const CLOUDINARY_UPLOAD_PRESET = "ancb_portal_uploads";
const CLOUDINARY_FOLDER = "jogadores_perfis";

// --- Estado do Módulo ---
let jogadores = [];
let userRole = null;

// --- Elementos do DOM ---
const gridJogadores = document.getElementById('grid-jogadores');
const loaderJogadores = document.querySelector('#tab-jogadores .grid-loader');
const modalJogador = document.getElementById('modal-jogador');
const modalVerJogador = document.getElementById('modal-ver-jogador');
const formJogador = document.getElementById('form-jogador');
const fotoPreview = document.getElementById('preview-foto');
const loadingOverlay = modalJogador.querySelector('.loading-overlay');

// --- Funções de UI e Helpers ---
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

function render() {
    loaderJogadores.style.display = 'none';
    gridJogadores.innerHTML = '';

    if (jogadores.length === 0) {
        gridJogadores.innerHTML = '<p>Nenhum jogador cadastrado.</p>';
        return;
    }

    jogadores.forEach(j => {
        const card = document.createElement('div');
        const isAdmin = userRole === 'admin';
        card.className = `player-card card ${isAdmin ? 'admin-view' : ''}`;
        card.dataset.id = j.id;
        const fotoHTML = j.foto ? `<img src="${j.foto}" alt="${j.nome}">` : `<div class="photo-placeholder">🏀</div>`;
        const actionsHTML = isAdmin ? `<div class="card-actions"><button class="btn-edit-jogador" title="Editar">✏️</button><button class="btn-delete-jogador" title="Excluir">🗑️</button></div>` : '';
        card.innerHTML = `${actionsHTML}<div class="photo-container">${fotoHTML}</div><p class="player-name">${j.nome}</p>`;
        gridJogadores.appendChild(card);
    });
}

function showJogadorModal(id = null) {
    if (userRole !== 'admin') return;
    formJogador.reset();
    fotoPreview.src = '';
    fotoPreview.classList.remove('visible');
    formJogador['documento-id'].value = id || '';

    if (id) {
        const j = jogadores.find(p => p.id === id);
        if (!j) return;
        document.getElementById('modal-jogador-titulo').innerText = 'Editar Jogador';
        formJogador['nome'].value = j.nome;
        formJogador['apelido'].value = j.apelido || '';
        formJogador['cpf'].value = j.cpf;
        formJogador['nascimento'].value = j.nascimento;
        formJogador['posicao'].value = j.posicao;
        formJogador['numero_uniforme'].value = j.numero_uniforme;
        if (j.foto) {
            fotoPreview.src = j.foto;
            fotoPreview.classList.add('visible');
        }
    } else {
        document.getElementById('modal-jogador-titulo').innerText = 'Cadastrar Novo Jogador';
    }
    openModal(modalJogador);
}

async function showFichaJogador(id) {
    const j = jogadores.find(p => p.id === id);
    if (!j) return;

    const fichaContainer = modalVerJogador.querySelector('#ficha-jogador');
    const fotoHTML = j.foto ? `<img src="${j.foto}" alt="${j.nome}">` : '<div class="placeholder">🏀</div>';
    let detailsHTML = `<p><strong>Nome:</strong> ${j.nome}</p>`;
    if (j.apelido) {
        detailsHTML += `<p><strong>Apelido:</strong> ${j.apelido}</p>`;
    }
    detailsHTML += `<p><strong>Posição:</strong> ${j.posicao}</p><p><strong>Nº Uniforme:</strong> ${j.numero_uniforme}</p>`;
    if (userRole === 'admin') {
        detailsHTML += `<p><strong>CPF:</strong> ${j.cpf}</p><p><strong>Nascimento:</strong> ${formatDate(j.nascimento)}</p>`;
    }
    fichaContainer.innerHTML = `${fotoHTML}<div>${detailsHTML}</div>`;

    const statsContainer = modalVerJogador.querySelector('#jogador-estatisticas-container');
    const careerStatsContainer = modalVerJogador.querySelector('#stats-resumo-carreira');
    const eventStatsContainer = modalVerJogador.querySelector('#stats-por-evento');
    
    statsContainer.style.display = 'block';
    careerStatsContainer.innerHTML = '<p class="loading-stats">A carregar estatísticas da carreira...</p>';
    eventStatsContainer.innerHTML = '';

    openModal(modalVerJogador);

    try {
        const todosEventosSnapshot = await getDocs(collection(db, "eventos"));
        const eventosMap = new Map();
        todosEventosSnapshot.forEach(doc => eventosMap.set(doc.id, { nome: doc.data().nome, modalidade: doc.data().modalidade }));

        const cestasQuery = query(collectionGroup(db, 'cestas'), where('jogadorId', '==', id));
        const cestasSnapshot = await getDocs(cestasQuery);

        if (cestasSnapshot.empty) {
            careerStatsContainer.innerHTML = '<p>Este jogador ainda não possui cestas registadas.</p>';
            return;
        }

        const statsPorEvento = {};
        let totalCestasDentro = 0, totalCestasFora = 0, totalLancesLivres = 0, totalPontos = 0;

        cestasSnapshot.forEach(cestaDoc => {
            const cesta = cestaDoc.data();
            const eventoId = cestaDoc.ref.path.split('/')[1]; 
            const eventoInfo = eventosMap.get(eventoId);

            if (!eventoInfo) return; 

            if (!statsPorEvento[eventoId]) {
                statsPorEvento[eventoId] = {
                    nome: eventoInfo.nome || 'Evento Desconhecido',
                    modalidade: eventoInfo.modalidade,
                    cestasDentro: 0, cestasFora: 0, lancesLivres: 0, total: 0
                };
            }

            if (eventoInfo.modalidade === '3x3') {
                if (cesta.pontos === 1) {
                    statsPorEvento[eventoId].cestasDentro++;
                    totalCestasDentro++;
                } else if (cesta.pontos === 2) {
                    statsPorEvento[eventoId].cestasFora++;
                    totalCestasFora++;
                }
            } else { // Assumimos 5x5 como padrão
                 if (cesta.pontos === 1) {
                    statsPorEvento[eventoId].lancesLivres++;
                    totalLancesLivres++;
                } else if (cesta.pontos === 2) {
                    statsPorEvento[eventoId].cestasDentro++;
                    totalCestasDentro++;
                } else if (cesta.pontos === 3) {
                    statsPorEvento[eventoId].cestasFora++;
                    totalCestasFora++;
                }
            }
            statsPorEvento[eventoId].total += cesta.pontos;
            totalPontos += cesta.pontos;
        });

        careerStatsContainer.innerHTML = `
            <div class="stat-summary-item">
                <span class="stat-summary-value">${totalCestasDentro}</span>
                <span class="stat-summary-label">Dentro</span>
            </div>
            <div class="stat-summary-item">
                <span class="stat-summary-value">${totalCestasFora}</span>
                <span class="stat-summary-label">Fora</span>
            </div>
            <div class="stat-summary-item">
                <span class="stat-summary-value">${totalLancesLivres}</span>
                <span class="stat-summary-label">L. Livres</span>
            </div>
             <div class="stat-summary-item">
                <span class="stat-summary-value">${totalPontos}</span>
                <span class="stat-summary-label">Pontos Totais</span>
            </div>
        `;

        let eventHTML = '<h3>Desempenho por Evento</h3>';
        for (const eventoId in statsPorEvento) {
            const stats = statsPorEvento[eventoId];
            const badgeClass = stats.modalidade === '3x3' ? 'badge-3x3' : 'badge-5x5';
            
            let detailsContent = '';
            if (stats.modalidade === '3x3') {
                detailsContent = `
                    <p><strong>Cestas de Dentro (1pt):</strong> ${stats.cestasDentro}</p>
                    <p><strong>Cestas de Fora (2pts):</strong> ${stats.cestasFora}</p>
                `;
            } else {
                detailsContent = `
                    <p><strong>Cestas de Dentro (2pts):</strong> ${stats.cestasDentro}</p>
                    <p><strong>Cestas de Fora (3pts):</strong> ${stats.cestasFora}</p>
                    <p><strong>Lances Livres (1pt):</strong> ${stats.lancesLivres}</p>
                `;
            }
             detailsContent += `<p><strong>Total de Pontos no Evento:</strong> ${stats.total}</p>`;


            eventHTML += `
                <details class="event-stats-item">
                    <summary>
                        <div class="summary-content">
                           <span class="event-stats-name">${stats.nome}</span>
                           <span class="event-modality-badge ${badgeClass}">${stats.modalidade}</span>
                        </div>
                        <span class="event-stats-total">${stats.total} Pts</span>
                    </summary>
                    <div class="event-stats-details">
                        ${detailsContent}
                    </div>
                </details>
            `;
        }
        eventStatsContainer.innerHTML = eventHTML;

    } catch (error) {
        console.error("Erro ao buscar estatísticas do jogador:", error);
        careerStatsContainer.innerHTML = '<p>Ocorreu um erro ao carregar as estatísticas.</p>';
    }
}


async function handleFormSubmit(e) {
    e.preventDefault();
    if (userRole !== 'admin') return;

    const id = formJogador['documento-id'].value;
    const file = formJogador['foto'].files[0];
    const saveButton = formJogador.querySelector('button[type="submit"]');

    loadingOverlay.classList.add('active');
    saveButton.disabled = true;
    saveButton.textContent = 'Salvando...';

    try {
        let imageUrl = null;
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', CLOUDINARY_FOLDER);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Falha no upload da imagem.');
            }

            const data = await response.json();
            imageUrl = data.secure_url;
        }

        const dados = {
            nome: formJogador['nome'].value,
            apelido: formJogador['apelido'].value,
            cpf: formJogador['cpf'].value,
            nascimento: formJogador['nascimento'].value,
            posicao: formJogador['posicao'].value,
            numero_uniforme: formJogador['numero_uniforme'].value,
        };

        if (imageUrl) {
            dados.foto = imageUrl;
        }

        if (id) {
            await updateDoc(doc(db, "jogadores", id), dados);
        } else {
            await addDoc(collection(db, "jogadores"), dados);
        }

        closeModal(modalJogador);
    } catch (error) {
        console.error("Erro ao salvar jogador: ", error);
        alert("Não foi possível salvar os dados do jogador. Verifique o console para mais detalhes.");
    } finally {
        loadingOverlay.classList.remove('active');
        saveButton.disabled = false;
        saveButton.textContent = 'Salvar';
    }
}


async function deleteJogador(id) {
    if (userRole !== 'admin') return;
    if (confirm('Tem certeza que deseja excluir este jogador?')) {
        try {
            await deleteDoc(doc(db, "jogadores", id));
        } catch (error) {
            alert("Não foi possível excluir o jogador.");
        }
    }
}

export function getJogadores() {
    return [...jogadores].sort((a, b) => a.nome.localeCompare(b.nome));
}

export function setJogadoresUserRole(role) {
    userRole = role;
    render();
}

export function initJogadores() {
    loaderJogadores.style.display = 'block';
    onSnapshot(query(collection(db, "jogadores"), orderBy("nome")), (snapshot) => {
        jogadores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render();
    });

    gridJogadores.addEventListener('click', (e) => {
        const card = e.target.closest('.player-card');
        if (!card) return;
        const id = card.dataset.id;
        if (e.target.closest('.btn-edit-jogador')) {
            showJogadorModal(id);
        } else if (e.target.closest('.btn-delete-jogador')) {
            deleteJogador(id);
        } else {
            showFichaJogador(id);
        }
    });
    
    formJogador.addEventListener('submit', handleFormSubmit);
    document.getElementById('btn-abrir-modal-jogador').addEventListener('click', () => showJogadorModal());
}

