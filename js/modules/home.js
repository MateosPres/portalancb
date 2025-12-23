import { collection, query, where, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';

// Função para formatar a data
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

// Função para renderizar um card de evento
function renderEventCard(evento) {
    const badgeClass = evento.modalidade === '3x3' ? 'badge-3x3' : 'badge-5x5';
    // O atributo data-target agora é usado para a navegação
    return `
        <div class="ongoing-event-card card" data-id="${evento.id}" data-target="evento-${evento.id}">
            <span class="championship-type-badge ${badgeClass}">${evento.modalidade}</span>
            <h3 class="championship-name">${evento.nome}</h3>
            <div class="championship-info">
                <p>📅 <strong>Data:</strong> ${formatDate(evento.data)}</p>
                <p><strong>Tipo:</strong> ${evento.type.replace('_', ' ')}</p>
            </div>
        </div>`;
}

// Função que busca e renderiza os eventos em andamento
function renderOngoingEvents() {
    const grid = document.getElementById('grid-eventos-andamento-home');
    if (!grid) return; // Se a grid não estiver na página, não faz nada

    const q = query(collection(db, "eventos"), where("status", "==", "andamento"), orderBy("data", "desc"));
    
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            grid.innerHTML = '<p>Nenhum evento em andamento no momento.</p>';
            return;
        }
        grid.innerHTML = '';
        snapshot.forEach(doc => {
            const evento = { id: doc.id, ...doc.data() };
            grid.innerHTML += renderEventCard(evento);
        });
    }, (error) => {
        console.error("Erro ao buscar eventos em andamento: ", error);
        grid.innerHTML = '<p>Não foi possível carregar os eventos.</p>';
    });
}

function loadInstagramWidget() {
    // Procura o contêiner do widget na página
    const container = document.querySelector('.sk-instagram-feed');
    if (container) {
        // Remove qualquer script antigo para garantir uma recarga limpa
        const oldScript = document.getElementById('sociablekit-script');
        if (oldScript) {
            oldScript.remove();
        }

        // Cria a nova tag de script
        const script = document.createElement('script');
        script.src = 'https://widgets.sociablekit.com/instagram-feed/widget.js';
        script.id = 'sociablekit-script'; // Dá um ID para encontrá-lo depois
        script.async = true;
        script.defer = true;
        
        // Adiciona o script ao corpo do documento, o que fará com que ele seja executado
        document.body.appendChild(script);
    }
}

// Função de inicialização do módulo
// A sua função initHome() deve ficar assim, sem a chamada para loadInstagramWidget
export function initHome() {
    document.body.addEventListener('page-loaded', (e) => {
        if (e.detail.page === 'home') {
            renderOngoingEvents();
            // A chamada para loadInstagramWidget() foi removida daqui
        }
    });
}
