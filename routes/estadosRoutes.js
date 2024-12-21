const express = require("express");
const router = express.Router();
const { agregarEstado, obtenerEstados, eliminarEstado, actualizarEstado } = require("../controllers/estadosController");
const authMiddleware = require("../middleware/authMiddleware");

// Rutas CRUD de Estados
router.post("/", authMiddleware, agregarEstado);
router.put("/:id", authMiddleware, actualizarEstado);
router.get("/", authMiddleware, obtenerEstados);
router.delete("/:id", authMiddleware, eliminarEstado);

module.exports = router;
