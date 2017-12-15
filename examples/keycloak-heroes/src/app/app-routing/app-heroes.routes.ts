import { Routes } from '@angular/router';
import { HeroesComponent, PlayersComponent, TeamsComponent } from '../app-heroes';

const appHeroesRoutes: Routes = [
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

export { appHeroesRoutes };
