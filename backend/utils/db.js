const mkQuery = (sqlQuery, pool) => {
    return async (params) => {
        const conn = await pool.getConnection();

        try {
            const response = await conn.query(sqlQuery, params);
            return response[0];
        } catch (e) {
            console.error(e);
        } finally {
            conn.release();
        }
    }
}

const mkTransaction = (sqlQueries, pool) => {
    return async (params) => {
        const conn = await pool.getConnection();
        const results = [];

        try {
            await conn.beginTransaction();
            for(let i=0; i<sqlQueries.length; i++) {
                console.info(params[i]);
                let response = await conn.query(sqlQueries[i], params[i]);
                results.push(response);
            }
            await conn.commit();
            return results;
        } catch (e) {
            console.log(e);
            conn.rollback();
        } finally {
            conn.release();
        }
    }
}

const mkAuth = (passport) => {
    return (req, res, next) => {
        passport.authenticate('local',
            (err, user, info) => {
                if (err) {
                    return next(err);
                  }
                  if (! user) {
                    return res.status(401).send({ success : false, message : 'Authentication failed' });
                  }
                  req.user = user
                  next()
            }
        )(req, res, next);
    }
}

const verifyJWT = (jwt) => (req, res, next) => {
    const auth = req.get('Authorization');
    if (auth == null) {
        return res.status(403).json({ message: 'Cannot access' });
    }

    const terms = auth.split(" ");

    if(terms.length != 2 || terms[0] != 'Bearer') {
        return res.status(401).json({ message: 'Cannot access' });
    }

    const token = terms[1];
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.verified = verified;
        req.token = token;
        next();
    } catch(e) {
        return res.status(401).json({ message: e.message });
    }
}

module.exports = {mkQuery, mkAuth, mkTransaction, verifyJWT};