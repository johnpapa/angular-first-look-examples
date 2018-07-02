import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CharacterComponent } from './character.component';
import { CharacterSolvedComponent } from './solution/character-solved.component';

@NgModule({
  imports: [BrowserModule, FormsModule, HttpClientModule],
  declarations: [AppComponent, CharacterComponent, CharacterSolvedComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
