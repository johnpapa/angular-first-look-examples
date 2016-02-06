import { Component } from 'angular2/core';

class Character {
  constructor(public id: number, public name: string, public side: string, public imageUrl: string, public link: string) { }
}
class Vehicle {
  constructor(public id: number, public name: string) { }
}

@Component({
  selector: 'story-character-solved',
  templateUrl: './app/solution/character-solved.component.html',
  styleUrls: ['./app/solution/character-solved.component.css']
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

  getClasses() {
    let classes: string[] = ['bordered'];
    if (this.isSelected) {
      classes.push('selected');
    }
    return classes.join(' ');
  }

  select(name: string) {
    let msg = `You selected ${name}`;
    console.log(msg);
    this.isSelected = !this.isSelected;
  }

}
