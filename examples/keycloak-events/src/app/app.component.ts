import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

import { Observable } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {
  keycloakEvent: string;

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    this.keycloakService.keycloakEvents$.subscribe(keycloakEvent => {
      // Add event handler
    });
  }

  onLogin(): void {
    this.keycloakService.login();
  }
}
