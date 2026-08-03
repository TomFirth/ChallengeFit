import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/PrismaClient.js';
import dotenv from 'dotenv';

dotenv.config();

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'fallback_secret',
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: payload.id } });
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                email: profile.emails?.[0].value || '',
                username: profile.displayName,
              },
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/api/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { facebookId: profile.id },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                facebookId: profile.id,
                email: profile.emails?.[0].value || '',
                username: `${profile.name?.givenName} ${profile.name?.familyName}`,
              },
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

export default passport;
