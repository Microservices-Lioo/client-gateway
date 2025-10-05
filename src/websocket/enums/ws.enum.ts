export enum EWebSocket {
    COUNT = 'count', // count users for room
    ROOM_IDENTITY = 'room',
    CREATE_GAME = 'create-game',
    CELL_CARD = 'cell-card',
    BINGO = 'bingo',
    UPDATE_BINGO = 'update-bingo',
    UPDATE_STATUS_WINNER_MODAL = 'update-status-winner-modal',
    STATUS_GAME = 'status-game',
    HOST_ACTIVITY = 'host-activity',

    // listening
    ERROR = 'error',
    UNAUTHORIZED = 'unauthorized',
    COUNTER_STARTED = 'counterStarted',
    COUNTER_UPDATE = 'counterUpdate',
    COUNTER_FINISHED = 'counterFinished',
    TIEBREAKER_WINNER = 'tie-breaker-winner',
    WINNER = 'winner',
}