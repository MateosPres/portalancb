import { readFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'ancb-painel-db',
    firestore: { rules: await readFile('firestore.rules', 'utf8') },
  });

  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'usuarios', 'admin-1'), {
      nome: 'Admin Teste', email: 'admin@example.com', role: 'admin', status: 'active',
    });
    await setDoc(doc(db, 'usuarios', 'user-1'), {
      nome: 'Jogador Um', email: 'um@example.com', role: 'jogador', status: 'active',
    });
    await setDoc(doc(db, 'usuarios', 'user-2'), {
      nome: 'Jogador Dois', email: 'dois@example.com', role: 'jogador', status: 'active',
    });
    await setDoc(doc(db, 'jogadores', 'player-1'), {
      id: 'player-1', nome: 'Jogador Um', posicao: 'ala', numero_uniforme: 1, userId: 'user-1',
    });
    await setDoc(doc(db, 'notifications', 'notification-1'), {
      targetUserId: 'user-1', title: 'Teste', message: 'Privada', timestamp: new Date(),
    });
    await setDoc(doc(db, 'feed_posts', 'post-1'), {
      content: { text: 'Post' }, timestamp: new Date(),
    });
  });
});

after(async () => env?.cleanup());

test('conteúdo esportivo é público, mas documentos de usuários não são', async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, 'jogadores', 'player-1')));
  await assertFails(getDoc(doc(db, 'usuarios', 'user-1')));
});

test('novo usuário não consegue criar papel privilegiado', async () => {
  const db = env.authenticatedContext('new-user').firestore();
  const base = { nome: 'Novo Usuário', email: 'novo@example.com', status: 'pending' };
  await assertFails(setDoc(doc(db, 'usuarios', 'new-user'), { ...base, role: 'admin' }));
  await assertSucceeds(setDoc(doc(db, 'usuarios', 'new-user'), { ...base, role: 'jogador' }));
});

test('usuário não consegue promover a si próprio', async () => {
  const db = env.authenticatedContext('user-1').firestore();
  await assertFails(updateDoc(doc(db, 'usuarios', 'user-1'), { role: 'super-admin' }));
});

test('somente admin altera evento', async () => {
  const regularDb = env.authenticatedContext('user-1').firestore();
  const adminDb = env.authenticatedContext('admin-1').firestore();
  await assertFails(setDoc(doc(regularDb, 'eventos', 'event-1'), { nome: 'Evento' }));
  await assertSucceeds(setDoc(doc(adminDb, 'eventos', 'event-1'), { nome: 'Evento' }));
});

test('notificação só pode ser lida pelo destinatário ou admin', async () => {
  await assertSucceeds(getDoc(doc(env.authenticatedContext('user-1').firestore(), 'notifications', 'notification-1')));
  await assertFails(getDoc(doc(env.authenticatedContext('user-2').firestore(), 'notifications', 'notification-1')));
});

test('comentário exige identidade íntegra e limita tamanho', async () => {
  const db = env.authenticatedContext('user-1').firestore();
  const ref = doc(db, 'feed_posts', 'post-1', 'comments', 'comment-1');
  const valid = {
    text: 'Comentário válido', userId: 'user-1', userName: 'Jogador Um',
    userPhoto: null, linkedPlayerId: 'player-1', createdAt: new Date(), likesCount: 0,
  };
  await assertFails(setDoc(ref, { ...valid, userId: 'user-2' }));
  await assertFails(setDoc(ref, { ...valid, text: 'x'.repeat(1001) }));
  await assertSucceeds(setDoc(ref, valid));
  assert.ok((await getDoc(ref)).exists());
});
