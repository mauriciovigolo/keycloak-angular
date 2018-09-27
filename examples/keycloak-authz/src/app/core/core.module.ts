import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventStackService } from './services/event-stack.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [EventStackService]
})
export class CoreModule {}
