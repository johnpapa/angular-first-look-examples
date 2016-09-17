import { Component } from '@angular/core';

class Character {
  constructor(public id: number, public name: string, public side: string, public imageUrl: string, public link: string) { }
}

class Vehicle {
  constructor(public id: number, public name: string) { }
}

@Component({
  moduleId: module.id,
  selector: 'story-character-solved',
  templateUrl: 'character-solved.component.html',
  styleUrls: ['character-solved.component.css']
})
export class CharacterSolvedComponent {
  character: Character;
  color = '';
  isSelected = false;
  selectLabel = 'Select a Character';
  vehicles = [
    new Vehicle(1, 'Slave 1'),
    new Vehicle(2, 'Imperial Star Destroyer'),
    new Vehicle(3, 'Escape Pod')
  ];

  constructor() {
    this.character = new Character(100, 'Boba Fett', 'dark', 'assets/man.png', 'http://angular.io');
  }

  select(name: string) {
    let msg = `You selected ${name}`;
    console.log(msg);
    this.isSelected = !this.isSelected;
  }
}
