import { Injectable } from '@angular/core';

import { KeycloakEvent } from 'keycloak-angular';
import { Subject, Observable } from 'rxjs';

export type EventItem = { _id: number; event: KeycloakEvent; timestamp: number };

@Injectable({
  providedIn: 'root'
})
export class EventStackService {
  private _nextId: number;
  private _eventStack: EventItem[];
  private _eventTriggerSource = new Subject<EventItem[]>();

  public eventTriggered$: Observable<EventItem[]>;

  constructor() {
    this._nextId = 0;
    this._eventStack = [];
    this.eventTriggered$ = this._eventTriggerSource.asObservable();
  }

  public purgeEventItem(eventItemId: number): void {
    let idx = this._eventStack.findIndex(eventItem => eventItem._id === eventItemId);
    this._eventStack.splice(idx, 1);
  }

  public triggerEvent(event: KeycloakEvent) {
    this._nextId += 1;

    this._eventStack.push({
      event,
      _id: this._nextId,
      timestamp: Date.now()
    });

    this._eventTriggerSource.next(this._eventStack);
  }

  public get eventStack(): EventItem[] {
    return this._eventStack;
  }
}
