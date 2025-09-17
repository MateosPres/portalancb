// js/modules/eventos.js (VERSÃO FINAL E CORRIGIDA)

import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, addDoc, getDocs, getDoc, where, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
import { openModal, closeModal } from '../components/modal.js';
import { getJogadores } from './jogadores.js';
import { abrirPainelJogo } from './painelJogo.js';

// --- CONFIGURAÇÃO DO CLOUDINARY (ASSUMIDO DO FICHEIRO jogadores.js) ---
const CLOUDINARY_CLOUD_NAME = "dc3l3t1sl";
const CLOUDINARY_UPLOAD_PRESET = "ancb_portal_uploads";
const CLOUDINARY_FOLDER_TIMES = "times_logos"; // Nova pasta para os logos dos times

let eventos = [];
let userRole = null;
let currentEventoId = null;

// --- Elementos do DOM (ATUALIZADO) ---
const tabEventos = document.getElementById('tab-eventos');
const gridEventosAndamento = document.getElementById('grid-eventos-andamento');
const gridEventosProximos = document.getElementById('grid-eventos-proximos');
const gridEventosHistorico = document.getElementById('grid-eventos-historico');

const modalEvento = document.getElementById('modal-evento');
const modalVerEvento = document.getElementById('modal-ver-campeonato');
const formEvento = document.getElementById('form-evento');
const modalJogo = document.getElementById('modal-jogo');
const formJogo = document.getElementById('form-jogo');
const modalTime = document.getElementById('modal-time');
const formTime = document.getElementById('form-time');
const previewLogoTime = document.getElementById('preview-logo-time');
const modalVerTime = document.getElementById('modal-ver-time');
const modalJogoInterno = document.getElementById('modal-jogo-interno');
const formJogoInterno = document.getElementById('form-jogo-interno');

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

// --- FUNÇÃO DE RENDERIZAÇÃO DE CARD (HELPER) ---
function renderEventCard(evento) {
    const isAdmin = userRole === 'admin';
    const status = evento.status || 'proximo';

    // Badge de Status
    let statusBadge = '';
    if (status === 'andamento') {
        statusBadge = '<span class="status-badge andamento">Em Andamento</span>';
    } else if (status === 'finalizado') {
        statusBadge = '<span class="status-badge finalizado">Finalizado</span>';
    }

    // Ações de mudança de status para Admin
    let statusActionsHTML = '';
    if (isAdmin) {
        if (status === 'proximo') {
            statusActionsHTML = `<button class="btn-status-change start" data-action="start" title="Iniciar Evento">Iniciar</button>`;
        } else if (status === 'andamento') {
            statusActionsHTML = `<button class="btn-status-change finish" data-action="finish" title="Finalizar Evento">Finalizar</button>`;
        }
    }

    const actionsHTML = isAdmin ? `
        <div class="card-actions">
            ${statusActionsHTML}
            <button class="btn-edit-camp" title="Editar">✏️</button>
            <button class="btn-delete-camp" title="Excluir">🗑️</button>
        </div>` : '';

    let infoLine = '';
    if (evento.type === 'torneio_externo') {
        infoLine = `<p><strong>Tipo:</strong> Torneio Externo</p><p>👥 <strong>Jogadores:</strong> ${evento.jogadoresEscalados?.length || 0}</p>`;
    } else if (evento.type === 'torneio_interno') {
        infoLine = `<p><strong>Tipo:</strong> Torneio Interno</p>`;
    } else if (evento.type === 'amistoso') {
        infoLine = `<p><strong>Tipo:</strong> Jogo Amistoso</p><p><strong>Adversário:</strong> ${evento.adversario || 'N/D'}</p>`;
    }
    const badgeClass = evento.modalidade === '3x3' ? 'badge-3x3' : 'badge-5x5';

    return `
        <div class="championship-card card ${isAdmin ? 'admin-view' : ''}" data-id="${evento.id}">
            <div>
                ${statusBadge}
                <span class="championship-type-badge ${badgeClass}">${evento.modalidade || '5x5'}</span>
                <h3 class="championship-name">${evento.nome}</h3>
                <div class="championship-info">
                    <p>📅 <strong>Data:</strong> ${formatDate(evento.data)}</p>
                    ${infoLine}
                </div>
            </div>
            ${actionsHTML}
        </div>`;
}


function render() {
    // Separa os eventos por status
    const eventosAndamento = eventos.filter(e => e.status === 'andamento');
    const eventosProximos = eventos.filter(e => !e.status || e.status === 'proximo');
    const eventosHistorico = eventos.filter(e => e.status === 'finalizado');

    // Renderiza cada seção
    gridEventosAndamento.innerHTML = eventosAndamento.length > 0
        ? eventosAndamento.map(renderEventCard).join('')
        : '<p class="empty-message">Nenhum evento em andamento no momento.</p>';

    gridEventosProximos.innerHTML = eventosProximos.length > 0
        ? eventosProximos.map(renderEventCard).join('')
        : '<p class="empty-message">Nenhum próximo evento agendado.</p>';

    gridEventosHistorico.innerHTML = eventosHistorico.length > 0
        ? eventosHistorico.map(renderEventCard).join('')
        : '<p class="empty-message">Nenhum evento no histórico.</p>';
}

async function changeEventoStatus(id, newStatus) {
    if (userRole !== 'admin' || !id || !newStatus) return;
    const statusText = newStatus === 'andamento' ? 'iniciar' : 'finalizar';
    if (confirm(`Tem certeza que deseja ${statusText} este evento?`)) {
        try {
            await updateDoc(doc(db, "eventos", id), { status: newStatus });
            // O listener onSnapshot irá atualizar a UI automaticamente
        } catch (error) {
            console.error("Erro ao alterar status do evento:", error);
            alert("Não foi possível alterar o status do evento.");
        }
    }
}


