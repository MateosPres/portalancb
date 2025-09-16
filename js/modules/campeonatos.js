// js/modules/campeonatos.js
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
import { openModal, closeModal } from '../components/modal.js';
import { getJogadores } from './jogadores.js';

let campeonatos = [];
let userRole = null;

const gridCampeonatos = document.getElementById('grid-campeonatos');
const modalCampeonato = document.getElementById('modal-campeonato');
const modalVerCampeonato = document.getElementById('modal-ver-campeonato');
const formCampeonato = document.getElementById('form-campeonato');

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

function render() {
    gridCampeonatos.innerHTML = '';
    campeonatos.forEach(c => {
        const card = document.createElement('div');
        const isAdmin = userRole === 'admin';
        card.className = `championship-card card ${isAdmin ? 'admin-view' : ''}`;
        card.dataset.id = c.id;

        // LINHA CORRIGIDA E GARANTIDA:
        // A sintaxe dos dois botões está idêntica à do módulo de jogadores.
        const actionsHTML = isAdmin ? `<div class="card-actions"><button class="btn-edit-camp" title="Editar">✏️</button><button class="btn-delete-camp" title="Excluir">🗑️</button></div>` : '';
        
        card.innerHTML = `${actionsHTML}<div><h3 class="championship-name">${c.nome}</h3><div class="championship-info"><p>📅 <strong>Data:</strong> ${formatDate(c.data)}</p><p>👥 <strong>Jogadores:</strong> ${c.jogadoresEscalados?.length || 0} escalado(s)</p></div></div>`;
        gridCampeonatos.appendChild(card);
    });
}

function showCampeonatoModal(id = null) {
    if (userRole !== 'admin') return;
    formCampeonato.reset();
    formCampeonato['campeonato-id'].value = id || '';
    let escalados = [];

    if (id) {
        const c = campeonatos.find(i => i.id === id);
        if (!c) return;
        document.getElementById('modal-campeonato-titulo').innerText = 'Editar Campeonato';
        formCampeonato['campeonato-nome'].value = c.nome;
        formCampeonato['campeonato-data'].value = c.data;
        escalados = c.jogadoresEscalados || [];
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

function showFichaCampeonato(id) {
    const camp = campeonatos.find(c => c.id === id);
    if (!camp) return;
    document.getElementById('ver-campeonato-titulo').innerText = camp.nome;
    document.getElementById('ver-campeonato-data').innerText = `Data: ${formatDate(camp.data)}`;
    const container = document.getElementById('escalacao-container');
    container.innerHTML = '<p>Carregando escalação...</p>';
    
    if (!camp.jogadoresEscalados || camp.jogadoresEscalados.length === 0) {
        container.innerHTML = '<p>Nenhum jogador escalado.</p>';
    } else {
        const todosJogadores = getJogadores();
        container.innerHTML = ''; // Limpa antes de adicionar
        camp.jogadoresEscalados.forEach(jogadorId => {
            const j = todosJogadores.find(p => p.id === jogadorId);
            if (j) {
                const fotoHTML = j.foto ? `<img src="${j.foto}" alt="${j.nome}">` : `<div class="placeholder">🏀</div>`;
                container.innerHTML += `<div class="jogador-escalado">${fotoHTML}<div class="info"><strong>${j.nome}</strong><br><span>#${j.numero_uniforme} - ${j.posicao}</span></div></div>`;
            }
        });
    }
    openModal(modalVerCampeonato);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (userRole !== 'admin') return;
    const id = formCampeonato['campeonato-id'].value;
    const jogadoresEscalados = Array.from(document.querySelectorAll('#lista-jogadores-escalar input:checked')).map(input => input.value);
    const dados = {
        nome: formCampeonato['campeonato-nome'].value,
        data: formCampeonato['campeonato-data'].value,
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
        alert("Não foi possível salvar o campeonato.");
    }
}

async function deleteCampeonato(id) {
    if (userRole !== 'admin') return;
    if (confirm('Tem certeza que deseja excluir este campeonato?')) {
        try {
            await deleteDoc(doc(db, "campeonatos", id));
        } catch (error) {
            alert("Não foi possível excluir o campeonato.");
        }
    }
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

    formCampeonato.addEventListener('submit', handleFormSubmit);
    document.getElementById('btn-abrir-modal-campeonato').addEventListener('click', () => showCampeonatoModal());
}