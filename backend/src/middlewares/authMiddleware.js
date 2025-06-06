// authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Auth Middleware: Encabezado de Autorización Recibido:", authHeader);
  if (!authHeader) {
    console.log("Auth Middleware: No se proporcionó encabezado de Autorización.");
    return res.status(401).json({ message: "Acceso denegado: No se proporcionó token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log("Auth Middleware: Token Verificado. req.user:", req.user); // <-- ¡Este log es CRUCIAL!
    next();
  } catch (error) {
    console.error("Auth Middleware: Error de Verificación de Token:", error.name, error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expirado" });
    }
    res.status(400).json({ message: "Token inválido" }); // El 400 que estás viendo podría venir de aquí
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    console.log("Auth Middleware: Autorización Denegada (no admin). Rol:", req.user ? req.user.role : 'N/A');
    return res.status(403).json({ message: "Acceso restringido: Se requiere rol de administrador" });
  }
  console.log("Auth Middleware: Autorización Concedida (admin).");
  next();
};