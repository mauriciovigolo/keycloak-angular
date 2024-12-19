/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';

import { UserActivityService } from './user-activity.service';

describe('UserActivityService', () => {
  let service: UserActivityService;
  let ngZone: NgZone;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserActivityService, { provide: PLATFORM_ID, useValue: 'browser' }]
    });
    service = TestBed.inject(UserActivityService);
    ngZone = TestBed.inject(NgZone);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  describe('startMonitoring', () => {
    it('should not monitor if not in a browser context', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [UserActivityService, { provide: PLATFORM_ID, useValue: 'server' }]
      });

      TestBed.runInInjectionContext(() => {
        const nonBrowserService = TestBed.inject(UserActivityService);
        spyOn(nonBrowserService, 'startMonitoring').and.callThrough();
        spyOn(window, 'addEventListener');

        nonBrowserService.startMonitoring();

        expect(nonBrowserService.startMonitoring).toHaveBeenCalled();
        expect(window.addEventListener).not.toHaveBeenCalled();
      });
    });

    it('should add event listeners in browser context', () => {
      const addEventListenerSpy = spyOn(window, 'addEventListener');

      TestBed.runInInjectionContext(() => {
        service.startMonitoring();

        const expectedEvents = ['mousemove', 'touchstart', 'keydown', 'click', 'scroll'];

        expectedEvents.forEach((event) => {
          expect(addEventListenerSpy).toHaveBeenCalledWith(event, jasmine.any(Function), undefined);
        });
      });
    });
  });

  describe('updateLastActivity', () => {
    it('should update the last activity timestamp to the current time', () => {
      const currentTime = Date.now();

      spyOn(ngZone, 'run').and.callFake((fn: Function) => fn());

      service['updateLastActivity']();

      expect(service.lastActivitySignal()).toBeGreaterThanOrEqual(currentTime);
    });
  });

  describe('lastActivityTime', () => {
    it('should return the timestamp of the last activity', () => {
      const currentTime = Date.now();
      service['lastActivity'].set(currentTime);

      expect(service.lastActivityTime).toBe(currentTime);
    });
  });

  describe('isActive', () => {
    it('should return true if the user is active within the timeout', () => {
      const currentTime = Date.now();
      service['lastActivity'].set(currentTime);

      const timeout = 5000;
      expect(service.isActive(timeout)).toBeTrue();
    });

    it('should return false if the user is inactive beyond the timeout', () => {
      const currentTime = Date.now() - 10000;
      service['lastActivity'].set(currentTime);

      const timeout = 5000;
      expect(service.isActive(timeout)).toBeFalse();
    });
  });

  describe('ngOnDestroy', () => {
    it('should clean up resources when destroyed', () => {
      const destroySpy = spyOn(service['destroy$'], 'next').and.callThrough();
      const completeSpy = spyOn(service['destroy$'], 'complete').and.callThrough();

      service.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
