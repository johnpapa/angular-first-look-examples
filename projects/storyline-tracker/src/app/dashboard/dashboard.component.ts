import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ToastService } from '../../app/core';
import { Character, CharacterService } from '../../app/models';

@Component({
  selector: 'story-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy, OnInit {
  private dbResetSubscription: Subscription;

  characters: Observable<Character[]>;
  title: string;

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService,
    private router: Router,
    private toastService: ToastService
  ) {}

  getCharacters() {
    this.characters = this.characterService.getCharacters().pipe(
      tap(() => this.toastService.activate('Got characters for the dashboard')),
      catchError(e => {
        this.toastService.activate(`${e}`);
        return of([]);
      })
    );
  }

  gotoDetail(character: Character) {
    let link = ['/characters', character.id];
    this.router.navigate(link);
  }

  ngOnDestroy() {
    this.dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    this.route.data.subscribe((data: { title: string }) => {
      this.title = data.title;
    });
    this.getCharacters();
    this.dbResetSubscription = this.characterService.onDbReset.subscribe(() =>
      this.getCharacters()
    );
  }

  trackByCharacters(index: number, character: Character) {
    return character.id;
  }
}
