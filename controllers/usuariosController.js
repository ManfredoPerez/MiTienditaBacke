const bcrypt = require("bcryptjs");
const { poolPromise } = require("../config/db");

exports.agregarUsuario = async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasena, telefono, rol_id, estado_id } = req.body;
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const pool = await poolPromise;

        await pool
            .request()
            .input("nombre", nombre)
            .input("apellido", apellido)
            .input("correo", correo)
            .input("contrasena", hashedPassword)
            .input("telefono", telefono)
            .input("rol_id", rol_id)
            .input("estado_id", estado_id)
            .execute("InsertarUsuario");

        res.status(201).json({ msg: "Usuario agregado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarUsuario = async (req, res) => {
    try {
        const { nombre, apellido, telefono, rol_id, estado_id } = req.body;
        const id = req.params.id;

        const pool = await poolPromise;
        await pool
            .request()
            .input("id", id)
            .input("nombre", nombre)
            .input("apellido", apellido)
            .input("telefono", telefono)
            .input("rol_id", rol_id)
            .input("estado_id", estado_id)
            .query(`
                UPDATE Usuarios
                SET nombre = @nombre, apellido = @apellido, telefono = @telefono, rol_id = @rol_id, estado_id = @estado_id
                WHERE id = @id
            `);

        res.json({ msg: "Usuario actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarRolUsuario = async (req, res) => {
    try {
      const { rol_id } = req.body;
      const id = req.params.id;
  
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", id)
        .input("rol_id", rol_id)
        .query("UPDATE Usuarios SET rol_id = @rol_id WHERE id = @id");
  
      res.json({ msg: "Rol del usuario actualizado correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

exports.obtenerUsuarios = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT u.id, u.nombre, u.apellido, u.correo, u.telefono, r.descripcion AS rol, e.descripcion AS estado, u.fecha_creacion
            FROM Usuarios u
            JOIN Roles r ON u.rol_id = r.id
            JOIN Estados e ON u.estado_id = e.id
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.eliminarUsuario = async (req, res) => {
    try {
        const id = req.params.id;
        const pool = await poolPromise;
        await pool.request().input("id", id).query("DELETE FROM Usuarios WHERE id = @id");
        res.json({ msg: "Usuario eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};