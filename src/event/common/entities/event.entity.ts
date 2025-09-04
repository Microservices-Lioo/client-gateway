import { StatusEvent } from "../enums";

export class EventEntity {
    id: string;
    name: string;
    description: string;
    userId: string;
    status: StatusEvent;
    start_time: Date;
    end_time: Date;
    price: number;
    host_is_active: boolean;
}