async function showEventoModal(id = null) {
    if (userRole !== 'admin') return;
    const step1 = document.getElementById('evento-step-1');
    const step2 = document.getElementById('evento-step-2');
    const secaoTimes = document.getElementById('secao-gerenciar-times');
    const camposExterno = document.querySelectorAll('.campo-torneio-externo');
    const camposAmistoso = document.querySelectorAll('.campo-amistoso');
    const hideAllSpecificFields = () => {
        secaoTimes.style.display = 'none';
        camposExterno.forEach(el => el.style.display = 'none');
        camposAmistoso.forEach(el => el.style.display = 'none');
    };
    formEvento.reset();
    formEvento['evento-id'].value = '';
    if (id) {
        const evento = eventos.find(i => i.id === id);
        if (!evento) return;
        step1.style.display = 'none';
        step2.style.display = 'block';
        hideAllSpecificFields();
        formEvento['evento-id'].value = id;
        formEvento['evento-type'].value = evento.type;
        formEvento['evento-nome'].value = evento.nome;
        formEvento['evento-data'].value = evento.data;
        formEvento['evento-modalidade'].value = evento.modalidade;
        document.getElementById('modal-evento-titulo').innerText = 'Editar Evento';
        if (evento.type === 'torneio_interno') {
            secaoTimes.style.display = 'block';
            document.getElementById('btn-adicionar-time').style.display = 'block';
            document.getElementById('btn-adicionar-time').onclick = () => showTimeModal(id);
            renderTimesList(id);
        } else if (evento.type === 'torneio_externo') {
            camposExterno.forEach(el => el.style.display = 'block');
        } else if (evento.type === 'amistoso') {
            camposAmistoso.forEach(el => el.style.display = 'block');
            formEvento['evento-adversario'].value = evento.adversario || '';
        }
    } else {
        hideAllSpecificFields();
        step1.style.display = 'block';
        step2.style.display = 'none';
        document.getElementById('modal-evento-titulo').innerText = 'Adicionar Novo Evento';
    }
    document.querySelectorAll('.event-type-btn').forEach(btn => {
        btn.onclick = () => {
            const type = btn.dataset.type;
            formEvento['evento-type'].value = type;
            step1.style.display = 'none';
            step2.style.display = 'block';
            hideAllSpecificFields();
            if (type === 'torneio_externo') {
                camposExterno.forEach(el => el.style.display = 'block');
                document.getElementById('modal-evento-titulo').innerText = 'Adicionar Torneio Externo';
            } else if (type === 'amistoso') {
                camposAmistoso.forEach(el => el.style.display = 'block');
                document.getElementById('modal-evento-titulo').innerText = 'Adicionar Jogo Amistoso';
            } else if (type === 'torneio_interno') {
                secaoTimes.style.display = 'block';
                document.getElementById('btn-adicionar-time').style.display = 'none';
                document.getElementById('modal-evento-titulo').innerText = 'Adicionar Torneio Interno';
            }
        }
    });
    const listaContainer = document.getElementById('lista-jogadores-escalar');
    listaContainer.innerHTML = '';
    const todosJogadores = getJogadores();
    todosJogadores.forEach(j => {
        listaContainer.innerHTML += `<label class="checkbox-item"><input type="checkbox" value="${j.id}"><span>${j.nome} (#${j.numero_uniforme})</span></label>`;
    });
    openModal(modalEvento);
}

async function handleFormSubmitEvento(e) {
    e.preventDefault();
    if (userRole !== 'admin') return;
    let id = formEvento['evento-id'].value;
    const type = formEvento['evento-type'].value;
    const jogadoresEscalados = Array.from(document.querySelectorAll('#lista-jogadores-escalar input:checked')).map(input => input.value);
    const dados = {
        nome: formEvento['evento-nome'].value,
        data: formEvento['evento-data'].value,
        modalidade: formEvento['evento-modalidade'].value,
        type: type,
        status: id ? eventos.find(ev => ev.id === id).status || 'proximo' : 'proximo' // Mantém status se editando, ou 'proximo' se novo
    };
    if (type === 'torneio_externo' || type === 'amistoso') {
        dados.jogadoresEscalados = jogadoresEscalados;
    }
    if (type === 'amistoso') {
        dados.adversario = formEvento['evento-adversario'].value;
        dados.placarANCB_final = 0;
        dados.placarAdversario_final = 0;
    }
    try {
        if (id) {
            await updateDoc(doc(db, "eventos", id), dados);
        } else {
            const docRef = await addDoc(collection(db, "eventos"), dados);
            id = docRef.id;
        }
        if (type === 'torneio_interno') {
            formEvento['evento-id'].value = id;
            document.getElementById('secao-gerenciar-times').style.display = 'block';
            const btnAddTime = document.getElementById('btn-adicionar-time');
            btnAddTime.style.display = 'block';
            btnAddTime.onclick = () => showTimeModal(id);
            await renderTimesList(id);
        } else {
            closeModal(modalEvento);
        }
    } catch (error) {
        console.error("Erro ao salvar evento: ", error);
        alert("Não foi possível salvar o evento.");
    }
}

async function deleteEvento(id) {
    if (userRole !== 'admin') return;
    if (confirm('Tem certeza que deseja excluir este evento e TODOS os seus jogos?')) {
        try {
            await deleteDoc(doc(db, "eventos", id));
            closeModal(modalVerEvento);
        } catch (error) {
            alert("Não foi possível excluir o evento.");
        }
    }
}

