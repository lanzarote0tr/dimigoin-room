import createError from "http-errors";
import express from "express";
import path, { parse } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";
import csurf from 'csurf';
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import fs from 'fs';
import session from 'express-session';
import connectMySQL from 'express-mysql-session';

import pool from './utils/connectdb.js';
import passport from 'passport';
import './utils/passport.js';

// __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

var app = express();

// Security
app.use(helmet());

app.set('trust proxy', 2); // Trust first two proxies: Nginx and Cloudflare

const limiter = rateLimit({
  windowMs: 1 * 1000, // 1 second
  max: 30, // limit each IP to 30 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Session management
const MySQLStore = connectMySQL(session);

const sessionStore = new MySQLStore({
  expiration: 1000 * 60 * 60 * 24, // 1 day
  endConnectionOnClose: true,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'sid',
      expires: 'expires_at',
      data: 'data'
    }
  }
}, pool);

app.use(session({
  key: 'x-session-token',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
  // rolling: true // Uncomment to reset maxAge on every response
}));

const ipbanPath = path.join(__dirname, 'ipban.txt');
let BLOCKED_IPS = new Set();
try {
  if (fs.existsSync(ipbanPath)) {
    const content = fs.readFileSync(ipbanPath, 'utf8');
    BLOCKED_IPS = new Set(
      content
        .split('\n')
        .map(ip => ip.trim())
        .filter(ip => ip && !ip.startsWith('#'))
    );
  } else {
    console.warn(`ipban.txt not found at ${ipbanPath}, starting with empty block list.`);
  }
} catch (err) {
  console.error('Failed to load ipban.txt, starting with empty block list:', err);
  BLOCKED_IPS = new Set();
}

async function logger(req, res) {
  try {
    await pool.query("INSERT INTO requests (return_time, ip, method, url, user_agent, referrer, status_code, content_length) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [new Date(), req.ip, req.method, req.originalUrl, req.get('user-agent'), req.get('referer') || null, res.statusCode, res.get('content-length') || 0]);
  } catch (err) {
    console.log("Error logging request:", err);
  }
}

app.use(async function (req, res, next) {
  const ip = req.ip;
  if (BLOCKED_IPS.has(ip)) {
    console.log(`Blocked IP: ${ip}`);
    res.status(403);
    await logger(req, res);
    next(createError(403, "Your IP address has been blocked."));
    return;
  }
  res.on("finish", () => {
    logger(req, res);
  });
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use(csurf());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

import frontendRouter from "./routes/frontend.js";
import apiRouter from "./routes/api.js";
import authRouter from "./routes/auth.js"

app.get('/', function(req, res) {
  return res.redirect('/app');
});

app.use('/app', frontendRouter);
app.use("/api", apiRouter);
app.use('/auth', authRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  return next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  var parsed_error = {
    name: "",
    message: "",
    stack: "",
    status: err.status || 500,
  };
  if (err.status >= 500) {
    console.log("Error:", err);
  }
  if (req.app.get("env") === "development") {
    parsed_error.name = err.name || "Error";
    parsed_error.message = err.message || "An unexpected error occurred.";
    parsed_error.stack = err.stack || "";
  } else {
    if (parsed_error.status == 403) {
      parsed_error.name = "Forbidden";
      parsed_error.message = "You do not have permission to access this resource.";
    } else if (parsed_error.status < 500) {
      parsed_error.name = err.name || "Client Error";
      parsed_error.message = err.message || "An error occurred. Please try again later.";
    } else {
      parsed_error.name = "Internal Server Error";
      parsed_error.message = "Please contact the site administrator.";
    }
  }

  // render the error page
  res.status(parsed_error.status);
  res.json(parsed_error);
  return;
});

app.listen(3000);
