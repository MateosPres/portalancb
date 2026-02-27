# Implementação do Sistema de Chaves - Guia Técnico

## Resumo das Mudanças

Este documento descreve as alterações técnicas implementadas para adicionar o suporte a sistema de chaves (grupos) na visualização de classificação de campeonatos.

## Arquivos Criados

### 1. `components/GroupStandings.tsx`
Novo componente React que centraliza a lógica de:
- Agrupamento de times por chave (`grupo` field)
- Cálculo de pontuação e classificação dentro de cada grupo
- Renderização de tabelas por grupo
- Indicação automática de times que avançam

**Principais Props:**
```typescript
interface GroupStandingsProps {
    timesParticipantes: Time[];      // Array de times
    games: Jogo[];                    // Array de jogos finalizados
    format: 'chaveamento' | 'grupo_unico';  // Formato do evento
    qualifiersPerGroup?: number;      // Quantos times avançam por grupo (default: 2)
}
```

**Características:**
- ✅ Agrupa times automaticamente pelo campo `grupo`
- ✅ Calcula: Vitórias, empates, derrotas, pontos
- ✅ Ordena por pontos totais, depois por saldo
- ✅ Marca os qualificados (2 primeiros)
- ✅ Exibe resumo final dos times que avançam
- ✅ Responsivo e tema claro/escuro

### 2. Arquivo de Documentação: `GRUPO_CHAVEAMENTO_DOCS.md`
Guia prático para uso do sistema com:
- Como criar eventos com chaveamento
- Como adicionar times com grupos
- Como visualizar a classificação
- Exemplo prático passo a passo
- Estrutura de dados esperada

### 3. Arquivo de Exemplo: `EXEMPLO_EVENTO_CHAVEAMENTO.json`
Exemplo JSON completo mostrando:
- Estrutura de um evento com chaveamento
- 8 times divididos em 2 chaves (A e B)
- Jogos de exemplo
- Resultado esperado da classificação

## Arquivos Modificados

### `views/EventoDetalheView.tsx`

**Mudança 1: Importação do novo componente**
```tsx
import { GroupStandings } from '../components/GroupStandings';
```

**Mudança 2: Lógica de renderização condicional**
Na seção de classificação (linha ~1160), a lógica foi enriquecida para tornar a visualização mais natural em torneios com chaves:

1. Se `evento.formato === 'chaveamento'`:
   * primeiro renderiza sempre o componente `<GroupStandings />`, exibindo a fase de grupos/classificatória;
   * em seguida, só exibe o bracket de mata‑mata (quartas/semifinal/final) **se houver partidas com `fase` diferente de `'grupo'`**;
   * o próprio conjunto de colunas do bracket é gerado dinamicamente, omitindo fases que ainda não existem (por exemplo, não mostra quartas em eventos com apenas duas chaves).
2. Se o formato for outro, mantém-se o comportamento anterior:
   * se existirem times com `grupo`, mostra `<GroupStandings />`;
   * caso contrário, exibe a tabela simples ordenada por pontos.

```tsx
{event.formato === 'chaveamento' ? (
    <>
        {/* fase de grupos */}
        <GroupStandings ... />

        {/* bracket opcional, somente quando houver jogos de mata‑mata */}
        {games.some(g => (g as any).fase && g.fase !== 'grupo') && (
            <div className="overflow-x-auto pb-4">
                {/* código de bracket adaptável */}
            </div>
        )}
    </>
) : (
    // Novo: Renderiza classificação por chaves OR tabela simples
    (() => {
        const hasGroupsData = event.timesParticipantes?.some(t => t.grupo && t.grupo.trim());
        
        if (hasGroupsData) {
            return <GroupStandings ... />;
        }
        // Tabela simples (fallback)
        return <div>...</div>;
    })()
)}
```

## Estrutura de Dados

### Interface Time (tipos.ts) - Campo existente
```typescript
export interface Time {
    id: string;
    nomeTime: string;
    logoUrl?: string;
    jogadores: string[];
    isANCB?: boolean;
    grupo?: string;  // ← Campo usado para chaveamento
    rosterStatus?: Record<string, 'pendente' | 'confirmado' | 'recusado'>;
    rosterRefusalReason?: Record<string, string>;
}
```

