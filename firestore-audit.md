# Firestore access audit

Database reviewed: `(default)`, Standard edition, Native mode.

The application is a public sports portal. Public content collections are read without authentication; private user documents and notifications are restricted. Administrative writes are authorized from `usuarios/{uid}.role`. This remains a prototype until emulator tests cover the production dataset and every legacy document shape.

Main paths: `usuarios`, `jogadores`, `eventos/{eventId}/{jogos,roster,partidas}`, `feed_posts/{postId}/{comments,likes}`, `notifications`, `avaliacoes_gamified`, `conquistas_regras`, `apoiadores`, `historia_galeria`, `temporadas`, `config`, `configuracoes`, and root legacy `cestas`/`jogos`.

Attack review:

1. Anonymous writes: denied by the final catch-all.
2. User self-promotion: denied because self-updates cannot change `role` or `status`.
3. Reading another user's PII: denied; only owner or admin can read `usuarios`.
4. Editing another player's profile: denied; only the linked owner or admin can write.
5. Editing player scores/badges as a player: denied by the changed-field allowlist.
6. Forging comments/likes: IDs and `userId` must match the authenticated UID.
7. Editing another user's comment: denied; only original author or admin.
8. Reading/deleting another notification: denied unless `targetUserId` matches.
9. Direct score/event manipulation: denied to non-admins.
10. Schema pollution and oversized user/comment data: denied by validators on both create and update.
11. Ownership/role/status changes: immutable to non-admins.
12. Orphan subcollections: event and feed subcollections require their parent to exist.

Known migration issue: public post rendering must rely on denormalized author display fields rather than reading other users' private documents. Existing code falls back to the ANCB identity when that private lookup is denied.
