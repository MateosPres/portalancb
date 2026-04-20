
export interface UserProfile {
    uid: string;
    nome: string;
    apelido?: string;
    email: string;
    emailContato?: string; // Legacy: manter durante migracao para email unico
    role: 'admin' | 'jogador' | 'super-admin';
    status: 'active' | 'pending' | 'banned';
    dataNascimento?: string;
    linkedPlayerId?: string; // ID do jogador na collection 'jogadores' que este usuário controla
    fcmToken?: string; // Token para Notificações Push
    foto?: string | null;
}

export type RaridadeConquista = 'comum' | 'rara' | 'epica' | 'lendaria';
export type TipoIconeConquista = 'emoji' | 'imagem';

export interface BadgeOccurrenceContext {
    eventName?: string;
    gameName?: string;
    seasonYear?: string;
    playerName?: string;
    value?: string | number;
}

export interface BadgeOccurrence {
    id: string;
    descricao: string;
    data: string;
    gameId?: string;
    eventId?: string;
    seasonYear?: string;
    teamId?: string;
    teamNome?: string;
    contextLabel?: string;
    renderContext?: BadgeOccurrenceContext;
}

export interface Badge {
    id: string;
    nome: string;
    emoji: string;
    categoria: 'partida' | 'temporada' | 'atributo';
    origem?: 'regra' | 'legado';
    legacyGroupKey?: string;
    legacyBaseTitle?: string;
    raridade: RaridadeConquista; // Comum (Bronze), Rara (Prata), Epica (Ouro), Lendaria (MVP Season)
    data: string;
    descricao: string;
    gameId?: string;
    teamId?: string;
    teamNome?: string;
    eventId?: string;
    seasonYear?: string;
    regraId?: string;
    tipoAvaliacao?: 'pos_jogo' | 'pos_evento' | 'ao_fechar_temporada' | 'manual';
    tipoIcone?: TipoIconeConquista;
    iconeValor?: string;
    stackCount?: number;
    latestOccurrenceId?: string;
    ocorrencias?: BadgeOccurrence[];
}

export type TipoAvaliacaoConquista = 'pos_jogo' | 'pos_evento' | 'ao_fechar_temporada' | 'manual';

export type ConquistaGatilho =
    | { tipo: 'pontos_partida'; minimo: number }
    | { tipo: 'bolas_de_tres'; minimo: number }
    | { tipo: 'cestinha_partida' }
    | { tipo: 'top_atributo_jogo'; atributo: 'ataque' | 'defesa' | 'velocidade' | 'forca' | 'visao' }
    | { tipo: 'participacao_evento' }
    | { tipo: 'podio_campeao' }
    | { tipo: 'podio_vice' }
    | { tipo: 'podio_terceiro' }
    | { tipo: 'cestinha_evento' }
    | { tipo: 'pontos_totais_evento'; minimo: number }
    | { tipo: 'pontos_unico_jogo_evento'; minimo: number }
    | { tipo: 'bolas_de_tres_evento'; minimo: number }
    | { tipo: 'top_atributo_evento'; atributo: 'ataque' | 'defesa' | 'velocidade' | 'forca' | 'visao' }
    | { tipo: 'campeao_torneio_interno' }
    | { tipo: 'medalhista_torneio_externo' }
    | { tipo: 'ranking_pontos_temporada'; minimo: number }
    | { tipo: 'ranking_bolas_de_tres_temporada'; minimo: number }
    | { tipo: 'participou_todos_eventos_temporada' }
    | { tipo: 'conquistas_evento_temporada'; minimo: number }
    | { tipo: 'top_atributo_temporada'; atributo: 'ataque' | 'defesa' | 'velocidade' | 'forca' | 'visao' }
    | { tipo: 'manual_admin' };

export interface ConquistaRegra {
    id: string;
    titulo: string;
    descricao: string;
    descricaoTemplate?: string;
    raridade: RaridadeConquista;
    tipoIcone: TipoIconeConquista;
    iconeValor: string;
    tipoAvaliacao: TipoAvaliacaoConquista;
    gatilho: ConquistaGatilho | string;
    mensagemNotificacao: string;
    mensagemNotificacaoTemplate?: string;
    ativo: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export interface Player {
    id: string;
    nome: string;
    apelido?: string;
    email?: string;
    foto?: string;
    posicao: string;
    numero_uniforme: number;
    cpf?: string; // Admin only
    nascimento?: string;
    telefone?: string; // WhatsApp Format: 5566999999999
    userId?: string; // ID do usuário que reivindicou este perfil
    status?: 'active' | 'pending' | 'rejected' | 'banned'; // Controle de aprovação e banimento
    emailContato?: string; // Legacy: manter durante migracao para email unico
    // New Gamification Stats
    stats_tags?: Record<string, number>; // e.g. { 'muralha': 10, 'sniper': 5 }
    stats_atributos?: {
        ataque?: number;
        defesa?: number;
        velocidade?: number;
        forca?: number;
        visao?: number;
    };
    badges?: Badge[]; // Conquistas acumuladas
    pinnedBadgeIds?: string[]; // IDs das conquistas fixadas no perfil
    reputation?: number; // Score de Fair Play/Reputação
}

export interface RosterEntry {
    playerId: string;
    status: 'pendente' | 'confirmado' | 'recusado';
    updatedAt: any;
}

export interface ClaimRequest {
    id: string;
    userId: string;
    userName: string;
    playerId: string;
    playerName: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: any;
}

export interface EscaladoInfo {
    id: string;
    numero: number | string;
}

export interface Evento {
    id: string;
    nome: string;
    logoUrl?: string;
    data: string;
    modalidade: '3x3' | '5x5';
    type: 'torneio_externo' | 'torneio_interno' | 'amistoso';
    status: 'proximo' | 'andamento' | 'finalizado';
    // Updated to support both legacy string[] and new object array
    jogadoresEscalados?: (string | EscaladoInfo)[]; 
    adversario?: string; // Para amistosos
    times?: Time[]; // Para torneios internos
    
