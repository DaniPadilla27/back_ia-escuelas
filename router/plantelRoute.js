import express from 'express';
import { crearPlantel, getPlantel, actualizarPlantel, crearDiagnostico , actualizarDiagnostico ,actualizarDiagnostico2} from '../Controller/plantelesController.js';

const router = express.Router();

// Ruta POST para crear un nuevo plantel
router.post('/plantel', crearPlantel);

// Ruta GET para obtener un plantel por id
router.get('/plantel/:id', getPlantel);

// Ruta PUT para actualizar un plantel por id
router.put('/plantel/:id', actualizarPlantel);

router.post('/diagnostico1/:id', crearDiagnostico);

// Ruta PUT para actualizar (reemplazar) diagnósticos del plantel
router.put('/diagnostico1/:id', actualizarDiagnostico);

// Ruta PUT para actualizar (reemplazar) diagnósticos del plantel
router.put('/diagnostico2/:id', actualizarDiagnostico2);

export default router;
 //