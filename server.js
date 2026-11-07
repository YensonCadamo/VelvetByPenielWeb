const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'inventario.json');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Sirve el archivo index.html automáticamente

// Cargar inventario desde archivo JSON local
function leerInventario() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
}

// Guardar inventario en archivo JSON local
function guardarInventario(datos) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(datos, null, 2));
}

// Ruta GET: Obtener todos los productos
app.get('/api/inventario', (req, res) => {
    try {
        const inventario = leerInventario();
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer el inventario' });
    }
});

// Ruta POST: Agregar un nuevo producto
app.post('/api/inventario', (req, res) => {
    try {
        const { nombre, cantidad, precio } = req.body;
        
        if (!nombre || cantidad === undefined || precio === undefined) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const inventario = leerInventario();
        const nuevoProducto = {
            id: Date.now(),
            nombre,
            cantidad: parseInt(cantidad),
            precio: parseFloat(precio)
        };

        inventario.push(nuevoProducto);
        guardarInventario(inventario);

        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el producto' });
    }
});

// Ruta DELETE: Eliminar un producto por ID
app.delete('/api/inventario/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let inventario = leerInventario();
        inventario = inventario.filter(item => item.id !== id);
        guardarInventario(inventario);

        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

// Iniciar servidor escuchando en la red local (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de inventario corriendo localmente.`);
    console.log(`Accede desde esta PC en: http://localhost:${PORT}`);
    console.log(`Accede desde otros dispositivos de la red local usando tu IP local (Ej: http://192.168.1.X:${PORT})`);
});