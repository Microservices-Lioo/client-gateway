import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom, timeout } from 'rxjs';
import { IAward, ICard, IGame, IMode, IRoom } from 'src/shared/interfaces';
import { envs, NATS_SERVICE } from 'src/config';
import { EStatusHost, ERoleMember } from './enums';
import { IMember, INumberHistory } from './interfaces';
import { EStatusEvent, EStatusRoom } from 'src/shared/enums';

@Injectable()
export class WebSocketService {  
  private readonly logger = new Logger('WebSocket Service');

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) { }

  //* Usuarios conectados a una sala
  async connectedPlayers(roomId: string): Promise<number> {
    try {
      const count: number = await firstValueFrom(
        this.client.send('countUsersToRoom', { roomId }).pipe(
          timeout(5000)
        )
      );
      return count;
    } catch (error) {
      this.logger.error('Error al obtener la cantidad de usuario en la sala', error);
      return 0;
    }
  }

  //* Verificación de rol de sala
  async verifyRole(roomId: string, userId: string) {
    const role = await firstValueFrom(
      this.client.send<IMember>('findRoleMemberRoom', {roomId, userId})
    );
    return role;
  }

  //* Verificar el estado del host en la sala
  async offlineStatusHost(roomId: string, userId: string, status: EStatusHost) {
    const role = await firstValueFrom(
      this.client.send<IMember>('findRoleMemberRoom', {roomId, userId})
    );

    if (role && role.role === ERoleMember.HOST) {
      const room = await firstValueFrom(
        this.client.send<IRoom>('updateStatusHostRoom', {roomId, status})
      );
      return room;
    }
    return null;
  }

  //* Creación del juego y actualización del premio
  async createGame(roomId: string, awardId: string, modeId: string) {
    try {
      const game = await firstValueFrom(
        this.client.send<IGame>('createGame', {roomId, modeId}).pipe(
          timeout(5000)
        )
      );

      // Actualización del premio
      const award = await firstValueFrom(
        this.client.send<IAward>('updateAward', {id: awardId, gameId: game.id}).pipe(
          timeout(5000)
        )
      );
      return { game, award};
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  //* Obtener una celda para tabla de bingo único
  async getCellCard(roomId: string, gameId: string): Promise<number | null> {
    try {
      // Obtengo los números cantados en el juego
      const numberHistory = await firstValueFrom(
        this.client.send<null | INumberHistory>('getNumsGame', {roomId, gameId}).pipe(
          timeout(5000)
        )
      );
      
      if (!numberHistory) {
        // Creo un historial para los números cantados del juego
        const nums = await firstValueFrom(
          this.client.send<null | number[]>('createHistoryGame', {gameId}).pipe(
            timeout(5000)
          )
        );
        return nums[0];
      }

      // Creo un numero único diferente a los del array nums
      const num = this.generateNumberUnique(numberHistory.nums);

      if (!num) return num;

      this.client.emit('updateHistoryGame', {id: numberHistory.id, num: num});
      return num;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  //* Verificar canto valido y guardar
  async bingo(userId: string, cardId: string, numberHistoryId: string, modeId: string) {
    try {
      
      const card = await lastValueFrom(
        this.client.send<ICard>('findOneCard', cardId)
      );

      if (card.buyer != userId) {
        return 'No te pertenece este canto';
      }
      const numsHistory = await lastValueFrom(
        this.client.send<INumberHistory>('getNumberHistoryGame', { id: numberHistoryId})
      );

      const mode = await lastValueFrom(
        this.client.send<IMode>('findOneMode', {modeId})
      );

      const isValid = await this.isValid(card.nums, numsHistory.nums, mode.rule);

      if (isValid) {
        return 'enviado';
      } else {
        return 'El canto no es válido';
      }
    } catch (error) {
      this.logger.error(error);
      return 'Ocurrio un error, intentalo nuevamente';
    }
  }

  //* Terminar Sala
  async endRoom(roomId: string) {
    try {
      // termino la sala
      const room = await lastValueFrom(
        this.client.send<IRoom>('updateRoom', 
          {id: roomId, status: EStatusRoom.FINISHED, end_time: new Date()})
      );

      const { eventId } = room;
      // termino el evento
      await lastValueFrom(
        this.client.send('updateEvent', 
          {id: eventId, status: EStatusEvent.COMPLETED, end_time: new Date()})
      );

    } catch (error) {
      this.logger.error(error);
    }
  }

  generateNumberUnique(nums: number[]): number | null {
    const MAX_NUMBER_BINGO = envs.MAX_NUMBER_BINGO;
    const numsSet = new Set(nums);

    if (numsSet.size >= MAX_NUMBER_BINGO) {
      return null;
    }

    const availableNumbers = [];
    for (let i = 1; i <= MAX_NUMBER_BINGO; ++i) {
      if (!numsSet.has(i)) {
        availableNumbers.push(i);
      }
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    return availableNumbers[randomIndex];
  }

  async isValid(numsCard: any[][], numsHistory: number[], rule: string[]) {
    const newCard = numsCard[0].map((_, colIndex) => 
      numsCard.map(row => row[colIndex])
    );

    const calledNumsSet = new Set(numsHistory);

    for (const position of rule) {
      const [row, col] = position.split(':').map(Number);
      const cellNumber = newCard[row][col].num;
      
      if (!calledNumsSet.has(cellNumber)) {
        return false;
      }
    }

    return true;
  }
}
