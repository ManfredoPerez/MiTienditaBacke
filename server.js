const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productosRoutes = require("./routes/productosRoutes");
const categoriasRoutes = require("./routes/categoriasRoutes");
const estadosRoutes = require("./routes/estadosRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const pedidosRoutes = require("./routes/pedidosRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/pedidos", pedidosRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
