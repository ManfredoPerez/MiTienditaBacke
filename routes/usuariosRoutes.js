const express = require("express");
const router = express.Router();
const { agregarUsuario, eliminarUsuario, actualizarUsuario, obtenerUsuarios, actualizarRolUsuario } = require("../controllers/usuariosController");
const authMiddleware = require("../middleware/authMiddleware");

// Rutas CRUD de Usuarios
router.post("/", agregarUsuario);
router.put("/:id", authMiddleware, actualizarUsuario);
router.put("/:id/rol", authMiddleware, actualizarRolUsuario);
router.get("/", authMiddleware, obtenerUsuarios);
router.delete("/:id", authMiddleware, eliminarUsuario);

module.exports = router;
