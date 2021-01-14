const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const { verifyJWT } = require('../utils/db');

module.exports = (mongoClient) => {

    router.post('/post', verifyJWT(jwt), async (req, res) => {

        const payload = jwtDecode(req.token);
        const tokenUsername = payload.data['user_id'];

        const {username, post, title} = req.body;

        try {
            // Verify that user posting is correct
            if(username == tokenUsername) {
                const currDate = (new Date()).getTime();

                const mongoResp = await mongoClient.db('project').collection('posts')
                .insertOne({
                    username, title, post, timestamp: currDate
                });

                res.status(200).json({success: true});
            } else {
                res.status(401).json({success: false});
            }
        } catch(e) {
            res.status(500).json({success: false});
        }
    });

    router.get('/post', async (req, res) => {

        const {limit, offset} = req.query;

        try {
            const mongoResp = await mongoClient.db('project').collection('posts')
            .find()
            .limit(parseInt(limit)).skip(parseInt(offset))
            .sort({timestamp: -1})
            .toArray();
    
            const totalCountResp = await mongoClient.db('project').collection('posts')
            .count();
    
            res.status(200).json({success: true, data: mongoResp, count: totalCountResp});
        } catch(e) {
            res.status(500).json({success: false});
        }
    });


    return router;
}