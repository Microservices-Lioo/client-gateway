export interface GameEntity {
    id: number;
    eventId: number;
    start_time: Date;
    end_time?: Date;
}