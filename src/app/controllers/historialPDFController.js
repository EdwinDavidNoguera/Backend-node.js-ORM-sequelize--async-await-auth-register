import PDFDocument from 'pdfkit';
import { Historial, Usuario, Paciente, Tratamiento } from '../models/indexModel.js';
import fs from 'fs';
import path from 'path';

class HistorialPDFController {
  async descargarHistorial(req, res) {
    try {
      const usuario = req.usuario;
      let pacienteId;

      if (usuario.rol === 'paciente') {
        pacienteId = usuario.id;
      } else {
        pacienteId = parseInt(req.params.pacienteId, 10);
        if (!pacienteId || isNaN(pacienteId)) {
          return res.status(400).json({ error: 'Debes proporcionar un id de paciente válido en la URL.' });
        }
      }

      const paciente = await Paciente.findByPk(pacienteId, {
        attributes: ['fecha_nacimiento', 'celular'],
        include: {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'email']
        }
      });

      if (!paciente) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
      }

      const historiales = await Historial.findAll({
        where: { pacienteId },
        include: [
          {
            model: Tratamiento,
            as: 'tratamientos'
          }
        ],
        order: [['fecha', 'ASC']]
      });

      if (!historiales || historiales.length === 0) {
        return res.status(200).json({
          mensaje:
            'No existen historiales odontológicos que descargar para: ' +
            paciente.usuario.nombre +
            ' ' +
            paciente.usuario.apellido
        });
      }

      // === CREACIÓN DEL PDF ===
      const doc = new PDFDocument({ margin: 40 });
      res.setHeader('Content-Disposition', `attachment; filename=historial_${pacienteId}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      // --- ENCABEZADO ---
      const logoPath = path.join(process.cwd(), 'src', 'app', 'assets', 'logo.png');

      doc.fontSize(20).text('Historial Odontológico', 40, 40, { align: 'center' });
      doc.fontSize(12);
      doc.text(`Nombre: ${paciente.usuario.nombre} ${paciente.usuario.apellido}`, 40, 70);
      doc.text(`Email: ${paciente.usuario.email}`, 40, 85);
      doc.text(`Teléfono: ${paciente.celular || 'N/A'}`, 40, 100);
      doc.text(`Fecha de nacimiento: ${paciente.fecha_nacimiento || 'N/A'}`, 40, 115);

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 180, 80, { width: 100, height: 60 });
      }

      doc.moveDown(2);

      // --- TABLA DE CONSULTAS ---
      doc.fontSize(14).text('Registros:', { underline: true });
      doc.moveDown(0.5);

      const columns = [
        { label: 'Fecha', width: 80 },
        { label: 'Motivo', width: 120 },
        { label: 'Diagnóstico', width: 120 },
        { label: 'Observaciones', width: 160 }
      ];
      const startX = 40;
      let y = doc.y;

      const drawTableHeader = () => {
        let x = startX;
        doc.font('Helvetica-Bold');
        columns.forEach(col => {
          doc.rect(x, y, col.width, 20).stroke();
          doc.text(col.label, x + 4, y + 4, { width: col.width - 8, align: 'left' });
          x += col.width;
        });
        doc.font('Helvetica');
        y += 20;
      };

      drawTableHeader();

      for (const h of historiales) {
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = doc.y;
          drawTableHeader();
        }

        let x = startX;
        [h.fecha || 'N/A', h.motivoConsulta || 'N/A', h.diagnostico || 'N/A', h.observaciones || 'N/A'].forEach(
          (value, idx) => {
            doc.rect(x, y, columns[idx].width, 20).stroke();
            doc.text(value, x + 4, y + 4, { width: columns[idx].width - 8, align: 'left' });
            x += columns[idx].width;
          }
        );
        y += 20;

        // === TRATAMIENTO ASOCIADO ===
        if (h.tratamientos && h.tratamientos.length > 0) {
          const t = h.tratamientos[0];

          doc.font('Helvetica-Bold').text('Tratamiento:', startX, y);
          y += 16;

          doc.font('Helvetica').text(`Tipo: ${t.tipo_de_tratamiento || 'N/A'}`, startX, y);
          y += 14;
          doc.text(`Estado: ${t.estado || 'N/A'}`, startX, y);
          y += 14;
          doc.text(`Costo: ${t.costo || 'N/A'}`, startX, y);
          y += 14;
          doc.text(`Descripción: ${t.descripcion || 'Sin descripción'}`, startX, y);
          y += 20;
        } else {
          doc.font('Helvetica-Oblique').fillColor('gray').text('Sin tratamiento asociado', startX, y);
          y += 20;
          doc.fillColor('black');
        }
      }

      // --- FOOTER (fuera del bucle) ---
      const footerText = '© 2025 Dental Life Plus - Todos los derechos reservados';
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(10)
          .fillColor('gray')
          .text(footerText, 0, doc.page.height - 40, {
            align: 'center',
            width: doc.page.width
          })
          .fillColor('black');
      }

      doc.end();
    } catch (error) {
      // Si ya empezaste a escribir el PDF, no puedes responder JSON aquí.
      console.error('Error al generar PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default new HistorialPDFController();
