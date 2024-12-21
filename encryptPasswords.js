const bcrypt = require("bcryptjs");
const { poolPromise } = require("./config/db");

const encryptPasswords = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT id, contrasena FROM Usuarios");

        for (const user of result.recordset) {
            const hashedPassword = await bcrypt.hash(user.contrasena, 10);
            await pool.request()
                .input("id", user.id)
                .input("contrasena", hashedPassword)
                .query("UPDATE Usuarios SET contrasena = @contrasena WHERE id = @id");
            
            console.log(`Contraseña del usuario con ID ${user.id} actualizada.`);
        }

        console.log("Todas las contraseñas han sido encriptadas.");
    } catch (err) {
        console.error("Error al encriptar contraseñas:", err.message);
    }
};

encryptPasswords();
