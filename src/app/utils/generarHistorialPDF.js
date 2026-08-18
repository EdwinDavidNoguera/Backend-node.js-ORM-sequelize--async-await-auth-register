import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ============================================================
// CONFIGURACIÓN DE RUTAS
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const RUTA_LOGO = path.join(
  __dirname,
  ".../../../assets/logo.png"
);

// ============================================================
// COLORES
// ============================================================

const COLOR_PRIMARIO = "#1D5C6B";
const COLOR_TEXTO = "#2E2E2E";
const COLOR_TEXTO_SUAVE = "#6B6B6B";
const COLOR_LINEA = "#D8D8D8";

// Fondos claros para los bloques
const COLOR_FONDO_ENCABEZADO = "#F1F7F8";
const COLOR_FONDO_ATENCION = "#F6F9FA";

// ============================================================
// MESES
// ============================================================

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// ============================================================
// LIMPIAR TEXTO
// ============================================================

function limpiarTextoPDF(texto) {
  if (
    texto === null ||
    texto === undefined
  ) {
    return "";
  }

  return String(texto)
    .replace(/[\r\n\t]+/g, " ")
    .replace(
      /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
      ""
    )
    .trim();
}

// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatearFechaLarga(fechaStr) {
  if (!fechaStr) {
    return "No registrada";
  }

  const fechaTexto =
    String(fechaStr).substring(0, 10);

  const partes =
    fechaTexto.split("-");

  if (partes.length !== 3) {
    return limpiarTextoPDF(
      fechaStr
    );
  }

  const anio =
    Number(partes[0]);

  const mes =
    Number(partes[1]);

  const dia =
    Number(partes[2]);

  if (
    !anio ||
    !mes ||
    !dia ||
    !MESES[mes - 1]
  ) {
    return limpiarTextoPDF(
      fechaStr
    );
  }

  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}

// ============================================================
// FORMATEAR HORA
// ============================================================

function formatearHoraCorta(horaStr) {
  if (!horaStr) {
    return "No registrada";
  }

  return String(horaStr).slice(0, 5);
}

// ============================================================
// GENERAR PDF
// ============================================================

export default function generarHistorialPDF({
  paciente,
  atenciones,
}) {
  const doc = new PDFDocument({
    size: "A4",

    margins: {
      top: 50,
      bottom: 60,
      left: 55,
      right: 55,
    },

    bufferPages: true,
  });

  dibujarEncabezado(
    doc,
    paciente
  );

  dibujarDatosPaciente(
    doc,
    paciente
  );

  dibujarResumen(
    doc,
    atenciones
  );

  dibujarAtenciones(
    doc,
    atenciones
  );

  dibujarPiesDePagina(
    doc
  );

  return doc;
}

// ============================================================
// LÍNEA DIVISORIA
// ============================================================

function dibujarLineaDivisoria(doc) {
  doc.moveDown(0.4);

  doc
    .strokeColor(COLOR_LINEA)
    .lineWidth(1)
    .moveTo(
      doc.page.margins.left,
      doc.y
    )
    .lineTo(
      doc.page.width -
        doc.page.margins.right,
      doc.y
    )
    .stroke();

  doc.moveDown(0.6);
}

// ============================================================
// ASEGURAR ESPACIO
// ============================================================

function asegurarEspacio(
  doc,
  alturaEstimada
) {
  const espacioDisponible =
    doc.page.height -
    doc.page.margins.bottom -
    doc.y;

  if (
    espacioDisponible <
    alturaEstimada
  ) {
    doc.addPage();
  }
}

// ============================================================
// RECTÁNGULO DE FONDO
// ============================================================

function dibujarFondoRedondeado(
  doc,
  x,
  y,
  width,
  height,
  color
) {
  doc
    .save()
    .fillColor(color)
    .roundedRect(
      x,
      y,
      width,
      height,
      6
    )
    .fill()
    .restore();
}

// ============================================================
// ENCABEZADO
// ============================================================

