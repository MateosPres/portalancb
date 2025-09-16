// js/modules/jogadores.js (Com Lógica de Upload)

import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
import { openModal, closeModal } from '../components/modal.js';

// --- CONFIGURAÇÃO DO CLOUDINARY ---
// SUBSTITUA COM SEUS DADOS REAIS
const CLOUDINARY_CLOUD_NAME = "dc3l3t1sl"; // <<<<<<< COLOQUE SEU CLOUD NAME AQUI
const CLOUDINARY_UPLOAD_PRESET = "ancb_portal_uploads"; // <<<<<<< COLOQUE O NOME DO SEU PRESET AQUI
const CLOUDINARY_FOLDER = "jogadores_perfis"; // Opcional: mesma pasta que você configurou no preset

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

// Em js/modules/jogadores.js

function render() {
    loaderJogadores.style.display = 'none';  // some o loader quando termina
    gridJogadores.innerHTML = ''; // Limpa o conteúdo (inclusive o spinner)

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

function showFichaJogador(id) {
    const j = jogadores.find(p => p.id === id);
    if (!j) return;
    const fichaContainer = modalVerJogador.querySelector('#ficha-jogador');
    const fotoHTML = j.foto ? `<img src="${j.foto}" alt="${j.nome}">` : '<div class="placeholder">🏀</div>';
    let detailsHTML = `<p><strong>Nome:</strong> ${j.nome}</p><p><strong>Posição:</strong> ${j.posicao}</p><p><strong>Nº Uniforme:</strong> ${j.numero_uniforme}</p>`;
    if (userRole === 'admin') {
        detailsHTML += `<p><strong>CPF:</strong> ${j.cpf}</p><p><strong>Nascimento:</strong> ${formatDate(j.nascimento)}</p>`;
    }
    fichaContainer.innerHTML = `${fotoHTML}<div>${detailsHTML}</div>`;
    openModal(modalVerJogador);
}

// --- LÓGICA DE UPLOAD E SUBMISSÃO DO FORMULÁRIO (ATUALIZADA) ---
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
        // Passo 1: Se um arquivo foi selecionado, faça o upload para o Cloudinary
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
            imageUrl = data.secure_url; // URL segura da imagem
        }

        // Passo 2: Monte o objeto de dados para salvar no Firestore
        const dados = {
            nome: formJogador['nome'].value,
            cpf: formJogador['cpf'].value,
            nascimento: formJogador['nascimento'].value,
            posicao: formJogador['posicao'].value,
            numero_uniforme: formJogador['numero_uniforme'].value,
        };

        // Adiciona a URL da foto apenas se uma nova foi enviada
        // Se não, mantém a foto antiga (não a sobrescreve com null)
        if (imageUrl) {
            dados.foto = imageUrl;
        }

        // Passo 3: Salve os dados no Firestore
        if (id) {
            await updateDoc(doc(db, "jogadores", id), dados);
        } else {
            // Se for um novo jogador, é preciso garantir que a foto foi enviada.
            if (!dados.foto) { 
                // Se for obrigatório, podemos lançar um erro.
                // Por enquanto, vamos permitir criar sem foto.
            }
            await addDoc(collection(db, "jogadores"), dados);
        }

        closeModal(modalJogador);
    } catch (error) {
        console.error("Erro ao salvar jogador: ", error);
        alert("Não foi possível salvar os dados do jogador. Verifique o console para mais detalhes.");
    } finally {
        // Garante que o loading e o botão voltem ao normal, mesmo se der erro
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

// --- Funções Públicas (Exportadas) ---
export function getJogadores() {
    return [...jogadores].sort((a, b) => a.nome.localeCompare(b.nome));
}

export function setJogadoresUserRole(role) {
    userRole = role;
    render();
}

export function initJogadores() {
    loaderJogadores.style.display = 'block'; // mostra o loader
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