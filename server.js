const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Sirve el archivo index.html automáticamente

// Conexión a MongoDB Atlas mediante variable de entorno
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/velvet_db?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Conectado exitosamente a MongoDB Atlas');
        await inicializarDatosSemilla();
    })
    .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Definición del Esquema y Modelo de Productos
const productoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true, default: 1 },
    precio: { type: Number, required: true, default: 0 }
});

const Producto = mongoose.model('Producto', productoSchema);

// Datos iniciales (tus prendas actuales) para poblar la BD si está vacía
const prendasIniciales = [
    { "id": 1793975190367, "nombre": "[VP-674196] Suéter Tejido Vino tinto Cerezita 🍒 | F: 6/11/2026", "cantidad": 1, "precio": 20 },
    { "id": 1793975239648, "nombre": "[VP-975999] Suéter Tejido de lazos Rojos ❤️ | F: 6/11/2026", "cantidad": 1, "precio": 14 },
    { "id": 1793975326780, "nombre": "[VP20659968] Suéter Tejido de lazos azul 💙 Manga Corta | F: 6/11/2026", "cantidad": 1, "precio": 10 },
    { "id": 1793975909930, "nombre": "[20260620F2556] Blusa Forever CH Manga corta con Botones | F: 6/11/2026", "cantidad": 2, "precio": 13 },
    { "id": 1793975991730, "nombre": "[6904489601557] Blusa Manga Corta Niu Niu Studio | F: 6/11/2026", "cantidad": 2, "precio": 10 },
    { "id": 1793976079133, "nombre": "[2118332322665] Blusa Manga Corta Violette | F: 6/11/2026", "cantidad": 1, "precio": 13 },
    { "id": 1793976413822, "nombre": "[VP-787310] Blusa de rayas Manga Corta Marrón y Beige 🟤 | F: 6/11/2026", "cantidad": 1, "precio": 10 },
    { "id": 1793979503998, "nombre": "[070425042909] Set de Conjunto Meili | F: 6/11/2026", "cantidad": 1, "precio": 24 },
    { "id": 1793979636379, "nombre": "[6901232008588] Pantalón MTK | F: 6/11/2026", "cantidad": 1, "precio": 17 },
    { "id": 1793979924817, "nombre": "[VP-664037] Jean MTK Talla S | F: 6/11/2026", "cantidad": 1, "precio": 16 },
    { "id": 1793994594301, "nombre": "[B5664] Bolso Parchita | F: 06/11/2026, 03:49 p. m.", "cantidad": 3, "precio": 20 },
    { "id": 1793994836959, "nombre": "[VP10843508] Suéter Manga Larga Princess Beige con Rayas Negras | F: 06/11/2026, 03:53 p. m.", "cantidad": 1, "precio": 15 },
    { "id": 1793994911009, "nombre": "[VP-264539] Suéter Tejido BeigeCerezita 🍒 | F: 06/11/2026, 03:55 p. m.", "cantidad": 1, "precio": 20 },
    { "id": 1793994990436, "nombre": "[2603340200338] Suéter Negro de Botones dorados | F: 06/11/2026, 03:56 p. m.", "cantidad": 1, "precio": 20 }
];

async function inicializarDatosSemilla() {
    try {
        const total = await Producto.countDocuments();
        if (total === 0) {
            await Producto.insertMany(prendasIniciales);
            console.log('📦 Prendas iniciales cargadas en MongoDB Atlas.');
        }
    } catch (error) {
        console.error('Error al inicializar datos:', error);
    }
}

// Ruta GET: Obtener todo el inventario e historial de escaneos
app.get('/api/inventario', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer el inventario' });
    }
});

// Ruta POST: Agregar un nuevo producto o registro de escaneo
app.post('/api/inventario', async (req, res) => {
    try {
        const { nombre, cantidad, precio } = req.body;
        
        if (!nombre || cantidad === undefined || precio === undefined) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const nuevoProducto = new Producto({
            id: req.body.id || Date.now(),
            nombre,
            cantidad: parseInt(cantidad),
            precio: parseFloat(precio)
        });

        const guardado = await nuevoProducto.save();
        res.status(201).json(guardado);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el producto' });
    }
});

// Ruta PUT: Actualizar un producto (usada al descontar stock por facturación)
app.put('/api/inventario/:id', async (req, res) => {
    try {
        const idBuscado = Number(req.params.id);
        const { nombre, cantidad, precio } = req.body;

        const actualizado = await Producto.findOneAndUpdate(
            { id: idBuscado },
            { nombre, cantidad: parseInt(cantidad), precio: parseFloat(precio) },
            { new: true }
        );

        if (!actualizado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// Ruta DELETE: Eliminar un producto por ID
app.delete('/api/inventario/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const eliminado = await Producto.findOneAndDelete({ id: id });

        if (!eliminado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
