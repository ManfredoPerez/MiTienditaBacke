const express = require("express");
const router = express.Router();
const { login, solicitarRecuperacion, restablecerContrasena } = require("../controllers/authController");

// Rutas
router.post("/login", login);
router.post("/recuperar", solicitarRecuperacion);
router.post("/reset-password/:token", restablecerContrasena);

module.exports = router;
