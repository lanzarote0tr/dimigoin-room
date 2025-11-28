import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from '../utils/connectdb.js';
dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://room.trillion-won.com/auth/login-callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    if (!profile || !profile._json) {
      return next(createError(500, "No user info from Google"));
    }
    const userId = profile._json.sub
    const userPic = profile._json.picture;
    const displayName = profile._json.name;
    const [rst] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    if (rst.length === 0) {
      // New user, create session after inserting into DB
      await pool.query(
        "INSERT IGNORE INTO users (id, name, picture, role) VALUES (?, ?, ?, 'student')",
        [userId, displayName, userPic]
      );
    } else {
      // Existing user, update profile info
      await pool.query(
        "UPDATE users SET name = ?, picture = ? WHERE id = ?",
        [displayName, userPic, userId]
      );
    }
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