async function renderTimesList(eventoId, isPublicView = false) {
    const containerId = isPublicView ? 'times-container-view' : 'lista-de-times';
    const listaContainer = document.getElementById(containerId);
    if (!listaContainer) return;
    listaContainer.innerHTML = 'A carregar times...';
    const timesRef = collection(db, "eventos", eventoId, "times");
    const snapshot = await getDocs(query(timesRef, orderBy("nomeTime")));
    if (snapshot.empty) {
        listaContainer.innerHTML = '<p>Nenhum time adicionado a este torneio.</p>';
        return;
    }
    listaContainer.innerHTML = '';
    snapshot.forEach(doc => {
        const time = { id: doc.id, ...doc.data() };
        const logoHTML = time.logoUrl 
            ? `<img src="${time.logoUrl}" alt="${time.nomeTime}" class="item-logo">` 
            : `<div class="item-logo-placeholder">🏀</div>`;

        if (isPublicView) {
            listaContainer.innerHTML += `
                <div class="time-item-view clickable" data-time-id="${time.id}" data-evento-id="${eventoId}">
                    ${logoHTML}
                    <div class="time-item-header">
                        <h4>${time.nomeTime}</h4>
                        <p>${time.jogadores?.length || 0} jogadores</p>
                    </div>
                </div>
            `;
        } else { // Na vista de edição
            const item = document.createElement('div');
            item.className = 'game-list-item';
            item.innerHTML = `
                ${logoHTML}
                <span><strong>${time.nomeTime}</strong> (${time.jogadores?.length || 0} jogadores)</span>
                <div class="game-item-actions">
                    <button class="btn-edit-time btn-sm" title="Editar Time">✏️</button>
                    <button class="btn-delete-time btn-sm" title="Excluir Time">🗑️</button>
                </div>
            `;
            item.querySelector('.btn-edit-time').addEventListener('click', () => showTimeModal(eventoId, time.id));
            item.querySelector('.btn-delete-time').addEventListener('click', () => deleteTime(eventoId, time.id));
            listaContainer.appendChild(item);
        }
    });
}

async function showTimeModal(eventoId, timeId = null) {
    formTime.reset();
    previewLogoTime.src = '';
    previewLogoTime.style.display = 'none';
    currentEventoId = eventoId;
    formTime['time-id'].value = timeId || '';

    const listaJogadoresContainer = document.getElementById('lista-jogadores-escalar-time');
    listaJogadoresContainer.innerHTML = 'A carregar jogadores...';

    let jogadoresDoTime = [];
    if (timeId) {
        document.getElementById('modal-time-titulo').innerText = 'Editar Time';
        const timeRef = doc(db, "eventos", eventoId, "times", timeId);
        const timeDoc = await getDoc(timeRef);
        if (timeDoc.exists()) {
            const time = timeDoc.data();
            formTime['time-nome'].value = time.nomeTime;
            jogadoresDoTime = time.jogadores || [];
            // Mostra o logo existente
            if (time.logoUrl) {
                previewLogoTime.src = time.logoUrl;
                previewLogoTime.style.display = 'block';
            }
        }
    } else {
        document.getElementById('modal-time-titulo').innerText = 'Adicionar Time';
    }
    listaJogadoresContainer.innerHTML = '';
    const todosJogadores = getJogadores();
    todosJogadores.forEach(j => {
        const checked = jogadoresDoTime.includes(j.id) ? 'checked' : '';
        listaJogadoresContainer.innerHTML += `<label class="checkbox-item"><input type="checkbox" value="${j.id}" ${checked}><span>${j.nome}</span></label>`;
    });
    openModal(modalTime);
}

async function handleFormTimeSubmit(e) {
    e.preventDefault();
    if (!currentEventoId) return;

    const timeId = formTime['time-id'].value;
    const file = formTime['time-logo'].files[0];
    let logoUrl = null;

    try {
        // Passo 1: Se um ficheiro de logo foi selecionado, faz o upload para o Cloudinary
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', CLOUDINARY_FOLDER_TIMES);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Falha no upload da imagem.');
            
            const data = await response.json();
            logoUrl = data.secure_url;
        }

        // Passo 2: Monta o objeto de dados para salvar no Firestore
        const jogadoresSelecionados = Array.from(document.querySelectorAll('#lista-jogadores-escalar-time input:checked')).map(input => input.value);
        const dadosTime = {
            nomeTime: formTime['time-nome'].value,
            jogadores: jogadoresSelecionados
        };

        // Adiciona a URL do logo apenas se um novo foi enviado
        if (logoUrl) {
            dadosTime.logoUrl = logoUrl;
        }

        // Passo 3: Salva no Firestore
        const timesRef = collection(db, "eventos", currentEventoId, "times");
        if (timeId) {
            await setDoc(doc(timesRef, timeId), dadosTime, { merge: true }); // Merge true para não apagar o logo antigo se nenhum novo for enviado
        } else {
            await addDoc(timesRef, dadosTime);
        }

        closeModal(modalTime);
        renderTimesList(currentEventoId);
    } catch (error) {
        console.error("Erro ao salvar time:", error);
        alert("Não foi possível salvar o time.");
    }
}

async function deleteTime(eventoId, timeId) {
    if (confirm('Tem certeza que deseja excluir este time?')) {
        try {
            await deleteDoc(doc(db, "eventos", eventoId, "times", timeId));
            renderTimesList(eventoId);
        } catch (error) {
            console.error("Erro ao excluir time:", error);
            alert("Não foi possível excluir o time.");
        }
    }
}

async function handleFormSubmitJogo(e) {
    e.preventDefault();
    if (userRole !== 'admin') return;
    const eventoId = formJogo['jogo-campeonato-id'].value;
    const jogoId = formJogo['jogo-id'].value;
    const evento = eventos.find(c => c.id === eventoId);
    const loadingOverlay = modalJogo.querySelector('.loading-overlay');
    loadingOverlay.classList.add('active');
    const adversarioNome = formJogo['jogo-adversario'].value;
    let dadosJogo = { dataJogo: formJogo['jogo-data'].value, adversario: adversarioNome };
    try {
        if (jogoId) {
            const jogoRef = doc(db, "eventos", eventoId, "jogos", jogoId);
            await updateDoc(jogoRef, dadosJogo);
            closeModal(modalJogo);
            showFichaEvento(eventoId);
        } else {
            dadosJogo.placarANCB_final = 0;
            dadosJogo.placarAdversario_final = 0;
            const jogoRef = await addDoc(collection(db, "eventos", eventoId, "jogos"), dadosJogo);
            const effectiveJogoId = jogoRef.id;
            closeModal(modalJogo);
            closeModal(modalVerEvento);
            setTimeout(() => {
                abrirPainelJogo(evento, { id: effectiveJogoId, ...dadosJogo });
            }, 300);
        }
    } catch (error) {
        console.error("Erro ao salvar jogo: ", error);
        alert("Não foi possível salvar os dados do jogo.");
    } finally {
        loadingOverlay.classList.remove('active');
    }
}

