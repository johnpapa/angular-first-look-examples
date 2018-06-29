import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CharacterComponent } from './character.component';
import { CharactersComponent } from './characters.component';

@NgModule({
  imports: [BrowserModule, HttpClientModule],
  declarations: [AppComponent, CharacterComponent, CharactersComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
