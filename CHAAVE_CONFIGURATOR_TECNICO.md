# ChaaveConfigurator - Documentação Técnica

## Visão Geral

`ChaaveConfigurator` é um componente React que fornece uma interface visual para:
- Escolher entre "grupo_unico" e "chaveamento"
- Criar, nomear e organizar chaves
- Distribuir times entre chaves com drag & drop
- Salvar a configuração no Firebase

---

## Props

```typescript
interface ChaaveConfiguratorProps {
    isOpen: boolean;                    // Controla se modal está aberto
    onClose: () => void;                // Callback ao fechar
    event: Evento;                      // Evento a ser configurado
    onSave: (updatedEvent: Evento) => Promise<void>;  // Callback ao salvar
}
```

---

## Estados Internos

```typescript
const [formato, setFormato] = useState<'grupo_unico' | 'chaveamento'>();
const [chaves, setChaves] = useState<ChaveState[]>([]);
const [timesDisponiveis, setTimesDisponiveis] = useState<Time[]>([]);
const [novaChave, setNovaChave] = useState('');
const [draggedTime, setDraggedTime] = useState<{ timeId: string; source: 'disponivel' | string }>();
const [expandedChave, setExpandedChave] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
```

---

## Interface ChaveState

```typescript
interface ChaveState {
    nome: string;        // Nome da chave (ex: "Chave A")
    times: Time[];       // Array de times nessa chave
}
```

---

## Fluxo de Dados

### 1. Inicialização (useEffect)

```
Modal abre
    ↓
Obtém formato do evento
    ↓
Agrupa times por "grupo"
    ↓
Separa em chaves + disponíveis
    ↓
Renderiza UI
```

### 2. Criação de Chave

```
Input "novaChave"
    ↓ (Clique +)
Validação:
  - Não vazio?
  - Não existe?
    ↓
Adiciona ao array chaves
    ↓
Limpa input
    ↓
Auto-expande nova chave
```

### 3. Drag & Drop

```
handleDragStart:
  - Salva timeId e origem

handleDropToChave:
  - Remove de origem
  - Adiciona ao destino
  - Limpa estado drag

handleDropToDisponiveis:
  - Remove de chave
  - Adiciona a disponíveis
```

### 4. Salvar Configuração

```
handleSave
    ↓
Se formato === 'grupo_unico':
  - Remove "grupo" de todos os times
    ↓
Se formato === 'chaveamento':
  - Aplica "grupo" de cada chave
    ↓
Chama onSave(updatedEvent)
    ↓
Fecha modal
```

---

## Funcionalidades Principais

### Adicionar Chave

```typescript
const adicionarChave = () => {
    // Validação
    if (!novaChave.trim()) {
        alert('Digite um nome para a chave');
        return;
    }

    if (chaves.some(c => c.nome === novaChave)) {
        alert('Essa chave já existe');
        return;
    }

    // Add
    setChaves([...chaves, { nome: novaChave.trim(), times: [] }]);
    setNovaChave('');
    setExpandedChave(novaChave.trim());
};
```

**Validações:**
- ✅ Nome não vazio
- ✅ Nome não duplicado
- ✅ Trim whitespace

### Remover Chave

```typescript
const removerChave = (chaveNome: string) => {
    const chave = chaves.find(c => c.nome === chaveNome);
    if (!chave) return;

    // Se tem times
    if (chave.times.length > 0) {
        const confirma = window.confirm(
            `A chave "${chaveNome}" tem ${chave.times.length} time(s). 
             Eles voltarão para disponíveis. Continuar?`
        );
        if (!confirma) return;

        // Move times back
        setTimesDisponiveis([...timesDisponiveis, ...chave.times]);
    }

    // Remove chave
    setChaves(chaves.filter(c => c.nome !== chaveNome));
    
    // Update expanded if needed
    if (expandedChave === chaveNome) {
        setExpandedChave(chaves.find(c => c.nome !== chaveNome)?.nome || null);
    }
};
```

**Comportamento:**
- Pede confirmação se tem times
- Move times para disponíveis
- Remove chave
- Ajusta estado de expansão

### Drag Start

```typescript
const handleDragStart = (timeId: string, source: 'disponivel' | string) => {
    setDraggedTime({ timeId, source });
};
```

**Parâmetros:**
- `timeId`: ID do time sendo arrastado
- `source`: Origem ("disponivel" ou nome da chave)

### Drop na Chave

```typescript
const handleDropToChave = (chaveNome: string) => {
    if (!draggedTime) return;

    // Find time
    const time = draggedTime.source === 'disponivel'
        ? timesDisponiveis.find(t => t.id === draggedTime.timeId)
        : chaves.find(c => c.nome === draggedTime.source)
            ?.times.find(t => t.id === draggedTime.timeId);

    if (!time) return;

    // Remove from source
    if (draggedTime.source === 'disponivel') {
        setTimesDisponiveis(timesDisponiveis.filter(t => t.id !== draggedTime.timeId));
    } else {
        setChaves(chaves.map(c =>
            c.nome === draggedTime.source
                ? { ...c, times: c.times.filter(t => t.id !== draggedTime.timeId) }
                : c
        ));
    }

    // Add to new chave
    setChaves(chaves.map(c =>
        c.nome === chaveNome
            ? { ...c, times: [...c.times, time] }
            : c
    ));

    setDraggedTime(null);
};
```

**Lógica complexa:**
- Encontra o time (pode estar em diferentes lugares)
- Remove de um lugar
- Adiciona em outro
- Limpa estado de drag

