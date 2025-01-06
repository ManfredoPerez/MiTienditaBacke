const express = require("express");
const router = express.Router();
const { agregarPedido, eliminarPedido, actualizarPedido, obtenerTodosPedidos, obtenerTopUsuario, obtenerPedidos, confirmarCarrito, historialPedidos, obtenerPedidosPendientes, actualizarEstadoPedido } = require("../controllers/pedidosController");
const authMiddleware = require("../middleware/authMiddleware");

// Rutas CRUD de Pedidos
router.post("/", authMiddleware, agregarPedido);
router.put("/:id", authMiddleware, actualizarPedido);
router.get("/", authMiddleware, obtenerPedidos);
router.get("/pedidos", authMiddleware, obtenerTodosPedidos);
router.delete("/:id", authMiddleware, eliminarPedido);
router.get("/top-usuario", authMiddleware, obtenerTopUsuario);
router.post("/confirmar", authMiddleware, confirmarCarrito);
router.get("/historial", authMiddleware, historialPedidos);
router.get("/pendientes", authMiddleware, obtenerPedidosPendientes);
router.put("/:id/estado", authMiddleware, actualizarEstadoPedido);

module.exports = router;
