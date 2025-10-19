export enum EWebSocket {
    COUNT = 'count', // count users for room
    ROOM_IDENTITY = 'room',
    CREATE_GAME = 'create-game',
    CELL_CARD = 'cell-card',
    BINGO = 'bingo',
    UPDATE_BINGO = 'update-bingo',
    UPDATE_STATUS_WINNER_MODAL = 'update-status-winner-modal',
    HOST_ACTIVITY = 'host-activity',
    AWARD_STATUS = 'award-status',
    ROULETTE_STATUS = 'roulette-status',
    ROULETTE_WINNER = 'roulette-winner',
    CLEAN_TABLE_SONGS = 'clean-table-songs',

    END_GAME = 'end-game',
    END_ROOM = 'end-room',

    // listening
    ERROR = 'error',
    UNAUTHORIZED = 'unauthorized',
    COUNTER_STARTED = 'counterStarted',
    COUNTER_UPDATE = 'counterUpdate',
    COUNTER_FINISHED = 'counterFinished',
    TIEBREAKER_WINNER = 'tie-breaker-winner',
    WINNER = 'winner',
}