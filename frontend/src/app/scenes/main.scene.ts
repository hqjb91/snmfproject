import { Scene } from 'phaser';
import { Subscription } from 'rxjs';
import { Globals } from '../models/globals';
import { AllPlayersLocationsMessage, BulletsUpdateMessage, PlayerHitMessage, PlayerJoinedMessage, PlayerLeftMessage, PlayerMovedLocationMessage } from '../models/messages';
import { GameService } from '../services/game.service';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';

export class MainScene extends Scene {

    gameService: GameService;
    game$: Subscription;
    map; player; otherPlayer; otherPlayers; label;
    cursors; obstacles; container;
    bombSpawns; coinSpawns;
    coinXp = 10; bombXp = -5;
    timedEvent;
    bulletsArray = [];
    joyStick; joystickCursorKeys;

    constructor() {
        super({
            key: "MainScene"
        });
        this.gameService = Globals.injector.get(GameService);
        this.game$ = this.gameService.event.subscribe(
          (msg) => {
            // Listen to incoming events from server
            switch (msg.type) {
                        // Add new player received from server who just joined
                        case 'player-joined':
                            console.log('Adding new player that joined: ')
                            const playerLoc = msg as PlayerJoinedMessage;
                            console.log(playerLoc.player);
                            this.addOtherPlayers(playerLoc.player);
                        break;
    
                        // Add all existing players received from server when we just joined
                        case 'players-location':
                            console.log('Adding all existing players into the map: ')
                            console.log(this.gameService.username);
                            const allPlayersLoc = msg as AllPlayersLocationsMessage;
                            for (let playerLoc of allPlayersLoc.players){
                              
                                if(playerLoc.player.username == this.gameService.username){
                                  console.log('Adding ownself: ');
                                  console.log(playerLoc.player);
                                  this.createPlayer(playerLoc.player);
                                  this.gameService.currentPlayer = playerLoc.player;
                                } else {
                                    console.log('Adding others: ');
                                    console.log(playerLoc.player);
                                    this.addOtherPlayers(playerLoc.player);
                                }
                            }
                        break;

                        case 'player-moved':
                            const otherPlayerLoc = msg as PlayerMovedLocationMessage;
                            // console.log(`Player ${otherPlayerLoc.player.username} moved to ${otherPlayerLoc.player.x},${otherPlayerLoc.player.y}`);
                            this.otherPlayers.getChildren().forEach( player => {
                              if(otherPlayerLoc.player.username == player.username){
                                player['moving'] = true;
                                player['movetime'] = (new Date()).getTime();
                                if(player.x < otherPlayerLoc.player.x) {
                                  player.anims.play('right', true);
                                } else if (player.x > otherPlayerLoc.player.x) {
                                  player.anims.play('left', true);
                                } else if (player.y < otherPlayerLoc.player.y) {
                                  player.anims.play('down', true);
                                } else if (player.y > otherPlayerLoc.player.y) {
                                  player.anims.play('up', true);
                                }

                                player.setPosition(otherPlayerLoc.player.x, otherPlayerLoc.player.y);
                              }
                            })
                        break;

                        case 'player-left':
                          const playerLeft = msg as PlayerLeftMessage;
                          console.log(`Removing player that left from the map: ${playerLeft.player.username}`);
                          this.otherPlayers.getChildren().forEach( (player) => {
                            if (playerLeft.player.username == player.username) {
                              player.destroy();
                            }
                          });

                        case 'bullets-update':
                          const serverBulletsArray = msg as BulletsUpdateMessage;
                          if(typeof serverBulletsArray.bullets != "undefined"){
                            for(let i=0; i<serverBulletsArray.bullets.length; i++){
                              if(typeof this.bulletsArray[i] == "undefined") {
                                this.bulletsArray[i] = this.add.sprite(serverBulletsArray.bullets[i].x, serverBulletsArray.bullets[i].y, 'bullet').setScale(0.4);
                              } else {
                                this.bulletsArray[i].x = serverBulletsArray.bullets[i].x;
                                this.bulletsArray[i].y = serverBulletsArray.bullets[i].y;
                              }
                            }
                            for(let i=serverBulletsArray.bullets.length; i<this.bulletsArray.length; i++) {
                              this.bulletsArray[i].destroy();
                              this.bulletsArray.splice(i,1);
                              i--;
                            }
                          }
                        default:

                        case 'player-hit':
                          const playerHit = msg as PlayerHitMessage;
                          
                          // Update label text with score
                          if(typeof this.label != "undefined" && typeof playerHit.player != "undefined" && playerHit.player.username == this.gameService.username) {
                            this.label.setText(`${playerHit.player.username}:${playerHit.player.xp}`);
                            this.gameService.currentPlayer.xp = playerHit.player.xp;
                          }
                        break;
                    }
            });
    }

    preload() {

    }

    create() {
        this.otherPlayers = this.physics.add.group();
        this.createMap();
        this.createAnimations();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createLoots();
        this.createBombs();
        this.gameService.getAllPlayersLocation();
        this.createJoyStick();
        this.joystickCursorKeys = this.joyStick.createCursorKeys();
        this.setPointerToShoot();
    }

