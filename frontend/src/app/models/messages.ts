export interface BaseMessage {
    type: string;
}

export interface Player {
    username: string;
    x: number;
    y: number;
    xp: number;
}

export interface PlayerJoinedMessage extends BaseMessage {
    player: Player;
}

export interface PlayerLocationMessage extends BaseMessage {
    player: Player;
}

export interface AllPlayersLocationsMessage extends BaseMessage {
    players: PlayerLocationMessage[];
}

export interface GetAllPlayersLocationsMessage extends BaseMessage {
    username: string;
}

export interface PlayerLeftMessage extends BaseMessage {
    player: Player;
}

export interface PlayerMovedLocationMessage extends BaseMessage {
    player: Player;
}

export interface updatePlayerXPMessage extends BaseMessage {
    username: string;
    xpToAdd: number;
}

export interface PlayerShotMessage extends BaseMessage {
    username: string;
    x: number;
    y: number;
    velX: number;
    velY: number;
}

export interface Bullet {
    x: number;
    y: number;
}

export interface BulletsUpdateMessage extends BaseMessage {
    username: string;
    bullets: Bullet[];
}

export interface PlayerHitMessage extends BaseMessage {
    player: Player;
}