import { StatusEvent } from "../enums";

export class EventEntity {
    id: number;
    name: string;
    description: string;
    userId: number;
    status: StatusEvent;
    start_time: string;
    price: number;
}
