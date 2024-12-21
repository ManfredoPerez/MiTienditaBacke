const express = require("express");
const router = express.Router();
const { agregarCategoria, actualizarCategoria, eliminarCategoria, obtenerCategorias } = require("../controllers/categoriasController");
const authMiddleware = require("../middleware/authMiddleware");

// Rutas CRUD de Categorías
router.post("/", authMiddleware, agregarCategoria);
router.put("/:id", authMiddleware, actualizarCategoria);
router.get("/", authMiddleware, obtenerCategorias); 
router.delete("/:id", authMiddleware, eliminarCategoria);

module.exports = router;
