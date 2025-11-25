import createError from "http-errors";

// Middleware to verify session
function verifySession(req, res, next) {
  if (req.session && req.session.isVerified) {
    return next();
  } else {
    return next(createError(401, "Unauthorized: Invalid session"));
  }
}

// Apply session after login/register
function applySession(req, next, userId) {
  req.session.userId = userId;
  req.session.isVerified = true;
  req.session.save(function (err) {
    if (err) {
      throw createError(500, "Error saving session");
    }
    next();
  });
}

// Purge session on logout
function purgeSession(req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      return next(createError(500, "Error destroying session"));
    }
    res.clearCookie('x-session-token');
    next();
  });
}

// Helper: check if user is logged in
function isLoggedIn(req) {
  return req.session && req.session.isVerified && req.session.userId;
}
// Refresh session expiration
function refreshSession(req, res, next) {
  if (!req.session) {
    return next(createError(401, "No session to refresh"));
  }
  req.session.touch(function (err) {
    if (err) {
      return next(createError(500, "Error refreshing session"));
    }
    next();
  });
}

export { verifySession, applySession, purgeSession, isLoggedIn, refreshSession };
