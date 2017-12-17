import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Routes } from '@angular/router';
import { HeroesComponent, PlayersComponent, TeamsComponent, HomeComponent, LoginComponent } from './components';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'heroes',
    component: HeroesComponent
  },
  {
    path: 'players',
    component: PlayersComponent
  },
  {
    path: 'teams',
    component: TeamsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
