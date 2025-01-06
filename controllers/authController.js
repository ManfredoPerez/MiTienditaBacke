const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { poolPromise } = require("../config/db");
require("dotenv").config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);


//Login
exports.login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("correo", correo)
            .query("SELECT * FROM Usuarios WHERE correo = @correo");

        if (!result.recordset.length) {
            return res.status(400).json({ msg: "Usuario no encontrado" });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(contrasena, user.contrasena);

        if (!validPassword) {
            return res.status(400).json({ msg: "Contraseña incorrecta" });
        }

        const token = jwt.sign({ id: user.id, rol: user.rol_id }, process.env.SECRET_KEY, { expiresIn: "24h" });
        res.json({ token, rol: user.rol_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Recuperación de contraseña
exports.solicitarRecuperacion = async (req, res) => {
  try {
    const { correo } = req.body;
    const pool = await poolPromise;

    // Verificar si el correo existe
    const result = await pool.request().input("correo", correo).query(`
      SELECT * FROM Usuarios WHERE correo = @correo
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ msg: "Correo no encontrado" });
    }

    // Generar token y fecha de expiración
    const token = crypto.randomBytes(20).toString("hex");
    const expireDate = new Date(Date.now() + 3600000);

    await pool.request()
      .input("correo", correo)
      .input("token", token)
      .input("expireDate", expireDate)
      .query(`
        UPDATE Usuarios SET token_recuperacion = @token, token_expiracion = @expireDate WHERE correo = @correo
      `);

    const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;

    // Usar Resend para enviar el correo
    await resend.emails.send({
      from: process.env.EMAIL_FROM, 
      to: correo,
      subject: "Recuperación de Contraseña",
      text: `Para recuperar tu contraseña, haz clic en el siguiente enlace: ${resetUrl}`,
      html: `
        <p>Para recuperar tu contraseña, haz clic en el siguiente enlace:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este enlace expira en una hora.</p>
      `,
    });

    res.json({ msg: "Correo de recuperación enviado correctamente" });
  } catch (err) {
    console.error("Error al enviar el correo de recuperación:", err.message);
    res.status(500).json({ error: "Error al enviar el correo de recuperación." });
  }
};


  // Restablecer contraseña
  exports.restablecerContrasena = async (req, res) => {
    try {
      const { token } = req.params;
      const { contrasena } = req.body;
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      const pool = await poolPromise;
  
      const result = await pool.request()
        .input("token", token)
        .query(`
          SELECT * FROM Usuarios WHERE token_recuperacion = @token AND token_expiracion > GETDATE()
        `);
  
      if (result.recordset.length === 0) {
        return res.status(400).json({ msg: "Token inválido o expirado" });
      }
  
      await pool.request()
        .input("token", token)
        .input("contrasena", hashedPassword)
        .query(`
          UPDATE Usuarios SET contrasena = @contrasena, token_recuperacion = NULL, token_expiracion = NULL WHERE token_recuperacion = @token
        `);
  
      res.json({ msg: "Contraseña restablecida correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  