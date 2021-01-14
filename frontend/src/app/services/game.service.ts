import { Injectable } from "@angular/core";
import { Game } from 'phaser';
import { Subject } from "rxjs";
import { BaseMessage, GetAllPlayersLocationsMessage, Player, PlayerMovedLocationMessage, PlayerShotMessage, updatePlayerXPMessage } from "../models/messages";
import { BootScene } from "../scenes/boot.scene";
import { MainScene } from "../scenes/main.scene";
import jwt_decode from 'jwt-decode';

@Injectable({providedIn:'root'})
export class GameService {

	game: Game;
	socket: WebSocket;
	event: Subject<BaseMessage> = new Subject<BaseMessage>();
	username: string;
	currentPlayer: Player;

    createGame() {
		const config = {
			width: 480,
			height: 320,
			zoom: 2,
			scale: {
                mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT ,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
			pixelArt: true,
			parent: 'game',
			type: Phaser.AUTO,
			physics: {
				default: 'arcade',
				arcade: {
					gravity: { y: 0 }
				}
			},
			scene: [ BootScene, MainScene ]
		}

		this.game = new Game(config);
	}
	
	registerPlayer() {

		const decodedJwt: any = jwt_decode(localStorage.getItem('jwt_token'));
		this.username = decodedJwt.data['user_id'];
		
		const jwt = localStorage.getItem('jwt_token');
		this.socket = new WebSocket(`ws://${window.location.host}/play/${this.username}/${jwt}`);
		// this.socket = new WebSocket(`ws://localhost:3000/play/${this.username}/${jwt}`);

		this.socket.onmessage = (payload: MessageEvent) => {
			const msg = JSON.parse(payload.data) as BaseMessage;
			// console.log(msg);
			this.event.next(msg);
		}
		this.socket.onclose = () => {
			this.socket = null;
		}
	}

	// Send message to server to prompt to get all player locations
	getAllPlayersLocation() {
		const msg: GetAllPlayersLocationsMessage = {
			type: 'get-players-location',
			username: this.username
		}
		this.socket.send(JSON.stringify(msg));
	}

	// Send message 
	emitPlayerMoved(x, y) {
		const msg: PlayerMovedLocationMessage = {
			type: 'player-moved',
			player : {x, y, username: this.username, xp:null}
		}
		this.socket.send(JSON.stringify(msg));
	}

	// Emit player shot bullet
	emitPlayerShot(username, x, y, velX, velY) {
		const msg: PlayerShotMessage = {
			type: 'shoot-bullet',
			username,
			x, y, velX, velY
		}

		this.socket.send(JSON.stringify(msg));
	}

	updatePlayerXp(username: string, xpToAdd: number) {
		const msg: updatePlayerXPMessage = {
			type: 'player-add-xp',
			username, xpToAdd
		}
		this.socket.send(JSON.stringify(msg));
	}

	closeConnection(){
		if(this.socket)
			this.socket.close();
		this.game.destroy(true);
	}
}