import cron from "node-cron";
import Cita from "../models/citasModel.js";
import { Op } from "sequelize";

/**
 * Clase CitasCron
 * ------------------------------
 * Esta clase se encarga de las tareas automáticas relacionadas con las citas odontológicas.
 * Actualmente implementa la lógica para:
 *   - Revisar diariamente todas las citas pendientes cuya fecha ya expiró.
 *   - Actualizar su estado a "ausente" si el paciente no asistió ni canceló.
 *
 * Con esto se evita que queden citas pendientes “fantasma” en la base de datos y
 * se generan estadísticas más realistas (ej. porcentaje de ausencias).
 */
class CitasCron {
  /**
   * Inicia la tarea programada.
   * Se ejecuta automáticamente todos los días a las 23:59.
   */
  iniciar() {
    cron.schedule("59 23 * * *", async () => {
      try {
        const ahora = new Date();

        // Buscar citas que están pendientes pero cuya fecha ya pasó
        const citasPendientes = await Cita.findAll({
          where: {
            estado: "pendiente",
            fecha: { [Op.lt]: ahora }
          }
        });

        // Actualizar cada cita encontrada a estado "ausente"
        for (let cita of citasPendientes) {
          cita.estado = "ausente";
          await cita.save();
        }

        console.log(` ${citasPendientes.length} citas marcadas como AUSENTE automáticamente`);
      } catch (error) {
        console.error(" Error en la tarea automática de citas:", error.message);
      }
    });

    console.log(" Cron automatizado de citas iniciado (ejecuta todos los días a las 23:59)");
  }
}

// Exportamos una instancia lista para usarse
export default new CitasCron();
