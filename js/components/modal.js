// js/components/modal.js (CORRIGIDO)

const backdrop = document.getElementById('modal-backdrop');
const body = document.body;

// ADICIONADO O "EXPORT" AQUI
export function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
    }
    // Apenas remove o backdrop se nenhum outro modal estiver ativo
    if (!document.querySelector('.modal.active')) {
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
    document.querySelectorAll('.modal.active').forEach(closeModal);
    document.querySelectorAll('.auth-container.active').forEach(authModal => {
        authModal.classList.remove('active');
    });
}

export function initModals() {
    backdrop.addEventListener('click', closeAllModals);
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal, .auth-container');
            if (modal.classList.contains('modal')) {
                closeModal(modal);
            } else if (modal) {
                modal.classList.remove('active');
            }
        });
    });
}