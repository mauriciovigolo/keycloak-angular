import { NgModule } from '@angular/core';
import { KeycloakAngular } from './services';

@NgModule({
  providers: [ KeycloakAngular ]
})
export class KeycloakModule {}