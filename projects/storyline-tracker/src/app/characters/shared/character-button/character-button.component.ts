import { Component, Input, OnInit } from '@angular/core';
import { Character } from '../../../models';

@Component({
  selector: 'story-character-button',
  templateUrl: './character-button.component.html',
  styleUrls: ['./character-button.component.css']
})
export class CharacterButtonComponent implements OnInit {
  @Input() character: Character;

  constructor() {}

  ngOnInit() {}
}
