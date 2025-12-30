/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { Injectable, OnDestroy, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private eventListeners: Array<() => void> = [];
  private debounceTimeoutId: any = null;
  private readonly debounceTime = 300;

  /**
   * Computed signal to expose the last user activity as a read-only signal.
   */
  public readonly lastActivitySignal = computed(() => this.lastActivity());

  /**
   * Starts monitoring user activity events (`mousemove`, `touchstart`, `keydown`, `click`, `scroll`)
   * and updates the last activity timestamp using debouncing for performance optimization.
   */
  startMonitoring(): void {
    if (!this.isBrowser) {
      return;
    }

    const events: Array<keyof WindowEventMap> = ['mousemove', 'touchstart', 'keydown', 'click', 'scroll'];

    const handler = () => this.debouncedUpdate();

    events.forEach((event) => {
      window.addEventListener(event, handler, { passive: true });
      this.eventListeners.push(() => window.removeEventListener(event, handler));
    });
  }

  /**
   * Updates the last activity timestamp with debounce.
   */
  private debouncedUpdate(): void {
    if (this.debounceTimeoutId !== null) {
      clearTimeout(this.debounceTimeoutId);
    }
    this.debounceTimeoutId = setTimeout(() => {
      this.lastActivity.set(Date.now());
      this.debounceTimeoutId = null;
    }, this.debounceTime);
  }

  /**
   * Retrieves the timestamp of the last recorded user activity.
   * @returns {number} The last activity timestamp in milliseconds since epoch.
   */
  get lastActivityTime(): number {
    return this.lastActivity();
  }

  /**
   * Determines whether the user interacted with the application, meaning it is actively using the application, based on
   * the specified duration.
   * @param timeout - The inactivity timeout in milliseconds.
   * @returns {boolean} `true` if the user is inactive, otherwise `false`.
   */
  isActive(timeout: number): boolean {
    return Date.now() - this.lastActivityTime < timeout;
  }

  /**
   * Cleans up event listeners and debouncing timer on destroy.
   * This method is automatically called by Angular when the service is removed.
   */
  ngOnDestroy(): void {
    this.eventListeners.forEach((remove) => remove());
    this.eventListeners = [];
    if (this.debounceTimeoutId !== null) {
      clearTimeout(this.debounceTimeoutId);
      this.debounceTimeoutId = null;
    }
  }
}
