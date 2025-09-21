// js/modules/eventos.js (VERSÃO FINAL E CORRIGIDA)

import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, addDoc, getDocs, getDoc, where, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
import { openModal, closeModal } from '../components/modal.js';
import { getJogadores } from './jogadores.js';
import { abrirPainelJogo } from './painelJogo.js';


// --- CONFIGURAÇÃO DO CLOUDINARY ---
const CLOUDINARY_CLOUD_NAME = "dc3l3t1sl";
const CLOUDINARY_UPLOAD_PRESET = "ancb_portal_uploads";
const CLOUDINARY_FOLDER_TIMES = "times_logos";

export let eventos = [];
let userRole = null;
let currentEventoId = null;

// --- Elementos do DOM (Apenas os que são sempre visíveis) ---
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

function renderEventCard(evento) {
    const isAdmin = userRole === 'admin';
    const status = evento.status || 'proximo';
    let statusBadge = '';
    if (status === 'andamento') {
        statusBadge = '<span class="status-badge andamento">Em Andamento</span>';
    } else if (status === 'finalizado') {
        statusBadge = '<span class="status-badge finalizado">Finalizado</span>';
    }

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
    // Mantemos os logs para verificar o resultado
    console.log('Função render() de eventos foi chamada.');
    console.log('Conteúdo da variável "eventos":', eventos);

    const gridEventosAndamento = document.getElementById('grid-eventos-andamento');
    const gridEventosProximos = document.getElementById('grid-eventos-proximos');
    const gridEventosFinalizados = document.getElementById('grid-eventos-finalizados');

    if (!gridEventosAndamento || !gridEventosProximos || !gridEventosFinalizados) {
        return;
    }

    const eventosAndamento = eventos.filter(e => e.status === 'andamento');
    const eventosProximos = eventos.filter(e => !e.status || e.status === 'proximo');
    const eventosFinalizados = eventos.filter(e => e.status === 'finalizado');

    // --- LÓGICA MELHORADA ---

    // 1. Renderiza a seção "Em Andamento"
    if (eventosAndamento.length > 0) {
        gridEventosAndamento.innerHTML = eventosAndamento.map(renderEventCard).join('');
    } else {
        gridEventosAndamento.innerHTML = '<p>Nenhum evento em andamento.</p>';
    }

    // 2. Renderiza a seção "Próximos Eventos"
    if (eventosProximos.length > 0) {
        gridEventosProximos.innerHTML = eventosProximos.map(renderEventCard).join('');
    } else {
        gridEventosProximos.innerHTML = '<p>Nenhum próximo evento agendado.</p>';
    }

    // 3. Renderiza a seção "Histórico de Eventos"
    if (eventosFinalizados.length > 0) {
        gridEventosFinalizados.innerHTML = eventosFinalizados.map(renderEventCard).join('');
    } else {
        gridEventosFinalizados.innerHTML = '<p>Nenhum evento finalizado no histórico.</p>';
    }
}

export async function updateEventStatus(id, newStatus) {
    if (userRole !== 'admin') return;
    try {
        await updateDoc(doc(db, "eventos", id), { status: newStatus });
    } catch (error) {
        console.error("Erro ao atualizar status do evento:", error);
        alert("Não foi possível alterar o status do evento.");
    }
}

export async function showEventoModal(id = null) {
    // ... (O conteúdo desta função permanece o mesmo, pois ela opera em modais que sempre existem)
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


    const evento = id ? eventos.find(i => i.id === id) : null;
    const jogadoresJaEscalados = evento ? evento.jogadoresEscalados || [] : [];

    const listaContainer = document.getElementById('lista-jogadores-escalar');
    listaContainer.innerHTML = '';
    const todosJogadores = getJogadores();

    // Este loop agora verifica e marca os checkboxes corretos
    todosJogadores.forEach(j => {
        const isChecked = jogadoresJaEscalados.includes(j.id) ? 'checked' : '';
        listaContainer.innerHTML += `<label class="checkbox-item"><input type="checkbox" value="${j.id}" ${isChecked}><span>${j.nome} (#${j.numero_uniforme})</span></label>`;
    });
    openModal(modalEvento);
}

// ... (todas as outras funções como handleFormSubmitEvento, deleteEvento, etc., permanecem as mesmas)
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
        type: type
    };

    if (!id) {
        dados.status = 'proximo';
    }

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

