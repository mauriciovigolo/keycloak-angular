import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AmiiboSearchComponent } from './components/amiibo-search/amiibo-search.component';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [AmiiboSearchComponent]
})
export class AmiiboModule {}
