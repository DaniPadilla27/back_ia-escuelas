// index.js
import express from 'express';
import cors from 'cors'; // Importa cors
import plantelRoutes from './router/plantelRoute.js'; // Importa las rutas de plantel

const app = express();
const PORT = process.env.PORT || 3000;
// Configura CORS para permitir solicitudes desde http://localhost:4200
app.use(cors({
    origin: 'http://localhost:4200',  // Puedes ajustar esto a tu necesidad
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  }));
  
app.use(express.json()); // Para poder recibir datos en formato JSON

// Usa las rutas de planteles
app.use('/api', plantelRoutes);

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
