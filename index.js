const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json'); // Aquí se guardarán los datos para todos

// Permitir que Express lea datos en formato JSON y sirva tus páginas HTML
app.use(express.json());
app.use(express.static(__dirname));

// 1. Ruta para que la página Web lea los datos guardados
app.get('/api/data', (req, res) => {
    if (!fs.existsSync(DATA_FILE)) {
        return res.json({}); // Si no existe el archivo aún, devuelve un objeto vacío
    }
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'No se pudo leer el archivo' });
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.json({});
        }
    });
});

// 2. Ruta para que la página Web guarde los datos nuevos
app.post('/api/data', (req, res) => {
    const newData = req.body;
    // Guardamos los datos en el archivo data.json de forma persistente
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'No se pudo guardar el archivo' });
        res.json({ success: true, message: '¡Guardado para todos los dispositivos!' });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:3000/velvet.html`);
});