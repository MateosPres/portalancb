
export interface UserProfile {
    uid: string;
    nome: string;
    apelido?: string;
    email: string;
    role: 'admin' | 'jogador' | 'super-admin';
    status: 'active' | 'banned';
    dataNascimento?: string;
    linkedPlayerId?: string; // ID do jogador na collection 'jogadores' que este usuário controla
    fcmToken?: string; // Token para Notificações Push
}

export interface Badge {
    id: string;
    nome: string;
    emoji: string;
    categoria: 'partida' | 'temporada' | 'atributo';
    raridade: 'comum' | 'rara' | 'epica' | 'lendaria'; // Comum (Bronze), Rara (Prata), Epica (Ouro), Lendaria (MVP Season)
    data: string;
    descricao: string;
    gameId?: string;
}

export interface Player {
    id: string;
    nome: string;
    apelido?: string;
    foto?: string;
    posicao: string;
    numero_uniforme: number;
    cpf?: string; // Admin only
    nascimento?: string;
    telefone?: string; // WhatsApp Format: 5566999999999
    userId?: string; // ID do usuário que reivindicou este perfil
    status?: 'active' | 'pending' | 'rejected' | 'banned'; // Controle de aprovação e banimento
    emailContato?: string;
    // New Gamification Stats
    stats_tags?: Record<string, number>; // e.g. { 'muralha': 10, 'sniper': 5 }
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

export interface PhotoRequest {
    id: string;
    playerId: string;
    playerName: string;
    userId: string;
    newPhotoUrl: string;
    currentPhotoUrl?: string; // Para comparação
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
    data: string;
    modalidade: '3x3' | '5x5';
    type: 'torneio_externo' | 'torneio_interno' | 'amistoso';
    status: 'proximo' | 'andamento' | 'finalizado';
    // Updated to support both legacy string[] and new object array
    jogadoresEscalados?: (string | EscaladoInfo)[]; 
    adversario?: string; // Para amistosos
    times?: Time[]; // Para torneios internos
}

export interface Time {
    id: string;
    nomeTime: string;
    logoUrl?: string;
    jogadores: string[]; // IDs dos jogadores
}

export interface Jogo {
    id: string;
    dataJogo: string;
    status?: 'agendado' | 'andamento' | 'finalizado'; // Novo campo para controle
    adversario?: string; // Para externo/amistoso
    localizacao?: string; // Novo campo para local do jogo
    jogadoresEscalados?: string[]; // Lista de IDs de jogadores que jogaram
    
    // Placar Externo
    placarANCB_final?: number;
    placarAdversario_final?: number;

    // Placar Interno
    timeA_id?: string;
    timeA_nome?: string;
    timeB_id?: string;
    timeB_nome?: string;
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
    type: 'placar' | 'noticia' | 'aviso';
    timestamp: any; // serverTimestamp
    author_id: string;
    image_url?: string | null;
    content: {
        titulo?: string;
        resumo?: string;
        time_adv?: string;
        placar_ancb?: number;
        placar_adv?: number;
        link_video?: string;
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

export type TagType = 'positive' | 'negative';

export interface ReviewTagDefinition {
    id: string;
    label: string;
    emoji: string;
    type: TagType;
    description: string;
    // Impact on stats (0-3 scale usually) - UPDATED TO 5 ATTRIBUTES
    impact: {
        ataque?: number;
        defesa?: number;
        velocidade?: number;
        forca?: number;
        visao?: number; // Visão de Jogo
    }
}

export interface NotificationItem {
    id: string;
    type: 'pending_review' | 'roster_alert';
    title: string;
    message: string;
    data: any; // Dados extras (gameId, eventId, etc)
    read: boolean;
    timestamp: any;
}

export type ViewState = 'home' | 'eventos' | 'evento-detalhe' | 'jogadores' | 'ranking' | 'admin' | 'painel-jogo' | 'profile';