async function deleteJogo(eventoId, jogoId) {
    if (userRole !== 'admin') return;
    if (confirm('Tem certeza que deseja excluir este jogo?')) {
        try {
            await deleteDoc(doc(db, "eventos", eventoId, "jogos", jogoId));
            if (modalVerEvento.classList.contains('active')) {
                showFichaEvento(eventoId);
            }
            if (modalEvento.classList.contains('active')) {
                renderJogosList(eventoId);
            }
        } catch (error) {
            alert("Não foi possível excluir o jogo.");
        }
    }
}

async function showJogoModal(eventoId, jogoId = null) {
    formJogo.reset();
    formJogo['jogo-campeonato-id'].value = eventoId;
    formJogo['jogo-id'].value = jogoId || '';
    if (jogoId) {
        document.getElementById('modal-jogo-titulo').innerText = 'Editar Jogo';
        const jogoRef = doc(db, "eventos", eventoId, "jogos", jogoId);
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

async function renderJogosList(eventoId) {
    const listaJogosContainer = document.getElementById('lista-de-jogos');
    if(!listaJogosContainer) return;
    listaJogosContainer.innerHTML = 'A carregar jogos...';
    const evento = eventos.find(c => c.id === eventoId);
    if (!evento) return;
    const jogosRef = collection(db, "eventos", eventoId, "jogos");
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
        item.querySelector('.btn-painel-jogo').addEventListener('click', () => abrirPainelJogo(userRole, evento, jogo));
        item.querySelector('.btn-edit-jogo').addEventListener('click', () => showJogoModal(eventoId, jogo.id));
        item.querySelector('.btn-delete-jogo').addEventListener('click', () => deleteJogo(eventoId, jogo.id));
        listaJogosContainer.appendChild(item);
    });
}

async function showFichaEvento(id) {
    const evento = eventos.find(e => e.id === id);
    if (!evento) return;
    document.getElementById('ver-campeonato-titulo').innerText = evento.nome;
    document.getElementById('ver-campeonato-data').innerText = `Data: ${formatDate(evento.data)}`;
    document.getElementById('ver-campeonato-tabs-nav').innerHTML = '';
    document.getElementById('ver-campeonato-tabs-content').innerHTML = '';
    if (evento.type === 'torneio_externo' || evento.type === 'amistoso') {
        await renderFichaExterno(evento);
    } else if (evento.type === 'torneio_interno') {
        await renderFichaInterno(evento);
    }
    openModal(modalVerEvento);
}

function renderEscalacao(evento) {
    const container = document.getElementById('escalacao-container');
    if (!container) return;
    container.innerHTML = '';
    if (!evento.jogadoresEscalados || evento.jogadoresEscalados.length === 0) {
        container.innerHTML = '<p>Nenhum jogador escalado.</p>';
        return;
    }
    const todosJogadores = getJogadores();
    evento.jogadoresEscalados.forEach(jogadorId => {
        const j = todosJogadores.find(p => p.id === jogadorId);
        if (j) {
            const fotoHTML = j.foto ? `<img src="${j.foto}" alt="${j.nome}">` : `<div class="placeholder">🏀</div>`;
            container.innerHTML += `<div class="jogador-escalado">${fotoHTML}<div class="info"><strong>${j.nome}</strong><br><span>#${j.numero_uniforme} - ${j.posicao}</span></div></div>`;
        }
    });
}

async function renderFichaExterno(evento) {
    const navContainer = document.getElementById('ver-campeonato-tabs-nav');
    const contentContainer = document.getElementById('ver-campeonato-tabs-content');
    navContainer.innerHTML = `
        <button class="tab-like-btn active" data-target="tab-jogos">Jogos</button>
        <button class="tab-like-btn" data-target="tab-classificacao">Classificação</button>
        <button class="tab-like-btn" data-target="tab-escalacao">Escalação</button>
    `;
    contentContainer.innerHTML = `
        <div id="tab-jogos" class="tab-like-content active">
             <div class="section-header-inline">
                <h3>Jogos Realizados</h3>
                <button id="btn-add-game-from-view" class="btn btn-primary">Adicionar Jogo</button>
            </div>
            <div id="jogos-realizados-container"></div>
        </div>
        <div id="tab-classificacao" class="tab-like-content">
             <h3>Classificação de Pontos (Artilheiros)</h3>
             <div id="classificacao-container"></div>
        </div>
        <div id="tab-escalacao" class="tab-like-content">
             <h3>Jogadores Escalados</h3>
             <div id="escalacao-container"></div>
        </div>
    `;
    const btnAddGame = document.getElementById('btn-add-game-from-view');
    if (btnAddGame) {
        if (userRole === 'admin') {
            btnAddGame.style.display = 'inline-flex';
            btnAddGame.onclick = () => {
                closeModal(modalVerEvento);
                showJogoModal(evento.id);
            };
        } else {
            btnAddGame.style.display = 'none';
        }
    }
    setupTabEventListeners();
    renderEscalacao(evento);
    await renderJogosEClassificacao(evento.id);
}

