const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(express.json());

// Crear base de datos SQLite (archivo local)
const db = new sqlite3.Database("./productos.db", (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err.message);
  } else {
    console.log("Conectado a SQLite");
    db.run(
      `CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        descripcion TEXT,
        precio REAL,
        stock INTEGER
      )`
    );
  }
});

// Rutas

// Obtener todos los productos
app.get("/productos", (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener un producto por id
app.get("/productos/:id", (req, res) => {
  db.get("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(row);
  });
});

// Crear un producto
app.post("/productos", (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;
  db.run(
    "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
    [nombre, descripcion, precio, stock],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, nombre, descripcion, precio, stock });
    }
  );
});

// Actualizar un producto
app.put("/productos/:id", (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;
  db.run(
    "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?",
    [nombre, descripcion, precio, stock, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Producto no encontrado" });
      res.json({ id: req.params.id, nombre, descripcion, precio, stock });
    }
  );
});

// Eliminar un producto
app.delete("/productos/:id", (req, res) => {
  db.run("DELETE FROM productos WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