### Interface Evento (tipos.ts) - Campo existente
```typescript
export interface Evento {
    id: string;
    nome: string;
    data: string;
    modalidade: '3x3' | '5x5';
    type: 'torneio_externo' | 'torneio_interno' | 'amistoso';
    status: 'proximo' | 'andamento' | 'finalizado';
    formato?: 'chaveamento' | 'grupo_unico';  // ← Usado para determinar visualização
    timesParticipantes?: Time[];
    // ... outros campos
}
```

## Lógica de Cálculo

### Pontuação
- **Vitória**: 2 pontos
- **Empate**: 1 ponto
- **Derrota**: 0 pontos

### Critérios de Desempate (ordenação)
1. Pontos totais (descendente)
2. Saldo de pontos (pontos marcados - pontos sofridos, descendente)

### Qualificação
Os N primeiros times de cada grupo avançam (configurável, padrão: 2)

## Exemplo de Uso

### 1. Criar um Evento com Chaveamento
```tsx
const novoEvento: Evento = {
    id: 'evento_1',
    nome: 'Campeonato ANCB 2024',
    data: '2024-05-15',
    modalidade: '5x5',
    type: 'torneio_externo',
    status: 'proximo',
    formato: 'chaveamento',  // ← Importante!
    timesParticipantes: [...]
};
```

### 2. Adicionar Times com Grupos
```tsx
const timesComGrupos: Time[] = [
    {
        id: 'time_1',
        nomeTime: 'Team A',
        grupo: 'Chave A',  // ← Campo obrigatório
        jogadores: [...]
    },
    {
        id: 'time_2',
        nomeTime: 'Team B',
        grupo: 'Chave A',  // Mesmo grupo
        jogadores: [...]
    },
    {
        id: 'time_3',
        nomeTime: 'Team C',
        grupo: 'Chave B',  // Grupo diferente
        jogadores: [...]
    }
];
```

### 3. Visualizar Classificação
- Navigate para o evento
- Clique na aba "Classificação"
- Se houver times com `grupo` preenchido:
  - Verá tabelas separadas por chave
  - Cada tabela mostra ranking com times que avançam
  - Seção final resume todos os qualificados

## Compatibilidade

✅ **Compatível com estrutura existente**
- Não quebra eventos antigos sem chaves
- Graceful fallback para tabela simples

✅ **Compatível com ambos os formatos**
- `formato: 'chaveamento'` - Mostra bracket + chaves
- `formato: 'grupo_unico'` - Mostra tabela simples

✅ **Funciona com todas as modalidades**
- 3x3
- 5x5

✅ **Suporte tema claro/escuro**
- Todas as cores adaptadas com `dark:` classes

## Customizações Futuras

Possibilidades de expansão:

1. **Número de qualificados variável**
   - Atualmente hardcoded como 2
   - Pode ser [configurável por evento]

2. **Visualização de bracket interativa**
   - Permitir preencher bracket da semifinal com os qualificados

3. **Número de chaves variável**
   - Suportar 3, 4+ chaves dinamicamente

4. **Critérios de desempate customizados**
   - Permitir admin definir ordem de critérios

5. **Análise estatística por chave**
   - Gráficos de desempenho
   - Comparação entre chaves

## Performance

- **O(n)** para agrupamento de times
- **O(n*m)** para cálculo de pontuação (n=times, m=jogos)
- **Renderizações memoizadas** dentro de cada grupo
- Sem chamadas de API adicionais (usa dados existentes)

## Testes Recomendados

1. ✅ Evento com 2 chaves, 4 times cada
2. ✅ Evento com 3 chaves com tamanhos diferentes
3. ✅ Evento com times sem grupo (fallback)
4. ✅ Evento com 1 jogo finalizado
5. ✅ Evento com empates entre times
6. ✅ Visualização em mobile
7. ✅ Tema claro/escuro

## Troubleshooting

**Problema**: Classificação não mostra as chaves
- **Solução**: Verifique se o campo `grupo` está preenchido nos times

**Problema**: Times não aparecem em ordem correta
- **Solução**: Confirme que os jogos têm `status: 'finalizado'`

**Problema**: Números de pontos incorretos
- **Solução**: Verifique se `placarTimeA_final` e `placarTimeB_final` estão definidos

## Suporte

Para dúvidas técnicas ou bugs, consulte:
- A documentação de uso: `GRUPO_CHAVEAMENTO_DOCS.md`
- O exemplo de dados: `EXEMPLO_EVENTO_CHAVEAMENTO.json`
- O código do componente: `components/GroupStandings.tsx`
