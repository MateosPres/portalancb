// js/components/modal.js (VERSÃO FINAL SIMPLIFICADA)

const backdrop = document.getElementById('modal-backdrop');
const body = document.body;

export function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
    }
    const anyModalActive = document.querySelector('.modal.active, .auth-container.active');
    if (!anyModalActive) {
        backdrop.classList.remove('active');
        body.classList.remove('modal-open');
    }
}

export function openModal(modal) {
    if (modal) {
        body.classList.add('modal-open');
        backdrop.classList.add('active');
        modal.classList.add('active');
    }
}

export function closeAllModals() {
    document.querySelectorAll('.modal.active, .auth-container.active').forEach(m => {
        closeModal(m);
    });
}

// A função agora SÓ adiciona o listener para o fundo
export function initModals() {
    backdrop.addEventListener('click', closeAllModals);
}