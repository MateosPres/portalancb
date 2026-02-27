# 🎯 UI de Configuração de Chaves - Guia de Uso

## Visão Geral

A **UI de Configuração de Chaves** permite que admins estruturem campeonatos de forma visual e intuitiva, com drag-and-drop de times para diferentes chaves.

---

## 📍 Onde Encontrar

1. Abra um evento (tipo **Torneio Externo**)
2. Se você é **ADMIN**, verá um botão amarelo com ícone de **rede** (⊞) no canto superior direito
3. Clique neste botão para abrir o configurador

```
[Voltar]                         [🗑️] [▶️ Iniciar] [✏️] [⊞ CONFIGURAR]
```

---

## 🎮 Como Usar

### Passo 1: Escolher o Formato

A primeira tela mostra **2 opções**:

```
┌─────────────────────┐  ┌─────────────────────┐
│     📋 GRUPO ÚNICO  │  │  ⊞ CHAVEAMENTO      │
│                     │  │                     │
│ Todos no mesmo      │  │ Dividir em grupos   │
│    ranking          │  │    (Chaves)         │
└─────────────────────┘  └─────────────────────┘
```

**Clique em um para selecionar:**
- **GRUPO ÚNICO**: Todos os times competem juntos
- **CHAVEAMENTO**: Divide os times em múltiplas chaves

### Passo 2: Se Escolher "CHAVEAMENTO"

A interface mostra um formulário com:

#### ✨ Criar Nova Chave

```
┌─────────────────────────────────────────┐
│ Criar Nova Chave                        │
├─────────────────────────────────────────┤
│ [Ex: Chave A, Grupo 1, Piscina A] [+]  │
└─────────────────────────────────────────┘
```

**Como usar:**
1. Digite um nome para a chave (ex: "Chave A", "Grupo 1", "Piscina A")
2. Clique no botão **[+]** ou pressione **ENTER**
3. A nova chave é criada e aparece na lista

#### 🔄 Distribuir Times (Drag & Drop)

```
┌──────────────────────────────────────────────────────────────────┐
│                     LADO ESQUERDO: CHAVES                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─ Chave A ───────────────────────────────────────────────────┐ │
│ │ ⋮⋮ Time Alpha          [6] ⓧ                              │ │
│ │ ⋮⋮ Time Beta           [5] ⓧ                              │ │
│ │ ⋮⋮ Time Gamma          [4] ⓧ                              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─ Chave B ───────────────────────────────────────────────────┐ │
│ │ ⋮⋮ Time Omega          [5] ⓧ                              │ │
│ │ ⋮⋮ Time Sigma          [4] ⓧ                              │ │
│ │                                                             │ │
│ │     [Arraste times aqui]                                   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Como usar:**

1. **Clicar para expandir chave:** Clique no nome da chave para ver os times
2. **Arrastar time para chave:**
   - Passe o mouse sobre um time (você verá as 4 linhas ⋮⋮ aparecerem)
   - Clique e arraste o time para outra chave
   - Solte dentro da chave destino
3. **Ver times na chave:** Cada chave mostra quantos times tem: `[4] times`

### Passo 3: Times Disponíveis (Lado Direito)

```
┌──────────────────────────────────────────┐
│  Times Disponíveis  [3]                  │
├──────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ⋮⋮ Time Tau           [5]           │ │
│ │ ⋮⋮ Time Kappa         [4]           │ │
│ │ ⋮⋮ Time Theta         [3]           │ │
│ │                                      │ │
│ │   [Arraste de volta aqui]            │ │
│ └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Use para:**
- Ver times que ainda **não foram distribuídos**
- **Remover times** de chaves (arraste de volta aqui)
- **Desfazer** distribuição errada

---

## 📊 Resumo e Validação

Na parte inferior, você vê um **resumo em tempo real**:

```
┌─────────────────────────────────────────┐
│ RESUMO                                  │
├─────────────────────────────────────────┤
│ • Total de chaves: 2                    │
│ • Times distribuídos: 6                 │
│ • Times disponíveis: 1                  │
│ • Total de times: 7                     │
└─────────────────────────────────────────┘
```

**Verifique:**
- ✅ Todas as chaves foram criadas?
- ✅ Todos os times foram distribuídos?
- ✅ O total bate com seus times?

---

## 💾 Salvar a Configuração

1. Verifique o **resumo** no final
2. Clique no botão **"Salvar Configuração"** (verde, no rodapé)
3. Sistema atualiza o evento automaticamente

```
[Cancelar] [Salvar Configuração]
```

---

## 🔧 Operações Comuns

### Remover Uma Chave

```
┌─ Chave A ────────────────────────────────┐
│                          [🗑️] [▼]      │
└──────────────────────────────────────────┘
```

1. Clique no ícone 🗑️ (lixo) no canto direito da chave
2. Se houver times, será pedida confirmação
3. Times voltam para "Disponíveis"

