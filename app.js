const cors = require('cors');
const express = require('express');
const app = express();

// Permite solicitudes desde tu frontend (localhost:4200)
app.use(cors({
  origin: 'http://localhost:4200',  // O puedes usar '*' para permitir todas las fuentes
}));

// Otras configuraciones de tu API
app.post('/api/plantel', (req, res) => {
  // Lógica para manejar el registro del plantel
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
