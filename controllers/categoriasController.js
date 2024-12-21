const { poolPromise } = require("../config/db");

exports.agregarCategoria = async (req, res) => {
    try {
        const { nombre, estado_id } = req.body;

        const pool = await poolPromise;
        await pool
            .request()
            .input("nombre", nombre)
            .input("estado_id", estado_id)
            .query("INSERT INTO Categorias (nombre, estado_id) VALUES (@nombre, @estado_id)");

        res.status(201).json({ msg: "Categoría agregada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarCategoria = async (req, res) => {
    try {
        const { nombre, estado_id } = req.body;
        const id = req.params.id;

        const pool = await poolPromise;
        await pool
            .request()
            .input("id", id)
            .input("nombre", nombre)
            .input("estado_id", estado_id)
            .query("UPDATE Categorias SET nombre = @nombre, estado_id = @estado_id WHERE id = @id");

        res.json({ msg: "Categoría actualizada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.obtenerCategorias = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT c.id, c.nombre, e.descripcion AS estado
            FROM Categorias c
            JOIN Estados e ON c.estado_id = e.id
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.eliminarCategoria = async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await poolPromise;
        await pool.request().input("id", id).query("DELETE FROM Categorias WHERE id = @id");
        res.json({ msg: "Categoría eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};