### Mover Todos os Times de Uma Chave

```
1. Abra a chave (clique no nome)
2. Para cada time dentro:
   - Passe o mouse (▮▮ aparece)
   - Arraste para outra chave
```

### Limpar Uma Chave

```
1. Abra a chave
2. Arraste TODOS os times para "Disponíveis"
3. Chave fica vazia mas continua existindo
```

### Mudar de Formato

```
No topo, clique em "GRUPO ÚNICO" para voltar ao formato antigo
Todos os times serão colocados em um único ranking
```

---

## ⚠️ Cuidados Importantes

| Ação | Resultado |
|------|-----------|
| Criar chave com nome duplicado | ❌ Não permite (alerta) |
| Deixar times não distribuídos | ⚠️ Possível, mas revisar |
| Clicar "Cancelar" | ✅ Nada é salvo, volta ao estado anterior |
| Remover chave com times | 📋 Pede confirmação, times voltam para disponíveis |
| Salvar com "Grupo Único" | ✅ Remove todos os "grupos" |

---

## 🎯 Casos de Uso

### Caso 1: Organizar Campeonato do Zero

```
1. Crie evento (Torneio Externo)
2. Adicione times
3. Abra Configurador
4. Selecione "CHAVEAMENTO"
5. Crie Chave A, B, C...
6. Distribua times
7. Salve
✅ Pronto!
```

### Caso 2: Mudar o Numbers de Chaves Depois

```
ANTES: 2 chaves (A, B)
DEPOIS: 3 chaves (A, B, C)

1. Abra Configurador
2. Crie nova chave "Chave C"
3. Redistribua times de A e B
4. Salve
✅ Feito!
```

### Caso 3: Cancelar Chaveamento

```
ANTES: Chaveamento com 3 chaves
DEPOIS: Grupo Único

1. Abra Configurador
2. Clique em "GRUPO ÚNICO" no topo
3. Salve
✅ Todos no mesmo ranking agora!
```

### Caso 4: Imprevisto - Novo Time Chega

```
1. Abra Configurador
2. Novo time já está em "Disponíveis"
3. Arraste para uma chave
4. Salve
✅ Atualizado!
```

---

## 🎨 Visual na Classificação

Depois de salvar a configuração, na aba **"Classificação"**:

> A fase de grupos sempre aparece primeiro; o quadro de mata‑mata (semis/final) só surge depois que pelo menos uma partida de knockout for registrada.


```
┌────────────────────────────────────┐
│  🔵 Chave A                  [4]   │
├────────────────────────────────────┤
│ 1º │ Time Alpha  │ 3V │ 4 pts │ ✅ │
│ 2º │ Time Beta   │ 2V │ 3 pts │ ✅ │
│ 3º │ Time Gamma  │ 1V │ 2 pts │    │
│ 4º │ Time Delta  │ 0V │ 0 pts │    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  🟠 Chave B                  [4]   │
├────────────────────────────────────┤
│ 1º │ Time Omega  │ 3V │ 5 pts │ ✅ │
│ 2º │ Time Sigma  │ 2V │ 3 pts │ ✅ │
│ 3º │ Time Tau    │ 1V │ 2 pts │    │
│ 4º │ Time Kappa  │ 0V │ 0 pts │    │
└────────────────────────────────────┘

╔════════════════════════════════════╗
║ ✨ Times Classificados - Semifinal ║
╠════════════════════════════════════╣
║ De Chave A:      De Chave B:       ║
║ ✓ Time Alpha     ✓ Time Omega      ║
║ ✓ Time Beta      ✓ Time Sigma      ║
╚════════════════════════════════════╝
```

---

## 🆘 Perguntas Frequentes

**P: Posso mudar de formato depois de começar?**
A: Sim! Abra o Configurador novamente e escolha outro formato.

**P: O que acontece se deixar times sem distribuir?**
A: Eles ficam em "Disponíveis" e **não participam** da classificação de chaves.

**P: Posso renomear uma chave?**
A: Não diretamente. Crie uma nova com o nome correto, mova os times, e delete a antiga.

**P: O que acontece com os jogos já registrados?**
A: Nada! Os jogos continuam os mesmos. Só muda a forma de exibir a classificação.

**P: Posso ter chaves com tamanhos diferentes?**
A: Sim! Ex: Chave A com 4 times, Chave B com 3 times, tudo ok.

---

## ✅ Checklist Antes de Salvar

- [ ] Todas as chaves foram criadas?
- [ ] Todos os times foram distribuídos?
- [ ] Nomes de chaves fazem sentido?
- [ ] Não há duplicatas?
- [ ] O resumo mostra os números corretos?

---

## 🎉 Você Está Pronto!

A UI de configuração é totalmente intuitiva. Basta:
1. 🟡 Clique no botão amarelo ⊞
2. 🎯 Configure as chaves
3. 🧲 Arraste os times
4. 💾 Salve

Simples assim! 🚀
