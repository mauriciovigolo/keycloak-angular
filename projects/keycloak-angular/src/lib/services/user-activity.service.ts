/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { Injectable, OnDestroy, NgZone, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

/**
 * Service to monitor user activity in an Angular application.
 * Tracks user interactions (e.g., mouse movement, touch, key presses, clicks, and scrolls)
 * and updates the last activity timestamp. Consumers can check for user inactivity
 * based on a configurable timeout.
 *
 * The service is supposed to be used in the client context and for safety, it checks during the startup
 * if it is a browser context.
 */
@Injectable()
export class UserActivityService implements OnDestroy {
  /**
   * Signal to store the timestamp of the last user activity.
   * The timestamp is represented as the number of milliseconds since epoch.
   */
  private lastActivity = signal<number>(Date.now());

  /**
   * Subject to signal the destruction of the service.
   * Used to clean up RxJS subscriptions.
   */
  private destroy$ = new Subject<void>();

  /**
   * Computed signal to expose the last user activity as a read-only signal.
   */
  public readonly lastActivitySignal = computed(() => this.lastActivity());

  constructor(private ngZone: NgZone) {}

  /**
   * Starts monitoring user activity events (`mousemove`, `touchstart`, `keydown`, `click`, `scroll`)
   * and updates the last activity timestamp using RxJS with debounce.
   * The events are processed outside Angular zone for performance optimization.
   */
  startMonitoring(): void {
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    if (!isBrowser) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const events = ['mousemove', 'touchstart', 'keydown', 'click', 'scroll'];

      events.forEach((event) => {
        fromEvent(window, event)
          .pipe(debounceTime(300), takeUntil(this.destroy$))
          .subscribe(() => this.updateLastActivity());
      });
    });
  }

  /**
   * Updates the last activity timestamp to the current time.
   * This method runs inside Angular's zone to ensure reactivity with Angular signals.
   */
  private updateLastActivity(): void {
    this.ngZone.run(() => {
      this.lastActivity.set(Date.now());
    });
  }

  /**
   * Retrieves the timestamp of the last recorded user activity.
   * @returns {number} The last activity timestamp in milliseconds since epoch.
   */
  get lastActivityTime(): number {
    return this.lastActivity();
  }

  /**
   * Determines whether the user interacted with the application, meaning it is activily using the application, based on
   * the specified duration.
   * @param timeout - The inactivity timeout in milliseconds.
   * @returns {boolean} `true` if the user is inactive, otherwise `false`.
   */
  isActive(timeout: number): boolean {
    return Date.now() - this.lastActivityTime < timeout;
  }

  /**
   * Cleans up RxJS subscriptions and resources when the service is destroyed.
   * This method is automatically called by Angular when the service is removed.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
