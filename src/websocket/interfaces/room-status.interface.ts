export interface RoomState {
  isCounterActive: boolean;
  counter: number;
  counterId?: NodeJS.Timeout;
}