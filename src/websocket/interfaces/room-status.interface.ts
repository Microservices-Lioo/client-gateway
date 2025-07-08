export interface Sing {
  id: string,
  userId: number,
  fullnames: string,
  hour: string,
}

export interface RoomState {
  isCounterActive: boolean;
  counter: number;
  counterId?: NodeJS.Timeout;
  songs?: Sing[] 
}