async function renderFichaInterno(evento) {
    const navContainer = document.getElementById('ver-campeonato-tabs-nav');
    const contentContainer = document.getElementById('ver-campeonato-tabs-content');
    navContainer.innerHTML = `
        <button class="tab-like-btn active" data-target="tab-jogos-interno">Jogos</button>
        <button class="tab-like-btn" data-target="tab-times-interno">Times</button>
        <button class="tab-like-btn" data-target="tab-classificacao-interno">Classificação Geral</button>
    `;
    contentContainer.innerHTML = `
        <div id="tab-jogos-interno" class="tab-like-content active">
             <div class="section-header-inline">
                <h3>Jogos do Torneio</h3>
                ${userRole === 'admin' ? '<button id="btn-add-jogo-interno" class="btn btn-primary">Adicionar Jogo</button>' : ''}
            </div>
            <div id="jogos-internos-container">A carregar jogos...</div>
        </div>
        <div id="tab-times-interno" class="tab-like-content">
             <div id="times-container-view">A carregar times...</div>
        </div>
        <div id="tab-classificacao-interno" class="tab-like-content"></div>
    `;
    if (userRole === 'admin') {
        const btnAddJogoInterno = document.getElementById('btn-add-jogo-interno');
        if(btnAddJogoInterno) btnAddJogoInterno.onclick = () => showJogoInternoModal(evento.id);
    }
    setupTabEventListeners();
    await renderTimesList(evento.id, true);
    await renderJogosInternosList(evento.id);
    await renderClassificacaoGeralInterno(evento);
}

async function showFichaTime(eventoId, timeId) {
    const timeRef = doc(db, "eventos", eventoId, "times", timeId);
    const timeDoc = await getDoc(timeRef);
    if (!timeDoc.exists()) return;
    const time = timeDoc.data();
    const todosJogadores = getJogadores();
    document.getElementById('ver-time-nome').textContent = time.nomeTime;
    const elencoContainer = document.getElementById('ver-time-elenco-container');
    elencoContainer.innerHTML = '';
    if (time.jogadores && time.jogadores.length > 0) {
        time.jogadores.forEach(jogadorId => {
            const jogadorInfo = todosJogadores.find(j => j.id === jogadorId);
            if (jogadorInfo) {
                const fotoHTML = jogadorInfo.foto ? `<img src="${jogadorInfo.foto}" alt="${jogadorInfo.nome}">` : `<div class="placeholder">🏀</div>`;
                elencoContainer.innerHTML += `
                    <div class="jogador-escalado">
                        ${fotoHTML}
                        <div class="info">
                            <strong>${jogadorInfo.nome}</strong><br>
                            <span>#${jogadorInfo.numero_uniforme} - ${jogadorInfo.posicao}</span>
                        </div>
                    </div>`;
            }
        });
    } else {
        elencoContainer.innerHTML = '<p>Nenhum jogador escalado neste time.</p>';
    }
    openModal(modalVerTime);
}

async function renderJogosInternosList(eventoId) {
    const container = document.getElementById('jogos-internos-container');
    if (!container) return;
    container.innerHTML = 'A carregar jogos...';

    const jogosRef = collection(db, "eventos", eventoId, "jogos");
    const snapshot = await getDocs(query(jogosRef, orderBy("dataJogo", "desc")));

    if (snapshot.empty) {
        container.innerHTML = '<p>Nenhum jogo registado para este torneio.</p>';
        return;
    }

    // Passo 1: Agrupar os jogos por data
    const jogosAgrupados = {};
    snapshot.forEach(jogoDoc => {
        const jogo = { id: jogoDoc.id, ...jogoDoc.data() };
        const dataJogo = jogo.dataJogo; // Formato "AAAA-MM-DD"
        if (!jogosAgrupados[dataJogo]) {
            jogosAgrupados[dataJogo] = [];
        }
        jogosAgrupados[dataJogo].push(jogo);
    });

    // Passo 2: Gerar o HTML a partir dos grupos
    container.innerHTML = '';
    const datasOrdenadas = Object.keys(jogosAgrupados).sort((a, b) => new Date(b) - new Date(a)); // Ordena as datas

    datasOrdenadas.forEach(data => {
        // Adiciona o cabeçalho da data
        container.innerHTML += `<div class="game-date-header">${formatDate(data)}</div>`;
        
        // Adiciona os jogos dessa data
        jogosAgrupados[data].forEach(jogo => {
            const adminDeleteButton = userRole === 'admin' 
                ? `<div class="game-item-actions-view">
                     <button class="btn-delete-jogo-interno" data-evento-id="${eventoId}" data-jogo-id="${jogo.id}" title="Excluir Jogo">🗑️</button>
                   </div>` 
                : '';

            container.innerHTML += `
                <div class="jogo-realizado-item clickable" data-evento-id="${eventoId}" data-jogo-id="${jogo.id}">
                    <div class="jogo-info">
                        <span class="team-name team-a">${jogo.timeA_nome}</span>
                        <span class="score">${jogo.placarTimeA_final || 0} x ${jogo.placarTimeB_final || 0}</span>
                        <span class="team-name team-b">${jogo.timeB_nome}</span>
                    </div>
                    ${adminDeleteButton}
                </div>
            `;
        });
    });
}

async function showJogoInternoModal(eventoId) {
    formJogoInterno.reset();
    currentEventoId = eventoId;
    const timesRef = collection(db, "eventos", eventoId, "times");
    const snapshot = await getDocs(query(timesRef, orderBy("nomeTime")));
    const selectA = document.getElementById('select-time-a');
    const selectB = document.getElementById('select-time-b');
    selectA.innerHTML = '<option value="">Selecione um time...</option>';
    selectB.innerHTML = '<option value="">Selecione um time...</option>';
    snapshot.forEach(doc => {
        const time = { id: doc.id, ...doc.data() };
        selectA.innerHTML += `<option value="${time.id}" data-nome="${time.nomeTime}">${time.nomeTime}</option>`;
        selectB.innerHTML += `<option value="${time.id}" data-nome="${time.nomeTime}">${time.nomeTime}</option>`;
    });
    openModal(modalJogoInterno);
}