    update() {
        if (this.container) {
            this.container.body.setVelocity(0);

            if (this.cursors.left.isDown || this.joystickCursorKeys.left.isDown) {
              this.container.body.setVelocityX(-80);
            } else if (this.cursors.right.isDown || this.joystickCursorKeys.right.isDown) {
              this.container.body.setVelocityX(80);
            }

            if (this.cursors.up.isDown || this.joystickCursorKeys.up.isDown) {
              this.container.body.setVelocityY(-80);
            } else if (this.cursors.down.isDown || this.joystickCursorKeys.down.isDown) {
              this.container.body.setVelocityY(80);
            }
         
            if (this.cursors.left.isDown || this.joystickCursorKeys.left.isDown) {
              this.player.anims.play('left', true);
            } else if (this.cursors.right.isDown || this.joystickCursorKeys.right.isDown) {
              this.player.anims.play('right', true);
            } else if (this.cursors.up.isDown || this.joystickCursorKeys.up.isDown) {
              this.player.anims.play('up', true);
            } else if (this.cursors.down.isDown || this.joystickCursorKeys.down.isDown) {
              this.player.anims.play('down', true);
            } else {
              this.player.anims.stop();
            }

            let x = this.container.x;
            let y = this.container.y;
            if(this.container.oldPosition && (x != this.container.oldPosition.x || y != this.container.oldPosition.y)){
              // console.log(`Player moved to ${x}, ${y}`);
              this.gameService.emitPlayerMoved(x, y);
            }
  
            this.container.oldPosition = {
              x: this.container.x,
              y: this.container.y
            }

            this.otherPlayers.getChildren().forEach( player => {
                let now: number;
                if(player.moving == true)
                  now = (new Date()).getTime();
                if(Math.abs(player.movetime - now) > 100 && player.moving == true){
                    player.moving = false;
                    player.anims.stop();
                }
            });
          }
    }

    createJoyStick() {
      this.joyStick = new VirtualJoystick(this, {
        x: 80,
        y: 250,
        radius: 30,
        base: this.add.circle(0, 0, 50, 0x888888),
        thumb: this.add.circle(0, 0, 30, 0xcccccc),
        dir: '8dir',
        enable: true
      });
    }

    createMap() {
        this.map = this.make.tilemap({ key: 'map' });

        const tiles = this.map.addTilesetImage('spritesheet', 'tiles');

        this.map.createLayer('Grass', tiles, 0, 0);
        this.obstacles = this.map.createLayer('Obstacles', tiles, 0, 0);
        this.obstacles.setCollisionByExclusion([-1]);

        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;
    }

    createPlayer(playerInfo) {
        this.player = this.add.sprite(0, 0, 'player', 1);
        this.label = this.add.text(-9, -23, `${playerInfo.username}:${playerInfo.xp}`, {
          fontFamily:'Calibri',
          color:'#ffffff',
          align:'center',
        }).setFontSize(12);

        this.container = this.add.container(playerInfo.x, playerInfo.y);
        this.container.setSize(16, 16);
        this.physics.world.enable(this.container);
        this.container.add(this.player);
        this.container.add(this.label);
        // this.physics.add.collider(this.container, this.obstacles);

        // When player obtains a coin perform actions
        this.physics.add.collider(this.container, this.coinSpawns, (player, spawn) => {
          console.log(`Add xp to ${playerInfo.username}`);
          this.gameService.updatePlayerXp(playerInfo.username, this.coinXp);
          playerInfo.xp += this.coinXp;

          this.label.setText(`${playerInfo.username}:${playerInfo.xp}`);

          spawn.destroy();
          const location = this.getValidLocation();
          let coins = this.coinSpawns.create(location.x, location.y, 'coin').setScale(0.5);
          coins.anims.play('coin', true);
          coins.body.setCollideWorldBounds(true);
          coins.body.setImmovable();
        });

        // When player collides with a bomb perform actions
        this.physics.add.collider(this.container, this.bombSpawns, (player, spawn) => {
          // console.log(`Remove xp to ${playerInfo.username}`);
          this.gameService.updatePlayerXp(playerInfo.username, this.bombXp);
          playerInfo.xp += this.bombXp;

          this.label.setText(`${playerInfo.username}:${playerInfo.xp}`);

          const explosion = this.add.sprite(spawn.body.x, spawn.body.y, 'explosion', 0);
          explosion.anims.play('explosion', false);
          explosion.once('animationcomplete', ()=>{
            explosion.destroy();
          });
          spawn.destroy();
          const location = this.getValidLocation();
          let bombs = this.bombSpawns.create(location.x, location.y, 'bomb').setScale(0.5);
          bombs.anims.play('bomb', true);
          bombs.body.setCollideWorldBounds(true);
          bombs.body.setImmovable();
        });

        this.updateCamera();

        this.container.body.setCollideWorldBounds(true);
    }

