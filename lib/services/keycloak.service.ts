import { KeycloakOptions } from '../interfaces/keycloak-options';
import * as Keycloak from 'keycloak-js';
import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';

@Injectable()
export class KeycloakAngular {

  private userProfile: Keycloak.KeycloakProfile;
  private keycloak: Keycloak.KeycloakInstance;

  init(options: KeycloakOptions) {

  }

  login() {
    this.keycloak.login();
  }

  logout() {
    this.keycloak.logout();
  }

  isUserInRole(role: string): boolean {
    return false;
  }

  isLoggedIn(): boolean {
    if (this.keycloak.authenticated) {
      this.login();
    }

    return true;
  }

  getUserProfile() {
    
  }

  getUserRoles() {

  }

  async getToken(): Promise<string|undefined> {
    try {
      await this.keycloak.updateToken(20);
    } catch (e) {
        this.login();
    }
    return Promise.resolve(this.keycloak.token);
  }

  addTokenToHeader(headers: Headers): Headers {
    if (!headers) {
      headers = new Headers();
    }
    headers.append('Authorization', 'Bearer ' + this.getToken());
    return headers;    
  }
}