async function handleFormJogoInternoSubmit(e) {
    e.preventDefault();
    const timeAId = formJogoInterno['select-time-a'].value;
    const timeBId = formJogoInterno['select-time-b'].value;
    if (timeAId === timeBId) {
        alert("Os times devem ser diferentes.");
        return;
    }
    const timeANome = formJogoInterno['select-time-a'].selectedOptions[0].dataset.nome;
    const timeBNome = formJogoInterno['select-time-b'].selectedOptions[0].dataset.nome;
    const dadosJogo = {
        dataJogo: formJogoInterno['jogo-interno-data'].value,
        timeA_id: timeAId,
        timeA_nome: timeANome,
        timeB_id: timeBId,
        timeB_nome: timeBNome,
        placarTimeA_final: 0,
        placarTimeB_final: 0
    };
    try {
        await addDoc(collection(db, "eventos", currentEventoId, "jogos"), dadosJogo);
        closeModal(modalJogoInterno);
        renderJogosInternosList(currentEventoId);
    } catch (error) {
        console.error("Erro ao salvar jogo interno:", error);
        alert("Não foi possível salvar o jogo.");
    }
}

async function renderClassificacaoGeralInterno(evento) {
    const container = document.getElementById('tab-classificacao-interno');
    if (!container) return;
    container.innerHTML = '<p>A calcular classificação geral...</p>';
    try {
        const todosJogadores = getJogadores();
        const jogosRef = collection(db, "eventos", evento.id, "jogos");
        const jogosSnapshot = await getDocs(jogosRef);
        const leaderboard = {};
        for (const jogoDoc of jogosSnapshot.docs) {
            const cestasRef = collection(jogoDoc.ref, "cestas");
            const q = query(cestasRef, where("jogadorId", "!=", null));
            const cestasSnapshot = await getDocs(q);
            cestasSnapshot.forEach(cestaDoc => {
                const cesta = cestaDoc.data();
                if (!leaderboard[cesta.jogadorId]) {
                    const jogadorInfo = todosJogadores.find(j => j.id === cesta.jogadorId);
                    leaderboard[cesta.jogadorId] = {
                        nome: jogadorInfo?.nome || cesta.nomeJogador,
                        apelido: jogadorInfo?.apelido || null,
                        foto: jogadorInfo?.foto || null,
                        cestas1: 0, cestas2: 0, cestas3: 0, total: 0
                    };
                }
                if (leaderboard[cesta.jogadorId]) {
                    leaderboard[cesta.jogadorId][`cestas${cesta.pontos}`]++;
                    leaderboard[cesta.jogadorId].total += cesta.pontos;
                }
            });
        }
        const sortedLeaderboard = Object.values(leaderboard).sort((a, b) => b.total - a.total);
        if (sortedLeaderboard.length === 0) {
            container.innerHTML = '<h3>Classificação Geral</h3><p>Nenhuma estatística de pontos registada no torneio.</p>';
            return;
        }
        const is5x5 = evento.modalidade === '5x5';

        let headerHTML = `
        
            <div class="stat-header">
                <span class="header-jogador">Jogador</span>
                <div class="header-pontos">
                    <span title="Cestas de 1 Ponto">1PT</span>
                    <span title="Cestas de 2 Pontos">2PT</span>
                    ${is5x5 ? '<span title="Cestas de 3 Pontos">3PT</span>' : ''}
                    <strong>Total</strong>
                </div>
            </div>`;

        let jogadoresHTML = '';
        sortedLeaderboard.forEach(stats => {
            const fotoHTML = stats.foto ? `<img src="${stats.foto}" alt="${stats.nome}">` : '<div class="placeholder">🏀</div>';
            
            // --- ALTERAÇÃO AQUI ---
            // Verifica se existe um apelido e formata o nome de exibição
            const primeiroNome = stats.nome.split(' ')[0];
            const nomeExibicao = stats.apelido ? `${primeiroNome} "${stats.apelido}"` : primeiroNome;

            jogadoresHTML += `
                <div class="stat-jogador-item">
                    <div class="stat-jogador-info">
                        ${fotoHTML}
                        <span>${nomeExibicao}</span>
                    </div>

                    <div class="stat-jogador-pontos">
                        <span>${stats.cestas1}</span>
                        <span>${stats.cestas2}</span>
                        ${is5x5 ? `<span>${stats.cestas3}</span>` : ''}
                        <strong>${stats.total} Pts</strong>
                    </div>
                </div>
            `;
        });
        container.innerHTML = headerHTML + jogadoresHTML;
    } catch (error) {
        console.error("Erro ao gerar classificação geral:", error);
        container.innerHTML = '<h3>Classificação Geral</h3><p>Não foi possível carregar a classificação.</p>';
    }
}

