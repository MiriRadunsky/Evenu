// config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/token.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientJWT_SECRET: process.env.GOOGLE_CLIENT_JWT_SECRET,
    callbackURL: 'http://localhost:3000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 'social.googleId': profile.id });

        if (!user) {
            // אם לא קיים, ליצור משתמש חדש
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            user = await User.create({
                name: profile.displayName || '',
                email: profile.emails[0].value,
                password: hashedPassword,
                role: 'user',
                social: { googleId: profile.id }
            });
        }

        // מחזירים אובייקט עם JWT במקום session
        const token = generateToken(user);
        done(null, { user, token });
    } catch (err) {
        done(err, null);
    }
}));

export default passport;