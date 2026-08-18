import multer from "multer";
import path from "path";

// Configuración de dónde y cómo se guardarán las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/app/uploads/servicios");
  },

  filename: (req, file, cb) => {
    const nombreArchivo = `${Date.now()}-${file.originalname}`;
    cb(null, nombreArchivo);
  }
});

// Configuración para aceptar únicamente imágenes
const fileFilter = (req, file, cb) => {
  const extensionesPermitidas = [".jpg", ".jpeg", ".png", ".webp"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (extensionesPermitidas.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error("Solo se permiten imágenes JPG, JPEG, PNG o WEBP"),
      false
    );
  }
};

// Middleware para cargar imágenes
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

export default upload;