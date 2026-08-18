import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/app/uploads/perfiles_odontologos");
  },

  filename: (req, file, cb) => {
    const nombreArchivo = `${Date.now()}-${file.originalname}`;
    cb(null, nombreArchivo);
  },
});

const fileFilter = (req, file, cb) => {
  const extensionesPermitidas = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ];

  const extension = path.extname(file.originalname).toLowerCase();

  if (extensionesPermitidas.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Solo se permiten imágenes JPG, JPEG, PNG o WEBP"
      ),
      false
    );
  }
};

const uploadPerfilOdontologo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

export default uploadPerfilOdontologo;