import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';

import { Observable } from 'rxjs';
import { KeycloakService, KeycloakEvent } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {
  private readonly _eventTriggeredImage: string = 'url(assets/mario-event.gif)';
  private readonly _eventImage: string = 'url(assets/mario.gif)';

  keycloakEvent: string;
  eventStatus: string;
  eventImg: SafeStyle;

  constructor(private _keycloakService: KeycloakService, private _sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.eventStatus = 'Waiting for events from keycloak-js';
    this.eventImg = this._sanitizer.bypassSecurityTrustStyle('url(assets/mario.gif)');

    this._keycloakService.keycloakEvents$.subscribe((keycloakEvent: KeycloakEvent) => {
      console.log('aqui!');
      this.eventImg = this._sanitizer.bypassSecurityTrustStyle(this._eventTriggeredImage);
      setTimeout(() => {
        this.eventImg = this._sanitizer.bypassSecurityTrustStyle(this._eventImage);
      }, 5000);
      this.eventImg = this._sanitizer.bypassSecurityTrustStyle('url(assets/mario-event.gif)');
      // Add event handler
    });
  }

  onLogin(): void {
    this._keycloakService.login();
  }
}
