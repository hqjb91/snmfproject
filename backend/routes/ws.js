const express = require('express');
const expressWS = require('express-ws');
const router = express.Router();
const jwt = require('jsonwebtoken');

module.exports = (app, pool) => {

    const { mkQuery } = require('../utils/db');
    const SQL_GET_USER_INFO = 'select user_id, email, security from users where user_id like ?';
    const SQL_GET_CHAR_INFO = 'select user_id, user_xp, posX, posY from char_info where user_id like ?';
    const SQL_SAVE_CHAR_INFO = 'update char_info set user_xp = ?, posX = ?, posY = ? where user_id like ?';
    const getUserInfo = mkQuery(SQL_GET_USER_INFO, pool);
    const getCharInfo = mkQuery(SQL_GET_CHAR_INFO, pool);
    const saveCharInfo = mkQuery(SQL_SAVE_CHAR_INFO, pool);

    const players = {};
    const bullets = [];
    const bulletXp = 2;
    let resp = {};

    const processMessage = (payload) => {

        try {
            const msg = JSON.parse(payload);

            switch(msg.type){
                case 'get-players-location':
                    // Send all the existing players object to the new player
                    resp = {
                        type: 'players-location',
                        players: Object.keys(players).map(username => {
                            return { player: {
                                        username: username,
                                        x: players[username].x,
                                        y: players[username].y,
                                        xp: players[username].xp
                                    }
                        }})
                    };
                    players[msg.username].ws.send(JSON.stringify(resp));
                break;
    
                case 'player-moved':
                    for (let pUsername of Object.keys(players)) {
                        const p = players[pUsername];
                        p.ws.send(JSON.stringify(msg));
                        if(msg.player.username == pUsername) {
                            const p = players[pUsername];
                            p.x = msg.player.x;
                            p.y = msg.player.y;
                        }
                    }
                break;
    
                case 'player-add-xp':
                    for (let pUsername of Object.keys(players)) {
                        if(msg.username == pUsername) {
                            players[pUsername].xp += msg.xpToAdd;
                        }
                    }
    
                break;
    
                case 'shoot-bullet':
                    if(msg.username == undefined)
                        return;
                    const newBullet = msg;
                    bullets.push(newBullet);
                break;
    
                default:
            }
        } catch (e) {
            console.error(e);
        }
    }

    const appWS = expressWS(app);
    router.ws('/play/:username/:token', async (ws, req) => {

        const { username, token } = req.params;

        try {

        // Protect websocket connection
        jwt.verify(token, process.env.TOKEN_SECRET);

        // Check if player already in the game
        if(typeof players[username] == "undefined") {

            const getUserInfoResponse = await getUserInfo([username]);
            const userInfoResults = getUserInfoResponse[0];
            const getCharInfoResponse = await getCharInfo([username]);
            const charInfoResults = getCharInfoResponse[0];
    
            const x = charInfoResults['posX'];
            const y = charInfoResults['posY'];
            const xp = charInfoResults['user_xp'];

            // Add new player to the players object stored in the server
            players[username] = {
                x, y, ws, username, xp
            }

            // Broadcast the player object to all the existing players
            resp = {
                type: 'player-joined',
                player: { username : players[username].username,
                    x : players[username].x,
                    y : players[username].y,
                    xp: players[username].xp }
            };
            
            msg = JSON.stringify(resp);
            for (let otherUsername of Object.keys(players)) {
                if(otherUsername != username) {
                    const p = players[otherUsername];
                    p.ws.send(msg);
                }
            }

            ws.on('message', processMessage);

            ws.on('close', async () => {

                resp = {
                    type: 'player-left',
                    player: {
                        username,
                        x: 0, y: 0, xp: 0
                    }
                };

                msg = JSON.stringify(resp);
                for (let otherUsername of Object.keys(players)) {
                    if(otherUsername != username) {
                        const p = players[otherUsername];
                        if(p.ws)
                            p.ws.send(msg);
                    }
                }

                console.info(`Player leaving : ${username}`);
                if(typeof players[username].ws != "undefined")
                    players[username].ws.close();
                console.log(`Update ${username} to location ${players[username].x},${players[username].y} and xp to ${players[username].xp}`);
                await saveCharInfo([players[username].xp, players[username].x, players[username].y, username]);
                delete players[username];
                // Object.keys(players).forEach( username => console.log(username + " is left."));
            });
        } else {
            console.log(`User ${username} is already logged in.`)
        }

        } catch(e) {
            return console.log({ message: e.message });
        }
    })

    serverGameLoop = () => {

        try {
            for(let i=0; i<bullets.length;i++){
                let bullet = bullets[i];
                bullet.x += bullet.velX;
                bullet.y += bullet.velY;

                for (let username of Object.keys(players)) {
                
                    if(bullet.username != username) {
                        const dx = players[username].x - bullet.x;
                        const dy = players[username].y - bullet.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if(dist < 10) {
                            resp = {
                                type: 'player-hit',
                                player: players[username]
                            };      
                            players[username].xp -= bulletXp;

                            msg = JSON.stringify(resp);
                    
                            for (let username of Object.keys(players)) {
                                const p = players[username];
                                p.ws.send(msg);  
                            }
                        }
                    } 
                }

                if(bullet.x < -10 || bullet.x > 500 || bullet.y < -10 || bullet.y > 500){
                    bullets.splice(i,1);
                    i--;
                }
            }

    
            resp = {
                type: 'bullets-update',
                bullets
            };
            
            msg = JSON.stringify(resp);
    
            for (let username of Object.keys(players)) {
                const p = players[username];
                p.ws.send(msg);  
            }
        } catch (e) {
            console.error(e);
        }
    }

    // setInterval(serverGameLoop, 16);
    setInterval(serverGameLoop, 48);

    return router;
}