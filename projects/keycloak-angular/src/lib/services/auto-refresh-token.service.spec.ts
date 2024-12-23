/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';

import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from '../signals/keycloak-events-signal';
import { AutoRefreshTokenService } from './auto-refresh-token.service';
import { UserActivityService } from './user-activity.service';

describe('AutoRefreshTokenService', () => {
  let service: AutoRefreshTokenService;
  let mockKeycloak: jasmine.SpyObj<Keycloak>;
  let mockUserActivityService: jasmine.SpyObj<UserActivityService>;
  let mockKeycloakSignal: jasmine.Spy & (() => { type: KeycloakEventType });

  beforeEach(() => {
    mockKeycloak = jasmine.createSpyObj<Keycloak>('Keycloak', ['login', 'logout', 'updateToken']);

    mockUserActivityService = jasmine.createSpyObj<UserActivityService>('UserActivityService', [
      'startMonitoring',
      'isActive'
    ]);

    mockKeycloakSignal = jasmine
      .createSpy('keycloakSignal')
      .and.callFake(() => ({ type: KeycloakEventType.TokenExpired }));

    TestBed.configureTestingModule({
      providers: [
        AutoRefreshTokenService,
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: UserActivityService, useValue: mockUserActivityService },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: mockKeycloakSignal }
      ]
    });

    service = TestBed.inject(AutoRefreshTokenService);
  });

  describe('start', () => {
    it('should initialize the service with default options if no options are provided', () => {
      service.start();

      expect(mockUserActivityService.startMonitoring).toHaveBeenCalled();
      expect(service['options']).toEqual({
        sessionTimeout: 300000,
        onInactivityTimeout: 'logout'
      });
    });

    it('should merge provided options with defaults', () => {
      service.start({ sessionTimeout: 50000, onInactivityTimeout: 'login' });

      expect(mockUserActivityService.startMonitoring).toHaveBeenCalled();
      expect(service['options']).toEqual({
        sessionTimeout: 50000,
        onInactivityTimeout: 'login'
      });
    });
  });

  describe('processTokenExpiredEvent', () => {
    beforeEach(() => {
      service.start();
      service['initialized'] = true;
    });

    it('should logout if user is inactive and inactivity timeout is set to "logout"', async () => {
      service['options'].onInactivityTimeout = 'logout';
      mockKeycloak.authenticated = true;
      mockUserActivityService.isActive.and.returnValue(false);
      mockKeycloak.logout.and.returnValue(Promise.resolve());

      service['processTokenExpiredEvent']();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockKeycloak.logout).toHaveBeenCalled();
    });

    it('should login if user is inactive and inactivity timeout is set to "login"', async () => {
      service['options'].onInactivityTimeout = 'login';
      mockKeycloak.authenticated = true;
      mockUserActivityService.isActive.and.returnValue(false);
      mockKeycloak.login.and.returnValue(Promise.resolve());

      service['processTokenExpiredEvent']();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockKeycloak.login).toHaveBeenCalled();
    });

    it('should refresh the token if user is active', async () => {
      mockKeycloak.authenticated = true;
      mockUserActivityService.isActive.and.returnValue(true);
      mockKeycloak.updateToken.and.returnValue(Promise.resolve(true));

      service['processTokenExpiredEvent']();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockKeycloak.updateToken).toHaveBeenCalled();
    });

    it('should do nothing if inactivity timeout is set to "none"', async () => {
      service['options'].onInactivityTimeout = 'none';
      mockKeycloak.authenticated = true;
      mockUserActivityService.isActive.and.returnValue(false);

      service['processTokenExpiredEvent']();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockKeycloak.logout).not.toHaveBeenCalled();
      expect(mockKeycloak.login).not.toHaveBeenCalled();
    });
  });

  describe('effect for KeycloakSignal', () => {
    it('should call processTokenExpiredEvent when a TokenExpired event is received', async () => {
      const processTokenExpiredSpy = spyOn(
        service as unknown as { processTokenExpiredEvent: () => void },
        'processTokenExpiredEvent'
      );

      mockKeycloakSignal.and.callFake(() => ({
        type: KeycloakEventType.TokenExpired
      }));

      const keycloakEvent = mockKeycloakSignal();
      if (keycloakEvent.type === KeycloakEventType.TokenExpired) {
        service['processTokenExpiredEvent']();
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(processTokenExpiredSpy).toHaveBeenCalled();
    });
  });
});
