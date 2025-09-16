// js/modules/admin.js
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from '../services/firebase.js';
// Este módulo não precisa mais de modais, pois a edição está embutida na tabela.
// Se precisar do modal de edição de usuário, adicione o import do modal.js.

let allUsers = [];
let currentUserId = null;

const usersTableBody = document.getElementById('users-table-body');

function render() {
    usersTableBody.innerHTML = '';
    allUsers.forEach(user => {
        const tr = document.createElement('tr');
        const isCurrentUser = user.uid === currentUserId;

        const roleButton = isCurrentUser ? 
            `<button class="role-toggle ${user.role}" disabled title="Não é possível alterar sua própria permissão">${user.role}</button>` :
            `<button class="role-toggle ${user.role}" data-uid="${user.uid}">${user.role}</button>`;

        const statusText = user.status === 'banned' ? '<span class="user-status banned">Banido</span>' : '<span class="user-status">Ativo</span>';
        
        const banButton = user.status === 'banned' ? 
            `<button class="action-btn btn-unban" title="Reativar" data-uid="${user.uid}">♻️</button>` : 
            `<button class="action-btn btn-ban" title="Banir" data-uid="${user.uid}">🚫</button>`;

        // Ação de deletar usuário foi removida para segurança. Se necessário, pode ser reativada.
        const actions = isCurrentUser ? '' : `<div class="user-actions">${banButton}</div>`;

        tr.innerHTML = `<td>${user.email}</td><td>${user.nome || 'N/A'}</td><td>${statusText}</td><td>${roleButton}</td><td>${actions}</td>`;
        usersTableBody.appendChild(tr);
    });
}

async function handleTableClick(e) {
    const target = e.target;
    const uid = target.dataset.uid;
    if (!uid) return;

    if (target.classList.contains('role-toggle')) {
        const currentRole = target.classList.contains('admin') ? 'admin' : 'jogador';
        const newRole = currentRole === 'admin' ? 'jogador' : 'admin';
        if (confirm(`Mudar permissão de ${currentRole} para ${newRole}?`)) {
            await updateDoc(doc(db, "usuarios", uid), { role: newRole });
        }
    } else if (target.classList.contains('btn-ban')) {
        if (confirm('Tem certeza que deseja banir este usuário?')) {
            await updateDoc(doc(db, "usuarios", uid), { status: 'banned' });
        }
    } else if (target.classList.contains('btn-unban')) {
        await updateDoc(doc(db, "usuarios", uid), { status: 'active' });
    }
}

let usersUnsub = null;
export function setAdminVisibility(isAdmin, uid) {
    currentUserId = uid;
    if (isAdmin && !usersUnsub) {
        const q = query(collection(db, "usuarios"), orderBy("email"));
        usersUnsub = onSnapshot(q, (snapshot) => {
            allUsers = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
            render();
        });
    } else if (!isAdmin && usersUnsub) {
        usersUnsub();
        usersUnsub = null;
        allUsers = [];
        render();
    }
    if(isAdmin) render();
}

export function initAdmin() {
    usersTableBody.addEventListener('click', handleTableClick);
}