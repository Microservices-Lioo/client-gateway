import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, Observable } from 'rxjs';
import { EVENT_SERVICE } from 'src/config';

@Injectable()
export class EventService {
    constructor(
        @Inject(EVENT_SERVICE) private readonly clientEvent: ClientProxy
      ) {}

    verifyAParticipatingUserEvent(eventId: number, userId: number): Observable<boolean> {
        return this.clientEvent.send<boolean>('verifyAParticipatingUserEvent', { eventId, userId })
            .pipe(catchError(error => { throw new RpcException(error) }));
    }
}