export async function deleteEvento(id) {
    if (userRole !== 'admin') return;
    if (confirm('Tem certeza que deseja excluir este evento? TODOS os seus jogos e estatísticas de jogadores associadas serão PERMANENTEMENTE apagados. Esta ação é irreversível.')) {
        
        // Futuramente, aqui você pode adicionar um indicador de "carregando..."
        
        try {
            // Passo 1: Encontrar todos os jogos dentro da subcoleção do evento
            const jogosRef = collection(db, "eventos", id, "jogos");
            const jogosSnapshot = await getDocs(jogosRef);

            const deletePromises = []; // Um array para guardar todas as operações de exclusão

            // Passo 2: Iterar sobre cada jogo encontrado
            for (const jogoDoc of jogosSnapshot.docs) {
                // Para cada jogo, encontrar e adicionar à lista de exclusão todas as suas 'cestas'
                const cestasRef = collection(db, "eventos", id, "jogos", jogoDoc.id, "cestas");
                const cestasSnapshot = await getDocs(cestasRef);
                cestasSnapshot.forEach(cestaDoc => {
                    deletePromises.push(deleteDoc(cestaDoc.ref));
                });

                // Faz o mesmo para a subcoleção 'estatisticas', se houver
                const statsRef = collection(db, "eventos", id, "jogos", jogoDoc.id, "estatisticas");
                const statsSnapshot = await getDocs(statsRef);
                statsSnapshot.forEach(statDoc => {
                    deletePromises.push(deleteDoc(statDoc.ref));
                });

                // Adiciona a exclusão do próprio documento do jogo à lista
                deletePromises.push(deleteDoc(jogoDoc.ref));
            }

            // Passo 3: Executar todas as promessas de exclusão de uma vez
            await Promise.all(deletePromises);

            // Passo 4: Depois que todo o conteúdo interno foi apagado, apagar o evento principal
            await deleteDoc(doc(db, "eventos", id));

            alert('Evento e todos os seus dados associados foram excluídos com sucesso.');
            closeModal(modalVerEvento);

        } catch (error) {
            console.error("Erro ao executar a exclusão em cascata:", error);
            alert("Ocorreu um erro ao apagar todos os dados do evento. Verifique o console.");
        } finally {
            // Futuramente, aqui você pode remover o indicador de "carregando..."
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
        const jogadoresSelecionados = Array.from(document.querySelectorAll('#lista-jogadores-escalar-time input:checked')).map(input => input.value);
        const dadosTime = {
            nomeTime: formTime['time-nome'].value,
            jogadores: jogadoresSelecionados
        };
        if (logoUrl) {
            dadosTime.logoUrl = logoUrl;
        }
        const timesRef = collection(db, "eventos", currentEventoId, "times");
        if (timeId) {
            await setDoc(doc(timesRef, timeId), dadosTime, { merge: true });
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

export async function deleteJogo(eventoId, jogoId) {
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

export async function showJogoModal(eventoId, jogoId = null) {
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
        item.querySelector('.btn-painel-jogo').addEventListener('click', () => abrirPainelJogo(evento, jogo));
        item.querySelector('.btn-edit-jogo').addEventListener('click', () => showJogoModal(eventoId, jogo.id));
        item.querySelector('.btn-delete-jogo').addEventListener('click', () => deleteJogo(eventoId, jogo.id));
        listaJogosContainer.appendChild(item);
    });
}

export async function showFichaEvento(id) {
    const evento = eventos.find(e => e.id === id);
    if (!evento) return;
    const loader = modalVerEvento.querySelector('.modal-loader-container');
    const dataContent = modalVerEvento.querySelector('.modal-data-content');
    loader.style.display = 'flex';
    dataContent.style.display = 'none';
    openModal(modalVerEvento);
    document.getElementById('ver-campeonato-titulo').innerText = evento.nome;
    document.getElementById('ver-campeonato-data').innerText = `Data: ${formatDate(evento.data)}`;
    document.getElementById('ver-campeonato-tabs-nav').innerHTML = '';
    document.getElementById('ver-campeonato-tabs-content').innerHTML = '';
    try {
        if (evento.type === 'torneio_externo' || evento.type === 'amistoso') {
            await renderFichaExterno(evento);
        } else if (evento.type === 'torneio_interno') {
            await renderFichaInterno(evento);
        }
    } catch (error) {
        console.error("Erro ao carregar dados do evento:", error);
        dataContent.innerHTML = '<p>Ocorreu um erro ao carregar os detalhes do evento.</p>';
    } finally {
        loader.style.display = 'none';
        dataContent.style.display = 'block';
    }
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

export async function showFichaTime(eventoId, timeId) {
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
                const primeiroNome = player.nome.split(' ')[0];
                const nomeExibicao = player.apelido ? `${primeiroNome} "${player.apelido}"` : primeiroNome;
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

export async function showFichaJogoDetalhes(eventoId, jogoId) {
    const todosJogadores = getJogadores();
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
            // Tenta encontrar o jogador correspondente na lista principal
            const jogadorInfo = todosJogadores.find(j => j.id === cesta.jogadorId);

            // SÓ PROSSEGUE SE O JOGADOR FOI ENCONTRADO
            if (jogadorInfo) {
                if (!statsPorJogador[cesta.jogadorId]) {
                    statsPorJogador[cesta.jogadorId] = {
                        nome: jogadorInfo.nome,
                        apelido: jogadorInfo.apelido || null,
                        foto: jogadorInfo.foto || null,
                        cestas1: 0, cestas2: 0, cestas3: 0, total: 0
                    };
                }
                statsPorJogador[cesta.jogadorId][`cestas${cesta.pontos}`]++;
                statsPorJogador[cesta.jogadorId].total += cesta.pontos;
            }
        });

// --- BLOCO DE CÓDIGO FINAL E CORRIGIDO ---

        // Converte o objeto de estatísticas em uma lista (array)
        const statsAsArray = Object.values(statsPorJogador);

        // Filtra a lista para manter apenas jogadores com mais de 0 pontos
        const filteredStats = statsAsArray.filter(stats => stats.total > 0);
        
        // Ordena a lista filtrada. A função .sort() modifica a própria variável 'filteredStats'.
        filteredStats.sort((a, b) => b.total - a.total);
        
        // Agora, usamos a lista que já foi filtrada e ordenada.
        const sortedStats = filteredStats;
        // --- FIM DO BLOCO CORRIGIDO ---

        console.log('Conteúdo de sortedStats:', sortedStats);

        let headerHTML = `
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
        // Substituímos o .forEach por um loop 'for' clássico
        for (let i = 0; i < sortedStats.length; i++) {
            const stats = sortedStats[i]; // Pega o jogador atual da lista

            // O resto da lógica é exatamente o mesmo de antes
            if (!stats) continue; // Medida de segurança extra

            const fotoHTML = stats.foto ? `<img src="${stats.foto}" alt="${stats.nome}">` : '<div class="placeholder">🏀</div>';
            const nomeExibicao = stats.apelido ? `${stats.nome.split(' ')[0]} "${stats.apelido}"` : stats.nome;
            
            jogadoresHTML += `
                <div class="stat-jogador-item">
                    <div class="stat-jogador-info">
                        ${fotoHTML}
                        <span>${nomeExibicao}</span>
                    </div>
                    <div class="stat-jogador-pontos">
                        <span>${stats.cestas1 || 0}</span>
                        <span>${stats.cestas2 || 0}</span>
                        <span>${stats.cestas3 || 0}</span>
                        <strong>${stats.total || 0} Pts</strong>
                    </div>
                </div>
            `;
        }

        container.innerHTML = headerHTML + jogadoresHTML;
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
    // O onSnapshot agora tem duas tarefas:
    // 1. Manter a variável 'eventos' sempre atualizada.
    // 2. Chamar o render() de novo SE a página de eventos já estiver visível.
    onSnapshot(query(collection(db, "eventos"), orderBy("data", "desc")), (snapshot) => {
        eventos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Verifica se estamos na página de eventos antes de tentar renderizar de novo.
        // Se a div 'grid-eventos-andamento' existe, é porque a página está na tela.
        if (document.getElementById('grid-eventos-andamento')) {
            render();
        }
    });

    // Reintroduzimos o listener 'page-loaded'. Sua tarefa é chamar o render()
    // assim que a página de eventos for carregada na tela.
    document.body.addEventListener('page-loaded', (e) => {
        if (e.detail.page === 'eventos') {
            render();
        }
    });

    // O restante da sua função (listeners de formulários, etc.) permanece aqui...
    // Note que o listener do modalContent foi movido para o main.js e não precisa estar aqui.
 
    formEvento.addEventListener('submit', handleFormSubmitEvento);
    formJogo.addEventListener('submit', handleFormSubmitJogo);
    formTime.addEventListener('submit', handleFormTimeSubmit);
    formJogoInterno.addEventListener('submit', handleFormJogoInternoSubmit);
    
    setupTabEventListeners();
}
