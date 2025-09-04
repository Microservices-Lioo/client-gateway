export enum WsEnum {
    // rooms
    ROOM_IDENTITY = 'room',

    // listening
    ERROR = 'error',
    UNAUTHORIZED = 'unauthorized',
    COUNTER_STARTED = 'counterStarted',
    COUNTER_UPDATE = 'counterUpdate',
    COUNTER_FINISHED = 'counterFinished',
    TIEBREAKER_WINNER = 'tie-breaker-winner',
    WINNER = 'winner',
}