import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://room.trillion-won.com/api/auth/login-callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // This is where you would save the user to your database.
    // For this example, we just pass the profile data along.
    return done(null, profile);
  }
));

// Serialize user data into the session (store user ID)
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user data from the session (retrieve user from DB)
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;