import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, Observable } from 'rxjs';
import { EVENT_SERVICE } from 'src/config';
import { EventEntity } from './common';

@Injectable()
export class EventService {
    constructor(
        @Inject(EVENT_SERVICE) private readonly clientEvent: ClientProxy
    ) { }

    //* peticiones para ws
    verifyAParticipatingUserEvent(eventId: number, userId: number): Observable<boolean> {
        return this.clientEvent.send<boolean>('verifyAParticipatingUserEvent', { eventId, userId })
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    getEvent(eventId: number): Observable<EventEntity> {
        return this.clientEvent.send('findOneEventWS', eventId)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    //* peticiones para redis
    joinRoom(
        key: string, 
        data: { userId: number, socketId: string }
    ) {
        return this.clientEvent.send('joinRoom', { key, data})
            .pipe(catchError(error => { throw new RpcException(error) })).subscribe();
    }

    countUsersRoom(key: string): Observable<number> {
        return this.clientEvent.send('countUsersRoom', key)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    moveToRoom(keyOrigin: string, keyDestination: string): Observable<true> {
        return this.clientEvent
            .send('moveToRoom', { keyOrigin: keyOrigin, keyDestination: keyDestination })
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    deleteRoom(key: string): Observable<void> {
        return this.clientEvent.send('deleteRoom', key)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    deleteUserRoom(userId: number, socketId: string) {
        return this.clientEvent.send('deleteUserRoom', {userId, socketId})
            .pipe(catchError(error => { throw new RpcException(error) }));
    }
}
