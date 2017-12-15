import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { routes } from './main.routes';

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule {}
