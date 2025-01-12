import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { getRepository } from "typeorm";

dotenv.config({ path: "./server" });

// login
passport.serializeUser(function (user: any, done: any) {
    done(null, user);
});

passport.deserializeUser(async function (user: any, done: any) {
    const userRepository = getRepository(User);
    const infoUser = await userRepository.findOne({
        where: { google: user.email }
    });
    if (infoUser) {
        const { password, ...infoUserWithoutPassword } = infoUser;
        done(null, infoUserWithoutPassword)
    }
});

// login

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "clientId",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "clientSecret",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback"
},
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
        let user = new User();
        user.id = profile.id;
        // user.email = profile.emails[0].value;
        user.fullname = profile.displayName;

        try {
            // Check if the user exists in the database, if not, add them
            const userRepository = getRepository(User);
            let userDb: User | null = await userRepository.findOne({
                where: { google: profile.emails[0].value }
            });

            if (!userDb) {
                // user does not exist yet => add account to user db
                user.google = profile.emails[0].value;
                // await userRepository.save(user);

                return done(null, user);
            }
            const { password, ...others } = userDb;

            

            return done(null, others);
        } catch (error: any) {
            return done(error);
        }
    }
));


export default passport;