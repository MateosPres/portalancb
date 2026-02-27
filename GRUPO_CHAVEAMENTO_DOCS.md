# Sistema de Chaves - Documentação

## O que é o Sistema de Chaves?

O sistema de chaves (ou grupos) permite organizar campeonatos com múltiplos grupos, onde:
- Cada grupo (Chave A, B, C, etc.) contém um número de times que jogam entre si
- Todos os times dentro de um grupo se enfrentam (fase de grupos)
- Os 2 melhores times de cada grupo avançam para a semifinal baseado em pontuação
- A classificação é automaticamente calculada por pontos (2 por vitória, 1 por empate, 0 por derrota)

## Como Usar

### 1. Criando um Evento com Formato Chaveamento

- Na criação do evento, defina o campo `formato` como **`chaveamento`**
- O tipo do evento deve ser `torneio_externo`

### 2. Adicionando Times com Chaves

Quando adicionar times ao evento, cada time deve ter um campo `grupo` preenchido:

```typescript
{
  timeA: {
    id: "time1",
    nomeTime: "Time A",
    logoUrl: "...",
    jogadores: [...],
    grupo: "Chave A"  // ← Este é o campo importante!
  },
  timeB: {
    id: "time2",
    nomeTime: "Time B",
    logoUrl: "...",
    jogadores: [...],
    grupo: "Chave A"  // Mesmo grupo de timeA
  },
  timeC: {
    id: "time3",
    nomeTime: "Time C",
    logoUrl: "...",
    jogadores: [...],
    grupo: "Chave B"  // ← Grupo diferente
  },
  timeD: {
    id: "time4",
    nomeTime: "Time D",
    logoUrl: "...",
    jogadores: [...],
    grupo: "Chave B"  // Mesmo grupo de timeC
  }
}
```

### 3. Exibição da Classificação

Após registrar os resultados dos jogos:

1. Acesse a aba **"Classificação"** do evento
2. O sistema automaticamente exibirá:
   - **Tabelas separadas para cada chave**
   - **Ranking dentro de cada chave** (por pontos, depois por saldo de pontos)
   - **Destaque dos times que avançam** (2 primeiros de cada chave)
   - **Resumo dos times classificados para a semifinal**

### 4. Cálculo de Pontuação

A pontuação é calculada automaticamente:
- **Vitória**: 2 pontos
- **Empate**: 1 ponto
- **Derrota**: 0 pontos

**Critérios de desempate (em ordem):**
1. Maior número de pontos
2. Maior saldo de pontos (pontos marcados - pontos sofridos)

### 5. Qualificação para a Semifinal

Os times que qualificam para a semifinal são:
- **Os 2 primeiros colocados de cada Chave**
- Automaticamente indicados com o badge "Avança" na tabela
- Exibidos em uma seção especial "Times Classificados para a Semifinal"

## Estrutura de Dados no Firebase

```typescript
// Evento
{
  nome: "Campeonato ANCB 2024",
  data: "2024-05-15",
  tipo: "torneio_externo",
  formato: "chaveamento",  // ← Importante!
  timesParticipantes: [
    {
      id: string,
      nomeTime: string,
      logoUrl?: string,
      jogadores: string[],
      grupo: "Chave A"  // ← Campo que define a chave
    }
    // ... mais times
  ],
  // ... outros campos
}

// Jogo
{
  id: string,
  timeA_id: string,
  timeA_nome: string,
  timeB_id: string,
  timeB_nome: string,
  placarTimeA_final: number,
  placarTimeB_final: number,
  status: "finalizado",
  dataJogo: string,
  // ... outros campos
}
```

## Exemplo Prático

**Cenário**: Campeonato com 8 times, 2 chaves de 4 times cada

```
CHAVE A:
1. Team Alpha    8 pts (3V-2E-0D)  → Avança
2. Team Beta     7 pts (2V-1E-0D)  → Avança
3. Team Gamma    4 pts (1V-1E-1D)
4. Team Delta    0 pts (0V-0E-3D)

CHAVE B:
1. Team Omega    9 pts (3V-0E-0D)  → Avança
2. Team Sigma    6 pts (2V-0E-1D)  → Avança
3. Team Tau      3 pts (1V-0E-2D)
4. Team Kappa    0 pts (0V-0E-3D)

SEMIFINAL:
Team Alpha vs Team Sigma
Team Beta vs Team Omega
```

## Funcionalidades Incluídas

✅ Visualização de múltiplos grupos
✅ Cálculo automático de pontuação
✅ Classificação automática por pontos e saldo
✅ Indicação de times que avançam
✅ Resumo de qualificados para semifinal
✅ Design responsivo em desktop e mobile
✅ Suporte a tema claro/escuro
✅ Logos dos times na tabela

## Próximas Etapas

- Integração automática dos jogadores da semifinal baseado na classificação
- Suporte a mais de 2 qualificados por grupo
- Permitir configuração do número de grupos dinamicamente
- Visualização de bracket após as semifinais com os winners automaticamente preenchidos

## Suporte

Para dúvidas ou melhorias, consulte a documentação ou o desenvolvedor.
