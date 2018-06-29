import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CharacterComponent } from './character.component';

@NgModule({
  declarations: [CharacterComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [CharacterComponent]
})
export class AppModule {}
