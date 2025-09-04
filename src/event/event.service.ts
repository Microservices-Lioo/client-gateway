import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, Observable } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { EventEntity } from './common/entities';

@Injectable()
export class EventService {
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy
    ) { }

    //* peticiones para ws
    verifyAParticipatingUserEvent(eventId: number, userId: number): Observable<boolean> {
        return this.client.send<boolean>('verifyAParticipatingUserEvent', { eventId, userId })
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    getEvent(eventId: number): Observable<EventEntity> {
        return this.client.send('findOneEventWS', eventId)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    //* peticiones para redis
    joinRoom(
        key: string, 
        data: { userId: number, socketId: string }
    ): Observable<boolean> {
        return this.client.send('joinRoom', { key, data})
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    countUsersRoom(key: string): Observable<number | null> {
        return this.client.send('countUsersRoom', key)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    deleteRoom(key: string): Observable<void> {
        return this.client.send('deleteRoom', key)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    deleteUserRoom(userId: number, socketId: string) {
        return this.client.send('deleteUserRoom', {userId, socketId})
            .pipe(catchError(error => { throw new RpcException(error) }));
    }
}
