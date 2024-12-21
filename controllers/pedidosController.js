const { poolPromise } = require("../config/db");

exports.agregarPedido = async (req, res) => {
    try {
        const { usuario_id, total, detalles } = req.body;

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("usuario_id", usuario_id)
            .input("total", total)
            .input("estado_id", 3) // Estado por defecto: Pendiente
            .query(
                `INSERT INTO Pedidos (usuario_id, fecha, estado_id, total)
                 OUTPUT INSERTED.id
                 VALUES (@usuario_id, GETDATE(), @estado_id, @total)`
            );

        const pedidoId = result.recordset[0].id;

        for (const detalle of detalles) {
            await pool
                .request()
                .input("pedido_id", pedidoId)
                .input("producto_id", detalle.producto_id)
                .input("cantidad", detalle.cantidad)
                .input("subtotal", detalle.subtotal)
                .query(
                    `INSERT INTO DetallesPedidos (pedido_id, producto_id, cantidad, subtotal)
                     VALUES (@pedido_id, @producto_id, @cantidad, @subtotal)`
                );
        }

        res.status(201).json({ msg: "Pedido agregado correctamente", pedidoId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarPedido = async (req, res) => {
    try {
        const { estado_id } = req.body;
        const id = req.params.id;

        const pool = await poolPromise;
        await pool
            .request()
            .input("id", id)
            .input("estado_id", estado_id)
            .query("UPDATE Pedidos SET estado_id = @estado_id WHERE id = @id");

        res.json({ msg: "Pedido actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.obtenerPedidos = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                p.id AS pedido_id,
                CONCAT(u.nombre, ' ', u.apellido) AS cliente,
                p.fecha,
                e.descripcion AS estado,
                p.total,
                dp.producto_id,
                pr.nombre AS producto,
                dp.cantidad,
                dp.subtotal
            FROM Pedidos p
            JOIN Usuarios u ON p.usuario_id = u.id
            JOIN Estados e ON p.estado_id = e.id
            JOIN DetallesPedidos dp ON p.id = dp.pedido_id
            JOIN Productos pr ON dp.producto_id = pr.id
            ORDER BY p.fecha DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.obtenerTopUsuario = async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT TOP 1 u.nombre, COUNT(p.id) AS total_pedidos
        FROM Pedidos p
        JOIN Usuarios u ON p.usuario_id = u.id
        GROUP BY u.nombre
        ORDER BY total_pedidos DESC
      `);
      res.json(result.recordset[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

exports.eliminarPedido = async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await poolPromise;
        await pool.request().input("id", id).query("DELETE FROM Pedidos WHERE id = @id");
        res.json({ msg: "Pedido eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Confirmar el carrito de compras
exports.confirmarCarrito = async (req, res) => {
    try {
        const { usuario_id, total, detalles } = req.body;
        const pool = await poolPromise;

        // Confirmar el carrito y obtener el ID del pedido
        const result = await pool.request()
            .input("usuario_id", usuario_id)
            .input("total", total)
            .input("estado_id", 3) // Estado: Pendiente
            .execute("ConfirmarCarrito");

        const pedidoId = result.recordset[0].pedido_id;

        // Insertar detalles del pedido
        for (const detalle of detalles) {
            await pool.request()
                .input("pedido_id", pedidoId)
                .input("producto_id", detalle.producto_id)
                .input("cantidad", detalle.cantidad)
                .input("subtotal", detalle.subtotal)
                .execute("InsertarDetallePedido");
        }

        res.status(201).json({ msg: "Carrito confirmado correctamente", pedidoId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener el historial de pedidos del cliente
exports.historialPedidos = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("usuario_id", usuario_id)
            .execute("ObtenerHistorialPedidos");

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener todos los pedidos pendientes para el operador
exports.obtenerPedidosPendientes = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .execute("ObtenerPedidosPendientes");

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar el estado del pedido (Aprobar o Rechazar)
exports.actualizarEstadoPedido = async (req, res) => {
    try {
        const { estado_id } = req.body;
        const pedido_id = req.params.id;
        const pool = await poolPromise;

        await pool.request()
            .input("pedido_id", pedido_id)
            .input("estado_id", estado_id)
            .execute("ActualizarEstadoPedido");

        res.json({ msg: "Estado del pedido actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};