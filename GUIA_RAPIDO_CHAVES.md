# 🚀 Guia Rápido - Sistema de Chaves

## 5 Minutos para Começar

### ✅ O que você tem agora?

1. **Novo Componente**: `GroupStandings.tsx` - Renderiza classificação por chaves
2. **Integração Automática**: EventoDetalheView usa automaticamente quando apropriado
3. **Documentação Completa**: Documentos de uso e técnico inclusos
4. **Exemplos Prontos**: JSON com estrutura de exemplo

### 📋 Passo a Passo

#### 1️⃣ Criar um Evento
- Vá para criar evento
- Defina:
  - **Nome**: ex. "Campeonato ANCB 2024"
  - **Modalidade**: 5x5 (ou 3x3)
  - **Tipo**: Torneio Externo
  - **Formato**: ✅ **Chaveamento** (IMPORTANTE!)

#### 2️⃣ Adicionar Times
Ao adicionar cada time, especifique qual **chave** ele pertence:

```
Time 1: "Alpha" → Chave A
Time 2: "Beta" → Chave A
Time 3: "Omega" → Chave B
Time 4: "Sigma" → Chave B
```

**Onde está o campo?** Procure por `grupo` no formulário ou adicione manualmente:
```javascript
{
  nomeTime: "Alpha",
  grupo: "Chave A"  // ← Este campo!
}
```

#### 3️⃣ Registrar Jogos
- Registre os jogos normalmente
- Marque como "finalizado" quando terminar
- Os pontos são calculados automaticamente

#### 4️⃣ Ver Classificação
- Clique na aba **"Classificação"** do evento
- Você verá:
  - Tabelas separadas para cada chave
  - Ranking dos times
  - Quem avança (primeiros 2)
  - Resumo dos qualificados

---

## 💡 Exemplos Rápidos

### Exemplo 1: 2 Chaves com 4 Times

```
CHAVE A (4 times)
- Time A vs Time B
- Time A vs Time C
- Time A vs Time D
- Time B vs Time C
- Time B vs Time D
- Time C vs Time D
(Total: 6 jogos)

CHAVE B (4 times)
- Time E vs Time F
- Time E vs Time G
- Time E vs Time H
- Time F vs Time G
- Time F vs Time H
- Time G vs Time H
(Total: 6 jogos)

RESULTADO:
1º e 2º de A + 1º e 2º de B = 4 times para semifinal
```

### Exemplo 2: 3 Chaves com 3 Times

```
CHAVE A: Time 1, Time 2, Time 3
CHAVE B: Time 4, Time 5, Time 6
CHAVE C: Time 7, Time 8, Time 9

RESULTADO:
2 primeiros × 3 chaves = 6 times para semifinal
```

---

## 🔍 Como Verificar se Está Funcionando

✅ **Passou?** Se ao clicar em "Classificação" você vê:
- [ ] Tabelas com cores diferentes para cada chave
- [ ] Times listados por ordem de pontos
- [ ] Badge "✅ Avança" nos primeiros de cada chave
- [ ] Seção final resumindo qualificados

❌ **Algo errado?** Verifique:
1. Evento tem `formato: "chaveamento"`
2. Times têm campo `grupo` preenchido (ex: "Chave A", "Chave B")
3. Jogos estão marcados como "finalizado"
4. Placar final está preenchido

---

## 📊 Compreendendo a Pontuação

| Resultado | Pontos |
|-----------|--------|
| Vitória | 2 pontos |
| Empate | 1 ponto |
| Derrota | 0 pontos |

**Exemplo:**
```
Time A jogou 3 vezes:
- Ganhou de Time B (75 x 68) = 2 pontos
- Empatou com Time C (70 x 70) = 1 ponto  
- Perdeu de Time D (65 x 72) = 0 pontos
TOTAL: 3 pontos | Saldo: +5 (75+70+65 = 210 marcados, 68+70+72 = 210 sofridos)
```

**Desempate:**
Se 2 times têm mesma pontuação, ganha quem tem maior saldo. Exemplo:
```
Time A: 4 pontos, saldo +10 → 1º lugar
Time B: 4 pontos, saldo +5  → 2º lugar (avança assim mesmo)
```

---

## 🎨 Customizações Possíveis

### Mudar número de qualificados
Atualmente: 2 primeiros de cada chave

Para mudar, vá em `components/GroupStandings.tsx` e procure:
```typescript
qualifiersPerGroup={2}  // Mude para 3, 4, etc.
```

### Mudar nomes das chaves
Não é necessário! Use qualquer nome:
- "Chave A", "Chave B" ✅
- "Grupo 1", "Grupo 2" ✅
- "Fase 1 - Piscina A", "Fase 1 - Piscina B" ✅
- Qualquer texto vale! ✅

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Classificação em tabela simples | Times sem campo `grupo` - Adicione grupo em todos |
| Times na ordem errada | Marque jogos como "finalizado" |
| Mostra 0 pontos | Verifique se placar foi salvo corretamente |
| Não vê saldo | Confirme que `placarTimeA_final` e `placarTimeB_final` existem |
| Só mostra 1 chave | Certifique que há times com nomes de chaves diferentes |

---

## 📞 Precisar de Ajuda?

Leia em ordem:
1. **Guia rápido**: Este arquivo (você está aqui!)
2. **Uso completo**: `GRUPO_CHAVEAMENTO_DOCS.md`
3. **Técnico detalhado**: `IMPLEMENTACAO_CHAVEAMENTO_TECNICO.md`
4. **Exemplo prático**: `EXEMPLO_EVENTO_CHAVEAMENTO.json`

---

## ⚡ TL;DR (Resumo Muito Rápido)

1. Crie evento com `formato: chaveamento`
2. Adicione times com campo `grupo` preenchido
3. Registre jogos com placar
4. Vá para "Classificação"
5. Pronto! Sistema mostra tabelas por chave automaticamente

---

**Você está pronto para usar! 🎉**

Qualquer dúvida, consulte a documentação ou o código em `components/GroupStandings.tsx`.