    createLoots() {
        this.coinSpawns = this.physics.add.group({
          classType: Phaser.GameObjects.Sprite
        });
        for (var i = 0; i < 20; i++) {
          const location = this.getValidLocation();
          
          let coins = this.coinSpawns.create(location.x, location.y, 'coin').setScale(0.5);
          coins.anims.play('coin', true);
          coins.body.setCollideWorldBounds(true);
          coins.body.setImmovable();
        }
    }

    createBombs() {
      this.bombSpawns = this.physics.add.group({
        classType: Phaser.GameObjects.Sprite
      });
      for (var i = 0; i < 20; i++) {
        const location = this.getValidLocation();
        
        let bombs = this.bombSpawns.create(location.x, location.y, 'bomb').setScale(0.5);
        bombs.anims.play('bomb', true);
        bombs.body.setCollideWorldBounds(true);
        bombs.body.setImmovable();
      }

      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.moveEnemies,
        callbackScope: this,
        loop: true
      });
    }

    setPointerToShoot() {
      this.input.on('pointerdown', (pointer) => {
        const localx = pointer.worldX;
        const localy = pointer.worldY;
        const dx = localx - this.container.body.x;
        const dy = localy - this.container.body.y;
        const angle = Math.atan2(dy,dx) - Math.PI/2;
        const velX = Math.cos(angle + Math.PI/2) * 20;
        const velY = Math.sin(angle + Math.PI/2) * 20;
        this.gameService.emitPlayerShot(this.gameService.username, this.container.body.x, this.container.body.y, velX, velY);
      });
    }

    moveEnemies () {
      this.bombSpawns.getChildren().forEach((enemy) => {
        const randNumber = Math.floor((Math.random() * 2) + 1);

        switch(randNumber) {
          case 1:
            enemy.body.bounce.y = 10;
            enemy.body.setVelocityX(50);
            break;
          case 2:
            enemy.body.bounce.y = 10;
            enemy.body.setVelocityX(-50);
            break;
          default:
        }
      });
     
      setTimeout(() => {
        this.bombSpawns.setVelocityX(0);
        this.bombSpawns.setVelocityY(0);
      }, 500);
    }
     
    getValidLocation() {
      let validLocation = false;
      let x, y;
      while (!validLocation) {
        x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
     
        let occupied = false;
        if(this.coinSpawns)
          this.coinSpawns.getChildren().forEach((child) => {
            if (child.getBounds().contains(x, y)) {
              occupied = true;
            }
          });
        if(this.bombSpawns)
          this.bombSpawns.getChildren().forEach((child) => {
            if (child.getBounds().contains(x, y)) {
              occupied = true;
            }
          });
        if (!occupied) validLocation = true;
      }
      return { x, y };
    }

    addOtherPlayers(playerInfo) {
        this.otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'player', 1);
        console.log(`Player added at ${playerInfo.x}, ${playerInfo.y}`)
        this.otherPlayer.setTint(Math.random() * 0xffffff);
        this.otherPlayer['username'] = playerInfo.username;
        this.otherPlayers.add(this.otherPlayer);

        // this.otherPlayer = this.add.sprite(0, 0, 'player', 1);
        // this.otherPlayer.setTint(Math.random() * 0xffffff);
        // let label = this.add.text(-9, -23, playerInfo.username, {
        //   fontFamily:'Calibri',
        //   color:'#ffffff',
        //   align:'center',
        // }).setFontSize(12);

        // this.container = this.add.container(playerInfo.x, playerInfo.y);
        // this.container.setSize(16, 16);
        // this.physics.world.enable(this.container);
        // this.container.add(this.otherPlayer);
        // this.container.add(label);
        // this.container['username'] = playerInfo.username;
        // this.otherPlayers.add(this.container);
    }

    updateCamera() {
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.container);
        this.cameras.main.roundPixels = true; 
    }

    createAnimations() {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', {
              frames: [7, 6, 8, 6]
            }),
            frameRate: 10,
            repeat: -1
          });
          this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', {
              frames: [13, 12, 14, 12]
            }),
            frameRate: 10,
            repeat: -1
          });        
          this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', {
              frames: [19, 18, 20, 18]
            }),
            frameRate: 10,
            repeat: -1
          });       
          this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', {
              frames: [1, 0, 2, 0]
            }),
            frameRate: 10,
            repeat: -1
          });
          this.anims.create({
            key: 'coin',
            frames: this.anims.generateFrameNumbers('coin', {
              frames: [0, 1, 2, 3, 4, 5, 6, 7]
            }),
            frameRate: 10,
            repeat: -1
          });
          this.anims.create({
            key: 'bomb',
            frames: this.anims.generateFrameNumbers('bomb', {
              frames: [5, 4, 3, 2, 1, 0]
            }),
            frameRate: 10,
            repeat: -1
          });
          this.anims.create({
            key: 'explosion',
            frames: this.anims.generateFrameNumbers('explosion', {
              frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            }),
            frameRate: 10,
            repeat: 0
          });
    }

}