import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';

import { StoryComponent } from './story.component';

@NgModule({
  imports: [BrowserModule],
  declarations: [StoryComponent],
  bootstrap: [StoryComponent],
})
export class AppModule { }
