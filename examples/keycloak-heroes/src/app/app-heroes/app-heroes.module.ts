import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeroesComponent, PlayersComponent, TeamsComponent } from './components';
import { HeroesService } from './services';

@NgModule({
  imports: [CommonModule],
  declarations: [HeroesComponent, PlayersComponent, TeamsComponent],
  providers: [HeroesService]
})
export class AppHeroesModule {}