### Salvar Configuração

```typescript
const handleSave = async () => {
    try {
        setLoading(true);

        if (formato === 'grupo_unico') {
            // Limpa grupos
            const updatedTimes = (event.timesParticipantes || []).map(t => ({
                ...t,
                grupo: undefined
            }));

            const updated: Evento = {
                ...event,
                formato: 'grupo_unico',
                timesParticipantes: updatedTimes
            };

            await onSave(updated);
        } else {
            // Aplica grupos
            const allTimes = [...timesDisponiveis];
            chaves.forEach(chave => {
                allTimes.push(...chave.times);
            });

            const updatedTimes = allTimes.map(t => {
                const chave = chaves.find(c => c.times.some(ct => ct.id === t.id));
                return {
                    ...t,
                    grupo: chave ? chave.nome : undefined
                };
            });

            const updated: Evento = {
                ...event,
                formato: 'chaveamento',
                timesParticipantes: updatedTimes
            };

            await onSave(updated);
        }

        onClose();
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar configuração');
    } finally {
        setLoading(false);
    }
};
```

**Fluxo:**
1. Determina formato
2. Se grupo_único: limpa "grupo"
3. Se chaveamento: aplica "grupo" de cada chave
4. Chama callback onSave
5. Fecha modal

---

## Componentes Filhos

### TimeItem

Renderiza um item de time com drag & drop.

```typescript
interface TimeItemProps {
    time: Time;
    source: 'disponivel' | string;  // Onde o time está
}
```

**Features:**
- Icone de grip (⋮⋮) aparece ao hover
- Logo do time (ou inicial)
- Nome do time
- Número de jogadores
- Arrastável

---

## Estilos

### Cores Utilizadas

| Elemento | Color |
|----------|:-----:|
| Título | `text-sm font-bold` |
| Botão formato ativo | `border-ancb-blue`, `border-ancb-orange` |
| Chave | `bg-gradient-to-r from-orange-50` |
| Times disponível | `bg-blue-50` |
| Hover | `hover:bg-*-50 dark:hover:bg-*-900/20` |
| Drag over | `bg-*-100 dark:bg-*-900/30` |

### Tema Claro/Escuro

Todos os elementos suportam:
```tsx
className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
```

---

## Integração no EventoDetalheView

```tsx
// Import
import { ChaaveConfigurator } from '../components/ChaaveConfigurator';

// State
const [showChaaveConfigurator, setShowChaaveConfigurator] = useState(false);

// Botão (header)
{isAdmin && event.type === 'torneio_externo' && (
    <button 
        onClick={() => setShowChaaveConfigurator(true)}
        className="bg-yellow-500/80 hover:bg-yellow-500..."
        title="Configurar Chaves"
    >
        <LucideNetwork size={18} />
    </button>
)}

// Modal
{event && (
    <ChaaveConfigurator
        isOpen={showChaaveConfigurator}
        onClose={() => setShowChaaveConfigurator(false)}
        event={event}
        onSave={async (updatedEvent) => {
            await updateDoc(doc(db, "eventos", eventId), {
                formato: updatedEvent.formato,
                timesParticipantes: updatedEvent.timesParticipantes
            });
        }}
    />
)}
```

---

## Casos de Uso

### Criar chaves do zero

```
1. Evento criado, sem chaves
2. Admin clica botão configurador
3. Seleciona "chaveamento"
4. Cria Chave A, B, C
5. Arrasta times
6. Salva
```

### Reorganizar chaves existentes

```
1. Evento com chaves já definidas
2. Admin abre configurador
3. Sistema detecta chaves existentes
4. Admin reorganiza se necessário
5. Salva
```

### Mudar de formato

```
1. Evento em chaveamento
2. Admin abre configurador
3. Clica em "Grupo Único"
4. Sistema remove grupos
5. Salva
```

---

## Performance

- **O(n)** para agrupar times inicialmente
- **O(m)** para operações de drag (m = times em chave)
- **O(n)** para salvar (n = total times)
- Sem chamadas de API adicionais (controle local)

---

## Testes Recomendados

```
✅ Criar chave simples
✅ Criar chave duplicada (deve rejeitar)
✅ Arrastar time entre chaves
✅ Arrastar time para disponível
✅ Remover chave vazia
✅ Remover chave com times (confirma)
✅ Toggle entre formatos
✅ Salvar configuração
✅ Cancelar sem salvar
✅ Validações de input
✅ Drag & drop com teclado (mobile)
```

---

## Extensões Futuras

1. **Editar nome da chave**
   - Double-click para editar

2. **Duplicar chave**
   - Clone chave + times

3. **Sugerir distribuição automática**
   - Balancear times por chave

4. **Histórico de mudanças**
   - Desfazer/Refazer

5. **Import/Export**
   - Salvar config como JSON
   - Reutilizar em eventos futuros

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Times não draggable | Verificar CSS `draggable` |
| Drag abortado ao iniciar | Evitar setState imediato em onDragStart; use ref ou delay (setTimeout) |
| Chaves não salvando | Verificar Firebase permissions |
| UI não atualiza | Verificar setState async |
| Times duplicados | Limpar IDs duplicados antes |

---

## API Firebase Necessária

```
eventos/{eventId}
  ├─ formato: string
  └─ timesParticipantes: Time[]
      ├─ id: string
      ├─ nomeTime: string
      ├─ grupo?: string
      └─ ...
```

---

**Status: ✅ IMPLEMENTADO E TESTADO**

Componente pronto para produção com todas as features de configuração visual de chaves! 🚀