async function renderJogosEClassificacao(eventoId) {
    const jogosContainer = document.getElementById('jogos-realizados-container');
    const classContainer = document.getElementById('classificacao-container');
    if (!jogosContainer || !classContainer) return;

    jogosContainer.innerHTML = '<p>A carregar jogos...</p>';
    classContainer.innerHTML = '<p>A calcular classificação...</p>';
    
    try {
        const todosJogadores = getJogadores();
        const jogosRef = collection(db, "eventos", eventoId, "jogos");
        const q = query(jogosRef, orderBy("dataJogo", "desc"));
        const snapshotJogos = await getDocs(q);

        if (snapshotJogos.empty) {
            jogosContainer.innerHTML = '<p>Nenhum jogo realizado.</p>';
            classContainer.innerHTML = '<p>Nenhuma estatística para exibir.</p>';
            return;
        }

        // Renderiza a lista de jogos primeiro
        jogosContainer.innerHTML = '';
        snapshotJogos.forEach(jogoDoc => {
            const jogo = { id: jogoDoc.id, ...jogoDoc.data() };
            let adminActionButtons = '';
            if (userRole === 'admin') {
                adminActionButtons = `
                    <div class="game-item-actions-view">
                        <button class="btn-painel-jogo-view" data-evento-id="${eventoId}" data-jogo-id="${jogo.id}" title="Painel do Jogo">📊</button>
                        <button class="btn-edit-jogo-view" data-evento-id="${eventoId}" data-jogo-id="${jogo.id}" title="Editar Jogo">✏️</button>
                        <button class="btn-delete-jogo-view" data-evento-id="${eventoId}" data-jogo-id="${jogo.id}" title="Excluir Jogo">🗑️</button>
                    </div>`;
            }
            jogosContainer.innerHTML += `
                <div class="jogo-realizado-item clickable" data-evento-id="${eventoId}" data-jogo-id="${jogo.id}">
                    <div class="jogo-info">
                        <span class="team-name team-a">ANCB</span>
                        <span class="score">${jogo.placarANCB_final || 0} x ${jogo.placarAdversario_final || 0}</span>
                        <span class="team-name team-b">${jogo.adversario}</span>
                    </div>
                    ${adminActionButtons}
                </div>`;
        });

        // Agora, calcula e renderiza a classificação
        const leaderboard = {};
        for (const jogoDoc of snapshotJogos.docs) {
            const estatisticasRef = collection(db, "eventos", eventoId, "jogos", jogoDoc.id, "estatisticas");
            const snapshotStats = await getDocs(estatisticasRef);
            snapshotStats.forEach(statDoc => {
                const stat = statDoc.data();
                if (stat.jogadorId && !leaderboard[stat.jogadorId]) {
                    const jogadorInfo = todosJogadores.find(j => j.id === stat.jogadorId);
                    leaderboard[stat.jogadorId] = { 
                        jogadorId: stat.jogadorId, 
                        nome: jogadorInfo?.nome || stat.nomeJogador, 
                        apelido: jogadorInfo?.apelido || null,
                        foto: jogadorInfo?.foto || null,
                        pontos: 0, 
                        jogos: 0 
                    };
                }
                if (stat.jogadorId) {
                    leaderboard[stat.jogadorId].pontos += stat.pontos;
                    if (stat.pontos > 0) leaderboard[stat.jogadorId].jogos += 1;
                }
            });
        }

        const sortedLeaderboard = Object.values(leaderboard).sort((a, b) => b.pontos - a.pontos);
        if (sortedLeaderboard.length === 0) {
            classContainer.innerHTML = '<p>Nenhuma estatística de pontos registada.</p>';
        } else {
            let leaderboardHTML = '<div class="leaderboard-list">';
            sortedLeaderboard.forEach((player, index) => {
                const perfilJogador = todosJogadores.find(j => j.id === player.jogadorId);
                const fotoHTML = perfilJogador?.foto ? `<img src="${perfilJogador.foto}" alt="${player.nome}" class="leaderboard-player-photo">` : '<div class="leaderboard-player-photo placeholder">🏀</div>';
                const media = player.jogos > 0 ? (player.pontos / player.jogos).toFixed(1) : 0;
                const nomeExibicao = player.apelido ? `${player.nome} "${player.apelido}"` : player.nome;
                leaderboardHTML += `
                    <div class="leaderboard-item">
                        <span class="leaderboard-rank">${index + 1}</span>
                        ${fotoHTML}
                        <div class="leaderboard-player-info">
                            <span class="leaderboard-player-name">${nomeExibicao}</span>
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
    } catch (error) {
        console.error("Erro ao carregar jogos e classificação:", error);
        jogosContainer.innerHTML = '<p>Erro ao carregar jogos.</p>';
        classContainer.innerHTML = '<p>Erro ao carregar classificação.</p>';
    }
}

async function showFichaJogoDetalhes(eventoId, jogoId) {
    const container = document.getElementById('jogo-estatisticas-container');
    container.innerHTML = '<p>Carregando estatísticas...</p>';
    openModal(document.getElementById('modal-ver-jogo'));

    try {
        const todosJogadores = getJogadores();
        const jogoRef = doc(db, "eventos", eventoId, "jogos", jogoId);
        const jogoDoc = await getDoc(jogoRef);
        if (!jogoDoc.exists()) {
            container.innerHTML = '<p>Jogo não encontrado.</p>';
            return;
        }
        const jogo = jogoDoc.data();
        document.getElementById('ver-jogo-titulo').textContent = `ANCB vs ${jogo.adversario}`;
        document.getElementById('ver-jogo-placar-final').textContent = `${jogo.placarANCB_final} x ${jogo.placarAdversario_final}`;

        const cestasRef = collection(db, "eventos", eventoId, "jogos", jogoId, "cestas");
        const q = query(cestasRef, where("jogadorId", "!=", null));
        const cestasSnapshot = await getDocs(q);

        if (cestasSnapshot.empty) {
            container.innerHTML = '<p>Nenhuma pontuação individual registada para este jogo.</p>';
            return;
        }
        const statsPorJogador = {};
        cestasSnapshot.forEach(doc => {
            const cesta = doc.data();
            if (!statsPorJogador[cesta.jogadorId]) {
                const jogadorInfo = todosJogadores.find(j => j.id === cesta.jogadorId);
                statsPorJogador[cesta.jogadorId] = {
                    nome: jogadorInfo?.nome || cesta.nomeJogador,
                    apelido: jogadorInfo?.apelido || null,
                    foto: jogadorInfo?.foto || null,
                    cestas1: 0, cestas2: 0, cestas3: 0, total: 0
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

        let jogadoresHTML = '';
        sortedStats.forEach(([jogadorId, stats]) => {
            const fotoHTML = stats.foto ? `<img src="${stats.foto}" alt="${stats.nome}">` : '<div class="placeholder">🏀</div>';
            // Lógica para o nome de exibição
            const nomeExibicao = stats.apelido ? `${stats.nome} "${stats.apelido}"` : stats.nome;
            jogadoresHTML += `
                <div class="stat-jogador-item">
                    <div class="stat-jogador-info">
                        ${fotoHTML}
                        <span>${nomeExibicao}</span>
                    </div>
                    ...
                </div>
            `;
        });

        container.innerHTML = headerHTML + jogadoresHTML;

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

function setupTabEventListeners() {
    const navContainer = document.getElementById('ver-campeonato-tabs-nav');
    if (!navContainer || navContainer.dataset.listenerAttached === 'true') return;
    navContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.tab-like-btn');
        if (targetButton) {
            const targetId = targetButton.dataset.target;
            const contentContainer = document.getElementById('ver-campeonato-tabs-content');
            navContainer.querySelectorAll('.tab-like-btn').forEach(b => b.classList.remove('active'));
            contentContainer.querySelectorAll('.tab-like-content').forEach(c => c.classList.remove('active'));
            targetButton.classList.add('active');
            const targetContent = contentContainer.querySelector(`#${targetId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        }
    });
    navContainer.dataset.listenerAttached = 'true';
}

export function setEventosUserRole(role) {
    userRole = role;
    render();
}

export function initEventos() {
    // Listener para dados do Firestore (sem alterações)
    onSnapshot(query(collection(db, "eventos"), orderBy("data", "desc")), (snapshot) => {
        eventos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render();
    });

    // Listener de cliques na aba de eventos
    if (tabEventos) {
        tabEventos.addEventListener('click', (e) => {
            const card = e.target.closest('.championship-card');
            if (!card) return;
            const id = card.dataset.id;
    
            const statusChangeButton = e.target.closest('.btn-status-change');
            const editButton = e.target.closest('.btn-edit-camp');
            const deleteButton = e.target.closest('.btn-delete-camp');
    
            if (statusChangeButton) {
                const action = statusChangeButton.dataset.action;
                if (action === 'start') {
                    changeEventoStatus(id, 'andamento');
                } else if (action === 'finish') {
                    changeEventoStatus(id, 'finalizado');
                }
            } else if (editButton) {
                showEventoModal(id);
            } else if (deleteButton) {
                deleteEvento(id);
            } else {
                showFichaEvento(id);
            }
        });
    }
    
    // Listener para cliques DENTRO DO MODAL DE VISUALIZAÇÃO
    const modalContent = modalVerEvento.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            // Lógica para clicar nos times de um torneio interno
            const timeCard = e.target.closest('#times-container-view .clickable');
            if (timeCard) {
                const { timeId, eventoId } = timeCard.dataset;
                if (timeId && eventoId) showFichaTime(eventoId, timeId);
                return;
            }

            // Lógica para APAGAR um jogo de um torneio INTERNO
            const btnDeleteJogoInterno = e.target.closest('#jogos-internos-container .btn-delete-jogo-interno');
            if (btnDeleteJogoInterno) {
                e.stopPropagation();
                const { eventoId, jogoId } = btnDeleteJogoInterno.dataset;
                deleteJogo(eventoId, jogoId);
                return;
            }
            
            // Lógica para clicar nos JOGOS de um torneio INTERNO
            const jogoInternoCard = e.target.closest('#jogos-internos-container .clickable');
            if (jogoInternoCard) {
                const { eventoId, jogoId } = jogoInternoCard.dataset;
                const evento = eventos.find(ev => ev.id === eventoId);
                const jogoRef = doc(db, "eventos", eventoId, "jogos", jogoId);
                getDoc(jogoRef).then(jogoDoc => {
                    if (jogoDoc.exists()) {
                        const jogo = { id: jogoDoc.id, ...jogoDoc.data() };
                        abrirPainelJogo(userRole, evento, jogo);
                    }
                });
                return;
            }

            // Lógica para clicar nos JOGOS de um torneio EXTERNO
            const btnPainelExterno = e.target.closest('#jogos-realizados-container .btn-painel-jogo-view');
            const btnEditExterno = e.target.closest('#jogos-realizados-container .btn-edit-jogo-view');
            const btnDeleteExterno = e.target.closest('#jogos-realizados-container .btn-delete-jogo-view');
            const itemJogoExterno = e.target.closest('#jogos-realizados-container .clickable');

            if (btnPainelExterno) {
                e.stopPropagation();
                const { eventoId, jogoId } = btnPainelExterno.dataset;
                const evento = eventos.find(c => c.id === eventoId);
                const jogoRef = doc(db, "eventos", eventoId, "jogos", jogoId);
                getDoc(jogoRef).then(jogoDoc => {
                    if(jogoDoc.exists()) abrirPainelJogo(userRole, evento, { id: jogoDoc.id, ...jogoDoc.data() });
                });
            } else if (btnEditExterno) {
                e.stopPropagation();
                const { eventoId, jogoId } = btnEditExterno.dataset;
                closeModal(modalVerEvento);
                showJogoModal(eventoId, jogoId);
            } else if (btnDeleteExterno) {
                e.stopPropagation();
                const { eventoId, jogoId } = btnDeleteExterno.dataset;
                deleteJogo(eventoId, jogoId);
            } else if (itemJogoExterno) {
                const { eventoId, jogoId } = itemJogoExterno.dataset;
                if (eventoId && jogoId) showFichaJogoDetalhes(eventoId, jogoId);
            }
        });
    }

    // Listeners para os formulários (sem alterações)
    formEvento.addEventListener('submit', handleFormSubmitEvento);
    formJogo.addEventListener('submit', handleFormSubmitJogo);
    formTime.addEventListener('submit', handleFormTimeSubmit);
    formJogoInterno.addEventListener('submit', handleFormJogoInternoSubmit);
    document.getElementById('btn-abrir-modal-evento').addEventListener('click', () => showEventoModal());
    setupTabEventListeners();
}
