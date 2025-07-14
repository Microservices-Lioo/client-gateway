export enum StatusSing {
  VERIFIED = "verified", 
  REJECTED = "rejected", 
  PENDING = "pending"
}

export interface Sing {
  id: string,
  userId: number,
  cardId: number,
  eventId: number,
  fullnames: string,
  hour: string,
  status: StatusSing
}

export interface RoomState {
  isCounterActive: boolean;
  counter: number;
  counterId?: NodeJS.Timeout;
  songs?: Sing[] 
}