function dibujarEncabezado(
  doc,
  paciente
) {
  const inicioX =
    doc.page.margins.left;

  const anchoUtil =
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right;

  const yInicio = doc.y;

  // ----------------------------------------------------------
  // LOGO
  // ----------------------------------------------------------

  const anchoLogo = 85;

  if (fs.existsSync(RUTA_LOGO)) {
    doc.image(
      RUTA_LOGO,
      inicioX +
        (anchoUtil - anchoLogo) / 2,
      yInicio,
      {
        width: anchoLogo,
      }
    );
  }

  // Reservamos espacio para evitar
  // que el resto del encabezado se monte sobre el logo.
  doc.y =
    yInicio + 75;

  // ----------------------------------------------------------
  // BLOQUE DE INFORMACIÓN INSTITUCIONAL
  // ----------------------------------------------------------

  const altoBloque = 70;

  const yBloque = doc.y;

  dibujarFondoRedondeado(
    doc,
    inicioX,
    yBloque,
    anchoUtil,
    altoBloque,
    COLOR_FONDO_ENCABEZADO
  );

  // Línea lateral decorativa
  doc
    .save()
    .fillColor(COLOR_PRIMARIO)
    .roundedRect(
      inicioX,
      yBloque,
      4,
      altoBloque,
      2
    )
    .fill()
    .restore();

  // ----------------------------------------------------------
  // CUIDAMOS TU SONRISA
  // ----------------------------------------------------------

  doc
    .fillColor(COLOR_PRIMARIO)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(
      "Cuidamos tu sonrisa",
      inicioX + 14,
      yBloque + 10,
      {
        width:
          anchoUtil - 28,
        align: "center",
      }
    );

  // ----------------------------------------------------------
  // NIT
  // ----------------------------------------------------------

  doc
    .fillColor(COLOR_TEXTO_SUAVE)
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "NIT 901.234.567-8",
      inicioX + 14,
      yBloque + 27,
      {
        width:
          anchoUtil - 28,
        align: "center",
      }
    );

  // ----------------------------------------------------------
  // FECHA GENERACIÓN
  // ----------------------------------------------------------

  const fechaGeneracion =
    new Date().toLocaleDateString(
      "es-CO",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

  doc
    .fillColor(COLOR_TEXTO_SUAVE)
    .font("Helvetica")
    .fontSize(8)
    .text(
      `Generado: ${fechaGeneracion}`,
      inicioX + 14,
      yBloque + 43,
      {
        width:
          anchoUtil - 28,
        align: "center",
      }
    );

  // ----------------------------------------------------------
  // POSICIÓN DESPUÉS DEL BLOQUE
  // ----------------------------------------------------------

  doc.y =
    yBloque +
    altoBloque +
    15;

  // ----------------------------------------------------------
  // TÍTULO
  // ----------------------------------------------------------

  const yTitulo = doc.y;

  doc
    .fillColor(COLOR_PRIMARIO)
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(
      "HISTORIAL CLÍNICO ODONTOLÓGICO",
      inicioX,
      yTitulo,
      {
        width: anchoUtil,
        align: "center",
      }
    );

  doc.moveDown(0.25);

  // ----------------------------------------------------------
  // ID PACIENTE
  // ----------------------------------------------------------

  const yId = doc.y;

  dibujarFondoRedondeado(
    doc,
    inicioX +
      anchoUtil / 2 -
      65,
    yId - 2,
    130,
    22,
    COLOR_FONDO_ENCABEZADO
  );

  doc
    .fillColor(COLOR_TEXTO_SUAVE)
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Paciente ID: ${limpiarTextoPDF(
        paciente.id
      )}`,
      inicioX,
      yId + 4,
      {
        width: anchoUtil,
        align: "center",
      }
    );

  doc.y =
    yId + 30;

  dibujarLineaDivisoria(doc);
}

// ============================================================
// DATOS DEL PACIENTE
// ============================================================

function dibujarDatosPaciente(
  doc,
  paciente
) {
  const inicioX =
    doc.page.margins.left;

  const anchoUtil =
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right;

  const anchoColumna =
    anchoUtil / 2;

  // ----------------------------------------------------------
  // TÍTULO
  // ----------------------------------------------------------

  doc
    .fillColor(COLOR_PRIMARIO)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      "DATOS DEL PACIENTE",
      inicioX,
      doc.y
    );

  doc.moveDown(0.5);

  // ----------------------------------------------------------
  // DATOS
  //
  // IZQUIERDA:
  // Nombre
  // Celular
  // Fecha de nacimiento
  //
  // DERECHA:
  // Cédula
  // Género
  // Email
  // ----------------------------------------------------------

  const nombreCompleto =
    `${limpiarTextoPDF(
      paciente.nombre
    )} ${limpiarTextoPDF(
      paciente.apellido
    )}`.trim() ||
    "No registrado";

  const datosIzquierda = [
    [
      "Nombre",
      nombreCompleto,
    ],
    [
      "Celular",
      limpiarTextoPDF(
        paciente.celular ||
          "No registrado"
      ),
    ],
    [
      "Fecha de nacimiento",
      formatearFechaLarga(
        paciente.fecha_nacimiento
      ),
    ],
  ];

  const datosDerecha = [
    [
      "Cédula",
      limpiarTextoPDF(
        paciente.cedula ||
          "No registrada"
      ),
    ],
    [
      "Género",
      limpiarTextoPDF(
        paciente.genero ||
          "No registrado"
      ),
    ],
    [
      "Email",
      limpiarTextoPDF(
        paciente.email ||
          "No registrado"
      ),
    ],
  ];

  // ----------------------------------------------------------
  // DIBUJAR LAS TRES FILAS
  // ----------------------------------------------------------

  for (
    let i = 0;
    i < 3;
    i++
  ) {
    const y = doc.y;

    // ------------------------------
    // COLUMNA IZQUIERDA
    // ------------------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(COLOR_TEXTO)
      .text(
        `${datosIzquierda[i][0]}:`,
        inicioX,
        y,
        {
          continued: true,
          width:
            anchoColumna - 8,
        }
      );

    doc
      .font("Helvetica")
      .text(
        ` ${datosIzquierda[i][1]}`,
        {
          width:
            anchoColumna - 10,
        }
      );

    // ------------------------------
    // COLUMNA DERECHA
    // ------------------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(
        `${datosDerecha[i][0]}:`,
        inicioX +
          anchoColumna,
        y,
        {
          continued: true,
          width:
            anchoColumna - 8,
        }
      );

    doc
      .font("Helvetica")
      .text(
        ` ${datosDerecha[i][1]}`,
        {
          width:
            anchoColumna - 10,
        }
      );

    doc.moveDown(0.65);
  }

  // ----------------------------------------------------------
  // DIRECCIÓN
  // ----------------------------------------------------------

  if (paciente.direccion) {
    const y = doc.y;

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(COLOR_TEXTO)
      .text(
        "Dirección:",
        inicioX,
        y,
        {
          continued: true,
        }
      );

    doc
      .font("Helvetica")
      .text(
        ` ${limpiarTextoPDF(
          paciente.direccion
        )}`,
        {
          width: anchoUtil,
        }
      );

    doc.moveDown(0.55);
  }

  dibujarLineaDivisoria(doc);
}

// ============================================================
// RESUMEN
// ============================================================

function dibujarResumen(
  doc,
  atenciones
) {
  const inicioX =
    doc.page.margins.left;

  doc
    .fillColor(COLOR_PRIMARIO)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      "RESUMEN DE ATENCIONES",
      inicioX,
      doc.y
    );

  doc.moveDown(0.4);

  if (
    !atenciones ||
    atenciones.length === 0
  ) {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(COLOR_TEXTO)
      .text(
        "No existen atenciones registradas.",
        inicioX
      );

    dibujarLineaDivisoria(doc);

    return;
  }

  const primera =
    atenciones[0];

  const ultima =
    atenciones[
      atenciones.length - 1
    ];

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLOR_TEXTO);

  doc.text(
    `Atenciones registradas: ${atenciones.length}`,
    inicioX
  );

  doc.text(
    `Primera atención: ${formatearFechaLarga(
      primera.fecha
    )}`,
    inicioX
  );

  doc.text(
    `Atención más reciente: ${formatearFechaLarga(
      ultima.fecha
    )}`,
    inicioX
  );

  doc.moveDown(0.3);

  dibujarLineaDivisoria(doc);
}

// ============================================================
// ATENCIONES
// ============================================================

function dibujarAtenciones(
  doc,
  atenciones
) {
  if (
    !atenciones ||
    atenciones.length === 0
  ) {
    return;
  }

  atenciones.forEach(
    (atencion, index) => {
      asegurarEspacio(
        doc,
        120
      );

      dibujarBloqueAtencion(
        doc,
        atencion,
        index + 1
      );
    }
  );
}

// ============================================================
// BLOQUE DE ATENCIÓN
// ============================================================

function dibujarBloqueAtencion(
  doc,
  atencion,
  numero
) {
  const inicioX =
    doc.page.margins.left;

  const anchoUtil =
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right;

  const anchoColumna =
    anchoUtil / 2;

  // ----------------------------------------------------------
  // TÍTULO
  // ----------------------------------------------------------

  doc
    .fillColor(COLOR_PRIMARIO)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      `ATENCIÓN #${numero}`,
      inicioX,
      doc.y
    );

  doc.moveDown(0.45);

  // ----------------------------------------------------------
  // RECTÁNGULO DE INFORMACIÓN
  // ----------------------------------------------------------

  const yBloque =
    doc.y;

  const altoBloque =
    54;

  dibujarFondoRedondeado(
    doc,
    inicioX,
    yBloque,
    anchoUtil,
    altoBloque,
    COLOR_FONDO_ATENCION
  );

  // ----------------------------------------------------------
  // FECHA
  // ----------------------------------------------------------

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(COLOR_TEXTO)
    .text(
      "Fecha:",
      inicioX + 12,
      yBloque + 10,
      {
        continued: true,
      }
    );

  doc
    .font("Helvetica")
    .text(
      ` ${formatearFechaLarga(
        atencion.fecha
      )}`
    );

  // ----------------------------------------------------------
  // HORA
  // ----------------------------------------------------------

  doc
    .font("Helvetica-Bold")
    .text(
      "Hora:",
      inicioX +
        anchoColumna +
        5,
      yBloque + 10,
      {
        continued: true,
      }
    );

  doc
    .font("Helvetica")
    .text(
      ` ${formatearHoraCorta(
        atencion.hora
      )}`
    );

  // ----------------------------------------------------------
  // ODONTÓLOGO
  // ----------------------------------------------------------

  doc
    .font("Helvetica-Bold")
    .text(
      "Odontólogo:",
      inicioX + 12,
      yBloque + 30,
      {
        continued: true,
      }
    );

  doc
    .font("Helvetica")
    .text(
      ` ${limpiarTextoPDF(
        atencion.odontologo ||
          "No registrado"
      )}`
    );

  // ----------------------------------------------------------
  // SERVICIO
  // ----------------------------------------------------------

  doc
    .font("Helvetica-Bold")
    .text(
      "Servicio:",
      inicioX +
        anchoColumna +
        5,
      yBloque + 30,
      {
        continued: true,
      }
    );

  doc
    .font("Helvetica")
    .text(
      ` ${limpiarTextoPDF(
        atencion.servicio ||
          "No registrado"
      )}`
    );

  // ----------------------------------------------------------
  // POSICIÓN DESPUÉS DEL RECTÁNGULO
  // ----------------------------------------------------------

  doc.y =
    yBloque +
    altoBloque +
    12;

  // ----------------------------------------------------------
  // CAMPOS CLÍNICOS
  // ----------------------------------------------------------

  const campos = [
    [
      "Motivo de consulta",
      atencion.motivo_consulta,
    ],
    [
      "Diagnóstico",
      atencion.diagnostico,
    ],
    [
      "Tratamiento realizado",
      atencion.tratamiento_realizado,
    ],
    [
      "Medicamentos recetados",
      atencion.medicamentos_recetados,
    ],
    [
      "Observaciones",
      atencion.observaciones,
    ],
  ];

  campos.forEach(
    ([etiqueta, valor]) => {
      if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
      ) {
        return;
      }

      const texto =
        limpiarTextoPDF(valor);

      doc
        .font("Helvetica")
        .fontSize(9.5);

      const alturaTexto =
        doc.heightOfString(
          texto,
          {
            width: anchoUtil,
          }
        );

      asegurarEspacio(
        doc,
        14 +
          alturaTexto +
          8
      );

      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor(COLOR_TEXTO)
        .text(
          `${etiqueta}:`,
          inicioX,
          doc.y
        );

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLOR_TEXTO)
        .text(
          texto,
          inicioX,
          doc.y,
          {
            width: anchoUtil,
            align: "justify",
          }
        );

      doc.moveDown(0.4);
    }
  );

  doc.moveDown(0.3);

  dibujarLineaDivisoria(doc);
}

