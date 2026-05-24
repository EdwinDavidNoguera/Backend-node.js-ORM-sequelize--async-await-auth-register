-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-05-2026 a las 04:26:13
-- Versión del servidor: 11.4.5-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dental_life_plus2026`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id` int(11) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_odontologo` int(11) DEFAULT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `estado` enum('PROGRAMADA','CANCELADA','ATENDIDA') NOT NULL DEFAULT 'PROGRAMADA'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cita`
--

INSERT INTO `cita` (`id`, `id_paciente`, `id_odontologo`, `id_servicio`, `fecha`, `hora_inicio`, `hora_fin`, `estado`) VALUES
(1, 1, 1, 1, '2026-02-01', '08:00:00', '00:00:00', 'CANCELADA'),
(2, 2, 1, 5, '2026-02-01', '09:00:00', '00:00:00', 'ATENDIDA'),
(3, 3, 1, 2, '2026-02-01', '10:00:00', '00:00:00', 'PROGRAMADA'),
(5, NULL, 1, 1, '2026-04-01', '11:00:00', '00:00:00', 'PROGRAMADA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultorio`
--

CREATE TABLE `consultorio` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(150) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `consultorio`
--

INSERT INTO `consultorio` (`id`, `nombre`, `direccion`, `ciudad`, `activo`) VALUES
(1, 'Consultorio A-101', 'Calle 50 #10-20', 'Ancuyá', 1),
(2, 'Consultorio B-202', 'Avenida Principal #5-30', 'Ancuyá', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historia_odontologica`
--

CREATE TABLE `historia_odontologica` (
  `id` int(11) NOT NULL,
  `id_cita` int(11) NOT NULL,
  `motivo_consulta` varchar(255) DEFAULT NULL,
  `diagnostico` text NOT NULL,
  `tratamiento_realizado` text NOT NULL,
  `medicamentos_recetados` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historia_odontologica`
--

INSERT INTO `historia_odontologica` (`id`, `id_cita`, `motivo_consulta`, `diagnostico`, `tratamiento_realizado`, `medicamentos_recetados`, `observaciones`, `fecha_registro`) VALUES
(1, 2, 'Sarro visible', 'Gingivitis leve', 'Limpieza profunda', 'Clorhexidina enjuague', 'Mejorar uso de hilo dental', '2026-01-31 21:16:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horario_odontologo`
--

CREATE TABLE `horario_odontologo` (
  `id` int(11) NOT NULL,
  `id_odontologo` int(11) NOT NULL,
  `dia_semana` enum('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horario_odontologo`
--

INSERT INTO `horario_odontologo` (`id`, `id_odontologo`, `dia_semana`, `hora_inicio`, `hora_fin`) VALUES
(11, 1, 'LUNES', '08:00:00', '12:00:00'),
(12, 1, 'LUNES', '13:00:00', '16:00:00'),
(13, 1, 'MARTES', '08:00:00', '12:00:00'),
(14, 1, 'MARTES', '13:00:00', '16:00:00'),
(15, 1, 'MIERCOLES', '08:00:00', '12:00:00'),
(16, 1, 'MIERCOLES', '13:00:00', '16:00:00'),
(17, 1, 'JUEVES', '08:00:00', '12:00:00'),
(18, 1, 'JUEVES', '13:00:00', '16:00:00'),
(19, 1, 'VIERNES', '08:00:00', '12:00:00'),
(20, 1, 'VIERNES', '13:00:00', '16:00:00'),
(21, 2, 'LUNES', '08:00:00', '12:00:00'),
(22, 2, 'LUNES', '13:00:00', '16:00:00'),
(23, 2, 'MARTES', '08:00:00', '12:00:00'),
(24, 2, 'MARTES', '13:00:00', '16:00:00'),
(25, 2, 'MIERCOLES', '08:00:00', '12:00:00'),
(26, 2, 'MIERCOLES', '13:00:00', '16:00:00'),
(27, 2, 'JUEVES', '08:00:00', '12:00:00'),
(28, 2, 'JUEVES', '13:00:00', '16:00:00'),
(29, 2, 'VIERNES', '08:00:00', '12:00:00'),
(30, 2, 'VIERNES', '13:00:00', '16:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `odontologo`
--

CREATE TABLE `odontologo` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_consultorio` int(11) DEFAULT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `celular` varchar(20) NOT NULL,
  `numero_licencia` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `odontologo`
--

INSERT INTO `odontologo` (`id`, `id_usuario`, `id_consultorio`, `nombre`, `apellido`, `cedula`, `celular`, `numero_licencia`) VALUES
(1, 2, 1, 'Carlos', 'Mendoza', '5689565478', '3001234567', 'MP-12345'),
(2, 3, 2, 'Elena', 'Ríos', '4478787821', '3119876543', 'MP-67890');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

CREATE TABLE `paciente` (
  `id` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `cedula` varchar(10) DEFAULT NULL,
  `celular` varchar(10) NOT NULL,
  `genero` enum('MASCULINO','FEMENINO','OTRO') NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL COMMENT 'Puede ser nulo para pacientes "visitantes" que no tienen cuenta de usuario',
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paciente`
--

INSERT INTO `paciente` (`id`, `nombre`, `apellido`, `cedula`, `celular`, `genero`, `fecha_nacimiento`, `direccion`, `id_usuario`, `email`) VALUES
(1, 'Juan', 'Pérez', '1010101', '3200000001', 'MASCULINO', '1990-05-10', NULL, 4, 'paciente1@gcorreo.com'),
(2, 'Ana', 'Gómez', '2020202', '3200000002', 'FEMENINO', '1985-08-22', NULL, 5, 'paciente2@gcorreo.com'),
(3, 'Luis', 'Torres', '3030303', '3200000003', 'MASCULINO', '1992-12-01', NULL, 6, 'paciente3@gcorreo.c\r\nom'),
(4, 'Marta', 'Sosa', '4040404', '3200000004', 'FEMENINO', '1978-03-15', NULL, NULL, 'temp_4@mail.com'),
(5, 'Pedro', 'Ramírez', '5050505', '3200000005', 'MASCULINO', '1988-07-30', NULL, NULL, 'temp_5@mail.com'),
(6, 'Lucía', 'Fernández', '6060606', '3200000006', 'FEMENINO', '1995-11-20', NULL, NULL, 'temp_6@mail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil_odontologo`
--

CREATE TABLE `perfil_odontologo` (
  `id` int(11) NOT NULL,
  `id_odontologo` int(11) NOT NULL,
  `img` varchar(255) DEFAULT 'perfil-default.png',
  `titulo_profesional` varchar(150) NOT NULL,
  `universidad` varchar(150) DEFAULT NULL,
  `especialidad` varchar(150) DEFAULT NULL,
  `fecha_inicio_ejercicio` date DEFAULT NULL COMMENT 'Fecha en que el odontólogo comenzó a ejercer',
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `perfil_odontologo`
--

INSERT INTO `perfil_odontologo` (`id`, `id_odontologo`, `img`, `titulo_profesional`, `universidad`, `especialidad`, `fecha_inicio_ejercicio`, `activo`) VALUES
(1, 1, 'perfil-default.png', 'Odontólogo Cirujano', 'Univ. Nacional', 'Ortodoncia', '2015-06-01', 1),
(2, 2, 'perfil-default.png', 'Odontóloga Integral', 'Univ. de los Andes', 'Endodoncia', '2018-01-15', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio`
--

CREATE TABLE `servicio` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `img` varchar(255) DEFAULT 'servicio-default.png',
  `descripcion` text DEFAULT NULL,
  `duracion_minutos` int(11) NOT NULL COMMENT 'necesario para mostrar disponibilidad en agenda',
  `costo` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicio`
--

INSERT INTO `servicio` (`id`, `nombre`, `img`, `descripcion`, `duracion_minutos`, `costo`, `activo`) VALUES
(1, 'Ortodoncia', 'servicio-default.png', 'Ajuste de brackets y control mensual', 45, 150000, 1),
(2, 'Blanqueamiento Dental', 'servicio-default.png', 'Tratamiento LED de alta intensidad', 60, 250000, 1),
(3, 'Extracción de Cordales', 'servicio-default.png', 'Cirugía menor con anestesia local', 90, 350000, 1),
(4, 'Implante Dental', 'servicio-default.png', 'Restauración con perno de titanio', 120, 1200000, 1),
(5, 'Limpieza', 'servicio-default.png', 'Remoción de sarro y pulido dental', 30, 80000, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('ADMIN','PACIENTE','ODONTOLOGO') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `avatar` varchar(255) DEFAULT 'default-avatar.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `email`, `password`, `rol`, `activo`, `avatar`) VALUES
(1, 'administrador@gmail.com', 'ejemplo123', 'ADMIN', 1, 'default-avatar.png'),
(2, 'odontologo1@gclinica.com', '12345', 'ODONTOLOGO', 1, 'default-avatar.png'),
(3, 'odontologo2@gclinica.com', '1234545', 'ODONTOLOGO', 1, 'default-avatar.png'),
(4, 'paciente1@gcorreo.com', 'pacientekj123', 'PACIENTE', 1, 'default-avatar.png'),
(5, 'paciente2@gcorreo.com', 'paciente1re23', 'PACIENTE', 1, 'default-avatar.png'),
(6, 'paciente3@gcorreo.c\r\nom', 'pacientegff123', 'PACIENTE', 1, 'default-avatar.png');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cita_paciente` (`id_paciente`),
  ADD KEY `fk_cita_odontologo` (`id_odontologo`),
  ADD KEY `fk_cita_servicio` (`id_servicio`);

--
-- Indices de la tabla `consultorio`
--
ALTER TABLE `consultorio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `historia_odontologica`
--
ALTER TABLE `historia_odontologica`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_historia_cita` (`id_cita`);

--
-- Indices de la tabla `horario_odontologo`
--
ALTER TABLE `horario_odontologo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_horario_odontologo` (`id_odontologo`);

--
-- Indices de la tabla `odontologo`
--
ALTER TABLE `odontologo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `celular` (`celular`),
  ADD UNIQUE KEY `numero_licencia` (`numero_licencia`),
  ADD UNIQUE KEY `id_consultorio` (`id_consultorio`),
  ADD KEY `fk_odontologo_usuario` (`id_usuario`);

--
-- Indices de la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `celular` (`celular`),
  ADD UNIQUE KEY `unique_paciente_email` (`email`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD KEY `fk_paciente_usuario` (`id_usuario`);

--
-- Indices de la tabla `perfil_odontologo`
--
ALTER TABLE `perfil_odontologo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_perfil_odontologo` (`id_odontologo`);

--
-- Indices de la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `password` (`password`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `consultorio`
--
ALTER TABLE `consultorio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `historia_odontologica`
--
ALTER TABLE `historia_odontologica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `horario_odontologo`
--
ALTER TABLE `horario_odontologo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `odontologo`
--
ALTER TABLE `odontologo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `perfil_odontologo`
--
ALTER TABLE `perfil_odontologo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `servicio`
--
ALTER TABLE `servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `fk_cita_odontologo` FOREIGN KEY (`id_odontologo`) REFERENCES `odontologo` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cita_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cita_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `historia_odontologica`
--
ALTER TABLE `historia_odontologica`
  ADD CONSTRAINT `fk_historia_cita` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `horario_odontologo`
--
ALTER TABLE `horario_odontologo`
  ADD CONSTRAINT `fk_horario_odontologo` FOREIGN KEY (`id_odontologo`) REFERENCES `odontologo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `odontologo`
--
ALTER TABLE `odontologo`
  ADD CONSTRAINT `fk_odontologo_consultorio` FOREIGN KEY (`id_consultorio`) REFERENCES `consultorio` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_odontologo_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD CONSTRAINT `fk_paciente_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `perfil_odontologo`
--
ALTER TABLE `perfil_odontologo`
  ADD CONSTRAINT `fk_perfil_odontologo` FOREIGN KEY (`id_odontologo`) REFERENCES `odontologo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
