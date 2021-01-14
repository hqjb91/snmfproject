import { Component, OnInit } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { AuthService } from 'src/app/services/auth.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  username: string;
  email: string;
  security: string;
  xp: number;
  lvl: number;
  xpToNextLvl: number;
  percentage: number;
  topPlayers: any;

  constructor(private gameService: GameService, private authService: AuthService) {
    const decodedJwt: any = jwt_decode(localStorage.getItem('jwt_token'));
    this.username = decodedJwt.data['user_id'];
    this.email = decodedJwt.data.email;
    this.security = decodedJwt.data.security;
    this.xp = this.gameService.currentPlayer.xp;
    this.lvl = Math.floor(this.calcLvlFromXp(this.xp));
    this.xpToNextLvl = Math.floor(this.calcXpFromLvl(this.lvl + 1));
    this.percentage = Math.floor((this.xp/this.xpToNextLvl)*100);
  }

  ngOnInit(): void {
    this.authService.getTopUsers().subscribe( resp => {
      this.topPlayers = resp['data'];
      console.log(resp);
    })
  }

  calcLvlFromXp(xp: number){
    return Math.floor(25 + Math.sqrt(625 + 100 * xp))/50;
  }

  calcXpFromLvl(lvl: number){
    return 25*lvl*lvl-25*lvl;
  }

}
