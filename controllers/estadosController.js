const { poolPromise } = require("../config/db");

exports.agregarEstado = async (req, res) => {
    try {
        const { descripcion } = req.body;

        const pool = await poolPromise;
        await pool
            .request()
            .input("descripcion", descripcion)
            .query("INSERT INTO Estados (descripcion) VALUES (@descripcion)");

        res.status(201).json({ msg: "Estado agregado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarEstado = async (req, res) => {
    try {
        const { descripcion } = req.body;
        const id = req.params.id;

        const pool = await poolPromise;
        await pool
            .request()
            .input("id", id)
            .input("descripcion", descripcion)
            .query("UPDATE Estados SET descripcion = @descripcion WHERE id = @id");

        res.json({ msg: "Estado actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.eliminarEstado = async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await poolPromise;
        await pool.request().input("id", id).query("DELETE FROM Estados WHERE id = @id");
        res.json({ msg: "Estado eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.obtenerEstados = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Estados");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};