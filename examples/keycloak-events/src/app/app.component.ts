import { Component, OnInit } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { KeycloakService, KeycloakEventType } from 'keycloak-angular';

import { EventStackService } from './core/services/event-stack.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {
  private readonly _usualEventMessage: string = 'Waiting for events from keycloak-js';

  keycloakEvent: string;
  eventStatus: string;
  eventImg: SafeStyle;

  constructor(
    private _keycloakService: KeycloakService,
    private _eventStackService: EventStackService
  ) {}

  private changeMarioReaction(eventHappened: boolean = false): SafeStyle {
    let marioReaction: SafeStyle = 'url(assets/mario.gif)';
    if (eventHappened) {
      marioReaction = 'url(assets/mario-event.gif)';
    }
    return marioReaction;
  }

  private notifyEvent(event: string, msg: string, level: 'info' | 'warn' | 'error') {
    this.keycloakEvent = event;
    this.eventImg = this.changeMarioReaction(true);

    setTimeout(() => {
      this.eventImg = this.changeMarioReaction(false);
    }, 5000);
  }

  private keycloakEventTriggered({ _id, event }): void {
    switch (event.type) {
      case KeycloakEventType.OnAuthError:
        this.notifyEvent('Auth Error', 'Msg', 'error');
        break;
      case KeycloakEventType.OnAuthLogout:
        this.notifyEvent('Auth Logout', 'Msg', 'warn');
        break;
      case KeycloakEventType.OnAuthRefreshError:
        this.notifyEvent('Auth Refresh Error', 'Msg', 'error');
        break;
      case KeycloakEventType.OnAuthRefreshSuccess:
        this.notifyEvent('Auth Refresh Success', 'Msg', 'info');
        break;
      case KeycloakEventType.OnAuthSuccess:
        this.notifyEvent('Auth Success', 'Msg', 'info');
        break;
      case KeycloakEventType.OnReady:
        this.notifyEvent('On Ready', 'Msg', 'info');
        break;
      case KeycloakEventType.OnTokenExpired:
        this.notifyEvent('Token Expired', 'Msg', 'warn');
        break;
      default:
        break;
    }

    this._eventStackService.markEventItemAsRead(_id);
  }

  ngOnInit(): void {
    this.eventStatus = this._usualEventMessage;
    this.eventImg = this.changeMarioReaction();

    this._eventStackService.eventTriggered$.subscribe(eventStack => {
      eventStack.forEach(eventItem => this.keycloakEventTriggered(eventItem));
    });

    this._eventStackService.eventStack.forEach(eventItem => this.keycloakEventTriggered(eventItem));
  }

  onLogin(): void {
    this._keycloakService.login();
  }
}
