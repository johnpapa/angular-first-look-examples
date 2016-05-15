import { Pipe, PipeTransform } from '@angular/core';

import { Character } from '../../../app/shared';

@Pipe({ name: 'sortCharacters' })
export class SortCharactersPipe implements PipeTransform {
  transform(value: Character[], args: any[]) {
    if (!value || !value.sort) { return value; }

    return value.sort((a: Character, b: Character) => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });
  }
}