// ============================================================
// PIE DE PÁGINA
// ============================================================

function dibujarPiesDePagina(
  doc
) {
  const rango =
    doc.bufferedPageRange();

  for (
    let i = rango.start;
    i <
    rango.start + rango.count;
    i++
  ) {
    doc.switchToPage(i);

    const inicioX =
      doc.page.margins.left;

    const anchoUtil =
      doc.page.width -
      doc.page.margins.left -
      doc.page.margins.right;

    const yPie =
      doc.page.height -
      doc.page.margins.bottom +
      15;

    const margenInferiorOriginal =
      doc.page.margins.bottom;

    // Evita página adicional
    doc.page.margins.bottom = 0;

    // --------------------------------------------------------
    // LÍNEA
    // --------------------------------------------------------

    doc
      .strokeColor(COLOR_LINEA)
      .lineWidth(0.5)
      .moveTo(
        inicioX,
        yPie - 8
      )
      .lineTo(
        inicioX + anchoUtil,
        yPie - 8
      )
      .stroke();

    // --------------------------------------------------------
    // TEXTO
    // --------------------------------------------------------

    doc
      .fillColor(COLOR_TEXTO_SUAVE)
      .font("Helvetica")
      .fontSize(7.5)
      .text(
        "Historial clínico odontológico · Documento generado electrónicamente",
        inicioX,
        yPie,
        {
          width: anchoUtil,
          align: "left",
        }
      );

    // --------------------------------------------------------
    // PÁGINA
    // --------------------------------------------------------

    doc.text(
      `Página ${
        i -
        rango.start +
        1
      } de ${rango.count}`,
      inicioX,
      yPie,
      {
        width: anchoUtil,
        align: "right",
      }
    );

    // Restaurar margen
    doc.page.margins.bottom =
      margenInferiorOriginal;
  }
}