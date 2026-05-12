# 🧹 Guia de Limpeza: Remover Conquistas Baseadas em Quiz

## 📋 Resumo

Este guia descreve como remover **todas as conquistas baseadas em quiz** que foram concedidas aos jogadores e bloquear o sistema para nunca mais disparar essas conquistas.

### ✅ O que foi feito no código:

1. **Removidas 3 funções de avaliação** nos triggers:
   - ❌ `top_atributo_jogo` — Removido de `evaluateRuleForPlayer()`
   - ❌ `top_atributo_evento` — Removido de `evaluateEventRuleForPlayer()`
   - ❌ `top_atributo_temporada` — Removido de `evaluateSeasonRuleForPlayer()`

2. **Removidas do tipo TypeScript** (`TriggerType`) no `AdminConquistasView.tsx`

3. **Removidas das opções da UI Admin** em `AdminConquistasView.tsx`:
   - Removed from `availableTriggersByTipo`
   - Removed from `triggerLabels`
   - Removed from `triggerNeedsAtributo`

4. **Criada Cloud Function** `removeQuizBasedBadges` em `functions/index.js`

---

## 🚀 Como Executar a Limpeza

### **Opção 1: Via Cloud Function (RECOMENDADO)**

Esta é a forma mais segura, pois você pode monitorar o progresso.

#### Passo 1: Deploy da Cloud Function

```bash
cd functions
npm install  # (se necessário)
firebase deploy --only functions:removeQuizBasedBadges
```

#### Passo 2: Executar no Firebase Console

1. Acesse: [Firebase Console → Functions](https://console.firebase.google.com/project/_/functions)
2. Localize a função `removeQuizBasedBadges`
3. Clique em **Testing** (ou use Firebase Admin SDK)
4. Clique em **Call**

A função retornará:
```json
{
  "success": true,
  "regrasRemovidas": 3,
  "detalhesRegras": [...],
  "jogadoresAfetados": 15,
  "badgesRemovidas": 47
}
```

---

### **Opção 2: Usar o Script Standalone**

Se preferir rodar manualmente (Node.js com Firestore Admin):

```bash
cd portalancb
node cleanup-quiz-badges.cjs
```

**Pré-requisitos:**
- Arquivo `functions/serviceAccountKey.json`
- Node.js instalado
- Firebase Admin SDK instalado: `npm install firebase-admin`

---

### **Opção 3: Executar via Firestore Console**

Se você tiver acesso direto ao Firestore:

1. **Remover as regras manualmente:**
   - Abra [Firebase Console → Firestore](https://console.firebase.google.com/project/_/firestore)
   - Vá para a coleção `conquistas_regras`
   - Procure por regras com `tipoAvaliacao` = `pos_jogo`, `pos_evento`, ou `ao_fechar_temporada`
   - Que têm `gatilho.tipo` = `top_atributo_jogo`, `top_atributo_evento`, ou `top_atributo_temporada`
   - Delete-as manualmente

2. **Remover badges dos jogadores:**
   - Abra a coleção `jogadores`
   - Para cada jogador, edite o array `badges`
   - Remova qualquer badge que tenha `regraId` que corresponda às regras deletadas

⚠️ **NOTA:** Esta opção é manual e propensa a erros. Use a Opção 1 (Cloud Function) sempre que possível.

---

## 📊 O que será removido

### Regras Deletadas do Firestore
As seguintes regras serão deletadas automaticamente:
- Todas as regras com `gatilho.tipo = 'top_atributo_jogo'`
- Todas as regras com `gatilho.tipo = 'top_atributo_evento'`
- Todas as regras com `gatilho.tipo = 'top_atributo_temporada'`

### Badges Removidas dos Jogadores
Para cada jogador, serão removidas todas as badges que:
- Têm `regraId` que corresponde a uma regra deletada
- Foram criadas baseadas em avaliações de quiz
- Correspondem a nomes ou IDs legados de review tags de quiz, como `Muralha`, `Sniper`, `Garcom`, `Flash`, `Lider`, `Guerreiro`, `Avenida`, `Fominha`, `Pedreiro`, `Cone`

---

## ⚠️ CUIDADOS IMPORTANTES

### ✋ **Esta operação é IRREVERSÍVEL!**

1. **Faça backup antes:**
   ```bash
   # Exportar dados do Firestore antes de executar
   firebase firestore:export gs://seu-bucket-backup/pre-cleanup-2026-05-12
   ```

2. **Teste em staging primeiro:**
   - Se você tiver um ambiente de teste, execute lá primeiro
   - Verifique que as regras corretas foram removidas

3. **Execute durante horário de baixa atividade:**
   - A operação pode levar alguns minutos
   - Jogadores não serão afetados, mas é melhor fora do horário de pico

4. **Monitore os logs:**
   - Após executar, verifique os logs da Cloud Function
   - Procure por erros ou inconsistências

---

## 🔍 Como Verificar Depois

### 1. Verificar se as regras foram deletadas
```
Firebase Console → Firestore → conquistas_regras
→ Nenhuma regra com 'top_atributo_*' deve existir
```

### 2. Verificar se os badges foram removidos
```
Firebase Console → Firestore → jogadores → [jogador qualquer]
→ Campo 'badges' deve estar vazio ou apenas com badges não-quiz
```

### 3. Testar se o sistema bloqueia novos quiz-badges
```
1. Finalize um jogo
2. Verifique nos logs da Cloud Function
3. Nenhuma conquista 'top_atributo_*' deve ser criada
```

---

## 🛠️ Rollback (Se necessário)

Se algo der errado, você pode restaurar a partir do backup:

```bash
firebase firestore:import gs://seu-bucket-backup/pre-cleanup-2026-05-12/firestore_export
```

---

## 📝 Exemplo de Resultado

Após executar a limpeza, você verá:

```
✅ Deletado: "Sniper do Jogo" (top_atributo_jogo)
✅ Deletado: "Muralha do Evento" (top_atributo_evento)
✅ Deletado: "Top Atributo da Temporada" (top_atributo_temporada)

✅ João Silva: 3 badge(s) removida(s)
✅ Maria Santos: 2 badge(s) removida(s)
✅ Pedro Oliveira: 1 badge(s) removida(s)

✅ 3 regra(s) deletada(s)
✅ 3 jogador(es) afetado(s)
✅ 6 badge(s) removida(s)
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs da Cloud Function no Firebase Console
2. Certifique-se de que você é um admin ou super-admin
3. Verifique se o Firestore está acessível
4. Entre em contato com o desenvolvedor se necessário

---

**Última atualização:** 12 de maio de 2026
