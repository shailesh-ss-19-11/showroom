import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireOwner(req, res, next) {
  if (req.admin?.role !== "OWNER") {
    return res.status(403).json({ error: "Only owners can perform this action" });
  }
  next();
}

export function optionalAdmin(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      req.admin = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Ignore invalid/expired tokens on optional routes — treat as anonymous.
    }
  }
  next();
}
