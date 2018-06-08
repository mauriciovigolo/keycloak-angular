import { Injectable, OnDestroy } from '@angular/core';

import { KeycloakEvent } from 'keycloak-angular';
import { Subject, Observable } from 'rxjs';

export type EventItem = { _id: number; event: KeycloakEvent; read: boolean; timestamp: number };

@Injectable({
  providedIn: 'root'
})
export class EventStackService implements OnDestroy {
  private _nextId: number;
  private _eventStack: EventItem[];
  private _execRef: any;
  private _eventTriggerSource = new Subject<EventItem[]>();

  public eventTriggered$: Observable<EventItem[]>;

  constructor() {
    this._nextId = 0;
    this._eventStack = [];
    this.eventTriggered$ = this._eventTriggerSource.asObservable();

    this._execRef = setInterval(this.purgeReadEventItens.bind(this), 5000);
  }

  public markEventItemAsRead(eventItemId: number): void {
    let eventItem = this._eventStack.find(eventItem => eventItem._id === eventItemId);

    if (eventItem) {
      eventItem.read = true;
    }
  }

  public triggerEvent(event: KeycloakEvent) {
    this._nextId += 1;

    this._eventStack.push({
      event,
      _id: this._nextId,
      read: false,
      timestamp: Date.now()
    });

    this._eventTriggerSource.next(this._eventStack);
  }

  public get eventStack(): EventItem[] {
    return this._eventStack;
  }

  private nonReadEventStack(): EventItem[] {
    return this._eventStack.filter(eventItem => !eventItem.read);
  }

  private purgeReadEventItens(): void {
    this._eventStack = this.nonReadEventStack();
  }

  ngOnDestroy(): void {
    if (this._execRef) {
      this._execRef.clearInterval();
    }
  }
}
