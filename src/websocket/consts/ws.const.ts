import { EWebSocket } from "../enums/ws.enum";

export const WsConst = {
    socket: (roomId: string) => `${roomId}:socket`,
    room: (roomId: string) => `${roomId}:room`,
    game: (roomId: string) => `${roomId}:game`,
}