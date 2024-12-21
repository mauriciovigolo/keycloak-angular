import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-user-profile',
  templateUrl: 'user-profile.component.html',
  styleUrls: [`user-profile.component.css`]
})
export class UserProfileComponent implements OnInit {
  user: User | undefined;

  constructor(private readonly keycloak: Keycloak) {}

  async ngOnInit() {
    if (this.keycloak?.authenticated) {
      const profile = await this.keycloak.loadUserProfile();

      this.user = {
        name: `${profile?.firstName} ${profile.lastName}`,
        email: profile?.email,
        username: profile?.username
      };
    }
  }
}
