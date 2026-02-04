export interface UserProfile {
    uid: string;
    nome: string;
    apelido?: string;
    email: string;
    role: 'admin' | 'jogador';
    status: 'active' | 'banned';
    dataNascimento?: string;
    linkedPlayerId?: string; // ID do jogador na collection 'jogadores' que este usuário controla
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
    userId?: string; // ID do usuário que reivindicou este perfil
    status?: 'active' | 'pending' | 'rejected' | 'banned'; // Controle de aprovação e banimento
    emailContato?: string;
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

export interface Evento {
    id: string;
    nome: string;
    data: string;
    modalidade: '3x3' | '5x5';
    type: 'torneio_externo' | 'torneio_interno' | 'amistoso';
    status: 'proximo' | 'andamento' | 'finalizado';
    jogadoresEscalados?: string[];
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
    adversario?: string; // Para externo/amistoso
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

export type ViewState = 'home' | 'eventos' | 'jogadores' | 'ranking' | 'admin' | 'painel-jogo' | 'profile';