import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  constructor(private gameService:GameService) { }

  ngOnInit(): void {
    this.gameService.registerPlayer();
    this.gameService.createGame();
  }

  ngOnDestroy() {
    this.gameService.closeConnection();
  }

}
