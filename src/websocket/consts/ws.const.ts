import { EWebSocket } from "../enums/ws.enum";

export const WsConst = {
    countUser: (roomId: string) => `${roomId}:users`,
    room: (roomId: string) => `room:${roomId}`,
    game: (roomId: string) => `room:${roomId}:game`,
    award: (roomId: string) => `room:${roomId}:award`,

    statusRoom: (roomId: string) => `room:${roomId}:status`,
    statusHostRoom: (roomId: string) => `room:${roomId}:statushost`,
    getCellCard: (roomId: string) => `room:${roomId}:cell:card`,
    count: (roomId: string) => `room:${roomId}:count`,
    tableWinners: (roomId: string) => `room:${roomId}:tablewinners`,
    myBingo: (roomId: string) => `room:${roomId}:mybingo`,
    winnerModal: (roomId: string) => `room:${roomId}:winnerModal`,
    statusGame: (roomId: string) => `room:${roomId}:statusGame`,
    activityHost: (roomId: string) => `room:${roomId}:activityHost`,
    awardStatus: (roomId: string) => `room:${roomId}:awardStatus`,
    rouletteStatus: (roomId: string) => `room:${roomId}:rouletteStatus`,
    rouletteWinner: (roomId: string) => `room:${roomId}:rouletteWinner`,
}