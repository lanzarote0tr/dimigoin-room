import createError from "http-errors";

// Middleware to verify session
function verifySession(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return next(createError(401, "Unauthorized: Invalid session"));
  }
}

// Apply session after login/register
function applySession(req, userId) {
  req.session.userId = userId;
  req.session.save(function (err) {
    if (err) {
      throw createError(500, "Error saving session");
    }
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


export { verifySession, applySession, purgeSession };
