import passport from "passport";
import local from "passport-local";

import usersManager from "../dao/users.manager.mdb.js";
import { isValidPassword } from "../utils.js";

const localStrategy = local.Strategy;
const manager = new usersManager;

const initAuthStrategies = () =>{
    passport.use('pplogin', new localStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) =>{
            try{
                const foundUser = await manager.getOne({email: username});

                if(foundUser && isValidPassword(password, foundUser.password)) {
                    const {password, ...filteredFoundUser} = foundUser;
                    return done (null, filteredFoundUser);
                }else{
                    return done (null, false);

                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));
    passport.serializeUser((user, done) => {
        done(null, user);
    })
        
    passport.deserializeUser((user, done) => {
        done(null, user);
    })
}

export default initAuthStrategies;