const express = require("express");
const router = express.Router();
const multer = require("multer");
const { agregarProducto, eliminarProducto, obtenerProductoPorId, actualizarProducto, obtenerProductos } = require("../controllers/productosController");
const authMiddleware = require("../middleware/authMiddleware");

// Configuración de almacenamiento para imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Rutas CRUD de Productos
router.post("/", authMiddleware, upload.single("imagen"), agregarProducto);
router.put("/:id", authMiddleware, upload.single("imagen"), actualizarProducto);
router.get("/", authMiddleware, obtenerProductos);
router.get("/:id", authMiddleware, obtenerProductoPorId);
router.delete("/:id", authMiddleware, eliminarProducto);

module.exports = router;