    // New External Tournament Fields
    formato?: 'chaveamento' | 'grupo_unico';
    podio?: {
        primeiro: string;
        segundo: string;
        terceiro: string;
    };
    timesParticipantes?: Time[]; // Para torneios externos
}

export interface Time {
    id: string;
    nomeTime: string;
    logoUrl?: string;
    jogadores: string[]; // IDs dos jogadores
    isANCB?: boolean; // Identifica se é um time da associação
    grupo?: string; // Para fase de grupos (A, B, C...)
    rosterStatus?: Record<string, 'pendente' | 'confirmado' | 'recusado'>; // Status de cada jogador (ID -> Status)
    rosterRefusalReason?: Record<string, string>; // Motivo da recusa (ID -> Motivo)
}

export interface Jogo {
    id: string;
    dataJogo: string;
    horaJogo?: string;
    status?: 'agendado' | 'andamento' | 'finalizado'; // Novo campo para controle
    adversario?: string; // Para externo/amistoso
    localizacao?: string; // Novo campo para local do jogo
    jogadoresEscalados?: string[]; // Lista de IDs de jogadores que jogaram
    fase?: 'fase_grupos' | 'oitavas' | 'quartas' | 'semi' | 'final'; // Fase do torneio (para chaveamento)
    
    // Placar Externo
    placarANCB_final?: number;
    placarAdversario_final?: number;

    // Placar Interno
    timeA_id?: string;
    timeA_nome?: string;
    timeB_id?: string;
    timeB_nome?: string;
    opponentMode?: 'external_string' | 'internal_team';
    placarTimeA_final?: number;
    placarTimeB_final?: number;
}

export interface Cesta {
    id: string;
    pontos: 1 | 2 | 3;
    timestamp: any; // Firestore Timestamp
    timeId?: string; // Optional if linked to jogo
    jogoId?: string; // Link direto ao jogo
    eventoId?: string; // Link direto ao evento
    jogadorId?: string | null;
    nomeJogador?: string | null;
}

export interface FeedPost {
    id: string;
    type: 'noticia' | 'placar' | 'aviso' | 'resultado_evento';
    timestamp: any; // serverTimestamp
    author_id?: string;
    userId?: string;
    image_url?: string | null;
    images?: string[];
    source?: 'manual' | 'auto_game_finalized' | 'auto_event_finalized';
    source_ref?: string;
    notifyPlayers?: boolean;
    content: {
        text?: string;
        titulo?: string;
        resumo?: string;
        time_adv?: string;
        placar_ancb?: number;
        placar_adv?: number;
        link_video?: string;
        eventId?: string;
        gameId?: string;
        teamAName?: string;
        teamBName?: string;
        resultado_label?: string;
        resultado_detalhes?: string;
    };
}

// --- INTERFACES ANTIGAS (Mantidas para compatibilidade se necessário, mas deprecated) ---
export interface PlayerReview {
    id: string;
    gameId: string;
    eventId: string;
    reviewerId: string; // Quem avaliou (ID do Jogador)
    reviewerName: string;
    reviewerPhoto?: string;
    revieweeId: string; // Quem foi avaliado
    rating: number; // 1 a 5
    emojiTag: string; // 'MVP', 'Garçom', etc.
    comment?: string;
    timestamp: any;
}

// --- NOVA ESTRUTURA DE GAMIFICAÇÃO ---

export type AtributoKey = 'ataque' | 'defesa' | 'velocidade' | 'forca' | 'visao';

export type ReviewAttributeMap = Partial<Record<AtributoKey, number>>;

export type TagType = 'positive' | 'negative';

export interface ReviewTagDefinition {
    id: string;
    label: string;
    emoji: string;
    type: TagType;
    description: string;
    // Impact on stats (0-3 scale usually) - UPDATED TO 5 ATTRIBUTES
    impact: ReviewAttributeMap;
}

export interface ReviewQuizConfig {
    version: number;
    maxSelections: number;
    multipliers: Record<number, number>;
    tags: ReviewTagDefinition[];
    updatedAt?: any;
    updatedBy?: string;
}

export interface NotificationItem {
    id: string;
    type: 'pending_review' | 'roster_invite' | 'evaluation' | 'roster_alert' | 'feed_alert' | 'new_user_pending_approval';
    title: string;
    message: string;
    data: any; // Dados extras (gameId, eventId, etc)
    read: boolean;
    timestamp: any;
}

export type MediaTemplate = 'story_game' | 'story_event' | 'story_lineup' | 'thumb_youtube';

export interface MediaPreset {
    width: number;
    height: number;
    ratioLabel: string;
    title: string;
    subtitle: string;
}

export type ViewState = 'home' | 'eventos' | 'evento-detalhe' | 'jogadores' | 'ranking' | 'admin' | 'painel-jogo' | 'public-game' | 'profile' | 'team-manager' | 'notifications' | 'apoiadores' | 'post-view';
