import connection from '../config/database.js'; // Importa la conexión a la base de datos

// Función para insertar un nuevo plantel
export const crearPlantel = async (req, res) => {
    const { 
        nombre, 
        clave_centro_trabajo, 
        nivel_educativo, 
        modalidad, 
        organizacion, 
        sostenimiento, 
        direccion, // Datos de la dirección
        grado,     // Datos del grado
        num_alumnos, 
        num_docentes 
    } = req.body;

    try {
        // Verificar si la dirección ya existe en la base de datos
        let direccion_id;
        const [direcciones] = await connection.promise().query(
            'SELECT * FROM direcciones WHERE calle = ? AND numero = ? AND colonia = ? AND localidad = ? AND municipio = ? AND estado = ? AND pais = ?', 
            [direccion.calle, direccion.numero, direccion.colonia, direccion.localidad, direccion.municipio, direccion.estado, direccion.pais]
        );

        if (direcciones.length > 0) {
            // Si la dirección ya existe, usamos el ID de esa dirección
            direccion_id = direcciones[0].id;
        } else {
            // Si la dirección no existe, la insertamos
            const [resultDireccion] = await connection.promise().query(
                'INSERT INTO direcciones (calle, numero, colonia, localidad, municipio, estado, pais) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                [direccion.calle, direccion.numero, direccion.colonia, direccion.localidad, direccion.municipio, direccion.estado, direccion.pais]
            );
            direccion_id = resultDireccion.insertId;
        }

        // Verificar si el grado ya existe en la base de datos
        let grado_id;
        const [grados] = await connection.promise().query(
            'SELECT * FROM grados WHERE nombre = ?', 
            [grado.nombre]
        );

        if (grados.length > 0) {
            // Si el grado ya existe, usamos el ID de ese grado
            grado_id = grados[0].id;
        } else {
            // Si el grado no existe, lo insertamos
            const [resultGrado] = await connection.promise().query(
                'INSERT INTO grados (nombre) VALUES (?)', 
                [grado.nombre]
            );
            grado_id = resultGrado.insertId;
        }

        // Insertar el plantel utilizando los ids de dirección y grado
        const query = `
            INSERT INTO planteles (
                nombre, 
                clave_centro_trabajo, 
                nivel_educativo, 
                modalidad, 
                organizacion, 
                sostenimiento, 
                direccion_id, 
                num_alumnos, 
                num_docentes, 
                grado_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [resultPlantel] = await connection.promise().query(query, [
            nombre, 
            clave_centro_trabajo, 
            nivel_educativo, 
            modalidad, 
            organizacion, 
            sostenimiento, 
            direccion_id, 
            num_alumnos, 
            num_docentes, 
            grado_id
        ]);

        const plantel_id = resultPlantel.insertId;

        // Actualizar las tablas de direcciones y grados para guardar el id del plantel
        await connection.promise().query(
            'UPDATE direcciones SET plantel_id = ? WHERE id = ?', 
            [plantel_id, direccion_id]
        );
        await connection.promise().query(
            'UPDATE grados SET plantel_id = ? WHERE id = ?', 
            [plantel_id, grado_id]
        );

        res.status(201).json({ message: 'Plantel creado exitosamente', id: plantel_id });

    } catch (err) {
        console.error('Error al procesar la solicitud:', err);
        res.status(500).json({ message: 'Hubo un problema al crear el plantel' });
    }
};

// Función para ver los datos del plantel por id 
export const getPlantel = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                p.id AS plantel_id,
                p.nombre,
                p.clave_centro_trabajo,
                p.nivel_educativo,
                p.modalidad,
                p.organizacion,
                p.sostenimiento,
                p.num_alumnos,
                p.num_docentes,
                d.calle,
                d.numero,
                d.colonia,
                d.localidad,
                d.municipio,
                d.estado,
                d.pais,
                g.nombre AS grado_nombre
            FROM planteles p
            INNER JOIN direcciones d ON p.direccion_id = d.id
            INNER JOIN grados g ON p.grado_id = g.id
            WHERE p.id = ?
        `;

        const [rows] = await connection.promise().query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Plantel no encontrado' });
        }

        const plantel = rows[0];

        // Estructura la respuesta con objetos anidados
        const respuesta = {
            nombre: plantel.nombre,
            clave_centro_trabajo: plantel.clave_centro_trabajo,
            nivel_educativo: plantel.nivel_educativo,
            modalidad: plantel.modalidad,
            organizacion: plantel.organizacion,
            sostenimiento: plantel.sostenimiento,
            num_alumnos: plantel.num_alumnos,
            num_docentes: plantel.num_docentes,
            direccion: {
                calle: plantel.calle,
                numero: plantel.numero,
                colonia: plantel.colonia,
                localidad: plantel.localidad,
                municipio: plantel.municipio,
                estado: plantel.estado,
                pais: plantel.pais
            },
            grado: {
                nombre: plantel.grado_nombre
            }
        };

        res.status(200).json(respuesta);

    } catch (err) {
        console.error('Error al obtener el plantel:', err);
        res.status(500).json({ message: 'Error al obtener el plantel' });
    }
};
// Función para actualizar un plantel por ID
export const actualizarPlantel = async (req, res) => {
    const { id } = req.params;
    const { 
        nombre, 
        clave_centro_trabajo, 
        nivel_educativo, 
        modalidad, 
        organizacion, 
        sostenimiento, 
        direccion, // Datos de la dirección
        grado,     // Datos del grado
        num_alumnos, 
        num_docentes 
    } = req.body;

    try {
        // Verificar si el plantel existe
        const [planteles] = await connection.promise().query('SELECT * FROM planteles WHERE id = ?', [id]);
        if (planteles.length === 0) {
            return res.status(404).json({ message: 'Plantel no encontrado' });
        }

        // Verificar si la dirección ya existe o actualizarla
        let direccion_id = planteles[0].direccion_id;
        const [direcciones] = await connection.promise().query(
            'SELECT * FROM direcciones WHERE calle = ? AND numero = ? AND colonia = ? AND localidad = ? AND municipio = ? AND estado = ? AND pais = ?',
            [direccion.calle, direccion.numero, direccion.colonia, direccion.localidad, direccion.municipio, direccion.estado, direccion.pais]
        );

        if (direcciones.length > 0) {
            direccion_id = direcciones[0].id;
        } else {
            await connection.promise().query(
                'UPDATE direcciones SET calle = ?, numero = ?, colonia = ?, localidad = ?, municipio = ?, estado = ?, pais = ? WHERE id = ?',
                [direccion.calle, direccion.numero, direccion.colonia, direccion.localidad, direccion.municipio, direccion.estado, direccion.pais, direccion_id]
            );
        }

        // Verificar si el grado ya existe o actualizarlo
        let grado_id = planteles[0].grado_id;
        const [grados] = await connection.promise().query('SELECT * FROM grados WHERE nombre = ?', [grado.nombre]);

        if (grados.length > 0) {
            grado_id = grados[0].id;
        } else {
            await connection.promise().query('UPDATE grados SET nombre = ? WHERE id = ?', [grado.nombre, grado_id]);
        }

        // Actualizar los datos del plantel
        await connection.promise().query(
            `UPDATE planteles SET 
                nombre = ?, 
                clave_centro_trabajo = ?, 
                nivel_educativo = ?, 
                modalidad = ?, 
                organizacion = ?, 
                sostenimiento = ?, 
                direccion_id = ?, 
                num_alumnos = ?, 
                num_docentes = ?, 
                grado_id = ?
            WHERE id = ?`,
            [
                nombre, 
                clave_centro_trabajo, 
                nivel_educativo, 
                modalidad, 
                organizacion, 
                sostenimiento, 
                direccion_id, 
                num_alumnos, 
                num_docentes, 
                grado_id,
                id
            ]
        );

        res.status(200).json({ message: 'Plantel actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar el plantel:', err);
        res.status(500).json({ message: 'Hubo un problema al actualizar el plantel' });
    }
};

// Función para insertar un nuevo diagnóstico
export const crearDiagnostico = async (req, res) => {
  const diagnosticos = req.body; // Espera un arreglo de objetos

  if (!Array.isArray(diagnosticos) || diagnosticos.length === 0) {
    return res.status(400).json({ message: 'El payload debe ser un arreglo con al menos un diagnóstico' });
  }

  try {
    // Opcional: Verificar que todos los diagnósticos correspondan al mismo plantel o validar cada uno individualmente.
    // Aquí se valida el primer elemento para comprobar la existencia del plantel.
    const plantelId = diagnosticos[0].plantel_id;
    const [plantel] = await connection.promise().query(
      'SELECT id FROM planteles WHERE id = ?', 
      [plantelId]
    );
    if (plantel.length === 0) {
      return res.status(404).json({ message: 'Plantel no encontrado' });
    }

    // Preparamos los valores para el bulk insert
    // Se espera que cada objeto contenga: plantel_id, categoria, indicador, calificacion y observaciones.
    const values = diagnosticos.map(d => [
      d.plantel_id,
      d.categoria,
      d.indicador,
      d.calificacion,
      d.observaciones
    ]);

    // Consulta de inserción en bloque
    const query = `
      INSERT INTO diagnostico_1 (plantel_id, categoria, indicador, calificacion, observaciones)
      VALUES ?
    `;

    const [result] = await connection.promise().query(query, [values]);

    res.status(201).json({
      message: 'Diagnósticos creados exitosamente',
      insertedCount: result.affectedRows
    });
  } catch (err) {
    console.error('Error al insertar los diagnósticos:', err);
    res.status(500).json({ message: 'Hubo un problema al crear los diagnósticos' });
  }
};


// Función para actualizar (reemplazar) los diagnósticos de un plantel
export const actualizarDiagnostico = async (req, res) => {
    const diagnosticos = req.body; // Se espera un arreglo de objetos con diagnósticos
  
    if (!Array.isArray(diagnosticos) || diagnosticos.length === 0) {
      return res.status(400).json({ message: 'El payload debe ser un arreglo con al menos un diagnóstico' });
    }
  
    // Se asume que todos los diagnósticos corresponden al mismo plantel (tomamos el id del primer registro)
    const plantelId = diagnosticos[0].plantel_id;
  
    try {
      // Verificar que el plantel existe
      const [plantel] = await connection.promise().query(
        'SELECT id FROM planteles WHERE id = ?',
        [plantelId]
      );
      if (plantel.length === 0) {
        return res.status(404).json({ message: 'Plantel no encontrado' });
      }
  
      // Opcional: Iniciar una transacción para asegurar atomicidad
      await connection.promise().query('START TRANSACTION');
  
      // Eliminar los diagnósticos existentes para ese plantel
      await connection.promise().query(
        'DELETE FROM diagnostico_1 WHERE plantel_id = ?',
        [plantelId]
      );
  
      // Preparar los nuevos valores para el bulk insert
      const values = diagnosticos.map(d => [
        d.plantel_id,
        d.categoria,
        d.indicador,
        d.calificacion,
        d.observaciones
      ]);
  
      // Inserción en bloque de los nuevos diagnósticos
      const query = `
        INSERT INTO diagnostico_1 (plantel_id, categoria, indicador, calificacion, observaciones)
        VALUES ?
      `;
      const [result] = await connection.promise().query(query, [values]);
  
      // Confirmar la transacción
      await connection.promise().query('COMMIT');
  
      res.status(200).json({
        message: 'Diagnósticos actualizados exitosamente',
        insertedCount: result.affectedRows
      });
    } catch (err) {
      // En caso de error, revertir la transacción
      await connection.promise().query('ROLLBACK');
      console.error('Error al actualizar los diagnósticos:', err);
      res.status(500).json({ message: 'Hubo un problema al actualizar los diagnósticos' });
    }
  };
  

  export const actualizarDiagnostico2 = async (req, res) => {
    const diagnosticos = req.body;
  
    if (!Array.isArray(diagnosticos) || diagnosticos.length === 0) {
      return res.status(400).json({ message: 'El payload debe ser un arreglo con al menos un diagnóstico' });
    }
  
    const plantelId = diagnosticos[0].plantel_id;
  
    try {
      // Verificar que el plantel existe
      const [plantel] = await connection.promise().query(
        'SELECT id FROM planteles WHERE id = ?',
        [plantelId]
      );
      if (plantel.length === 0) {
        return res.status(404).json({ message: 'Plantel no encontrado' });
      }
  
      // Iniciar transacción
      await connection.promise().query('START TRANSACTION');
  
      // Eliminar los diagnósticos existentes para ese plantel
      await connection.promise().query('DELETE FROM diagnostico_2 WHERE plantel_id = ?', [plantelId]);
  
      // Insertar los nuevos diagnósticos
      const values = diagnosticos.map(d => [
        d.plantel_id,
        d.categoria,
        d.indicador,
        d.calificacion,
        d.observaciones
      ]);
  
      const query = `
        INSERT INTO diagnostico_2 (plantel_id, categoria, indicador, calificacion, observaciones)
        VALUES ?
      `;
      const [result] = await connection.promise().query(query, [values]);
  
      await connection.promise().query('COMMIT');
  
      res.status(200).json({ message: 'Diagnósticos actualizados exitosamente', insertedCount: result.affectedRows });
    } catch (err) {
      await connection.promise().query('ROLLBACK');
      console.error('Error al actualizar los diagnósticos:', err);
      res.status(500).json({ message: 'Hubo un problema al actualizar los diagnósticos' });
    }
  };