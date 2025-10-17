import { EStatusHostRoom, EStatusRoom } from "../enums";

export interface IRoom {
    id: string;
    eventId: string;
    status: EStatusRoom;
    status_host: EStatusHostRoom;
    start_time: Date;
    end_time?: Date | null;
}