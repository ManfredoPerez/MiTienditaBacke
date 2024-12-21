const { poolPromise } = require("../config/db");

exports.agregarProducto = async (req, res) => {
    try {
        const { codigo, nombre, descripcion, precio, stock, categoria_id, estado_id } = req.body;
        const imagen = req.file ? `/uploads/${req.file.filename}` : req.body.imagen;

        const pool = await poolPromise;
        await pool
            .request()
            .input("codigo", codigo)
            .input("nombre", nombre)
            .input("descripcion", descripcion)
            .input("precio", precio)
            .input("stock", stock)
            .input("categoria_id", categoria_id)
            .input("imagen", imagen)
            .input("estado_id", estado_id)
            .execute("InsertarProducto");

        res.status(201).json({ msg: "Producto agregado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria_id, estado_id } = req.body;
        const imagen = req.file ? `/uploads/${req.file.filename}` : req.body.imagen;
        const id = req.params.id;

        const pool = await poolPromise;
        await pool
            .request()
            .input("id", id)
            .input("nombre", nombre)
            .input("descripcion", descripcion)
            .input("precio", precio)
            .input("stock", stock)
            .input("categoria_id", categoria_id)
            .input("imagen", imagen)
            .input("estado_id", estado_id)
            .query(`
                UPDATE Productos
                SET nombre = @nombre, descripcion = @descripcion, precio = @precio,
                    stock = @stock, categoria_id = @categoria_id, imagen = @imagen,
                    estado_id = @estado_id
                WHERE id = @id
            `);

        res.json({ msg: "Producto actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// exports.obtenerProductos = async (req, res) => {
//     try {
//         const pool = await poolPromise;
//         const result = await pool.request().query(`
//             SELECT p.id, p.codigo, p.nombre, p.descripcion, p.precio, p.stock, c.nombre AS categoria, e.descripcion AS estado, p.imagen, p.fecha_creacion
//             FROM Productos p
//             JOIN Categorias c ON p.categoria_id = c.id
//             JOIN Estados e ON p.estado_id = e.id
//         `);
//         res.json(result.recordset);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

exports.obtenerProductos = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT p.id, p.codigo, p.nombre, p.descripcion, p.precio, p.stock, 
                   c.nombre AS categoria, e.descripcion AS estado, p.imagen, p.fecha_creacion
            FROM Productos p
            JOIN Categorias c ON p.categoria_id = c.id
            JOIN Estados e ON p.estado_id = e.id
        `);

        // Transformar rutas relativas en absolutas
        const productos = result.recordset.map(product => ({
            ...product,
            imagen: product.imagen.startsWith("/uploads/")
                ? `${req.protocol}://${req.get("host")}${product.imagen}`
                : product.imagen
        }));

        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.eliminarProducto = async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await poolPromise;
        await pool.request().input("id", id).query("DELETE FROM Productos WHERE id = @id");
        res.json({ msg: "Producto eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};