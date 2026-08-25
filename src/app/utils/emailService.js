import nodemailer from "nodemailer";

import AppError from "./errors/appError.js";

class EmailService {

  // Eliminamos el constructor

  async enviarCorreoRecuperacion(destinatario, urlRecuperacion) {

    try {

      // 1. configuramos el transporte de correo usando nodemailer y Gmail

      // Nota: se configuro el acceso a aplicaciones menos seguras en la cuenta de Gmail para permitir el envío de correos desde nodemailer.

      const transporter = nodemailer.createTransport({

        service: "gmail",

        auth: {

          user: process.env.EMAIL_USER,

          pass: process.env.EMAIL_PASS,

        },

      });

      // 2. Preparamos el contenido del correo

      const mailOptions = {

        from: `"Clínica Dental" <${process.env.EMAIL_USER}>`,

        to: destinatario,

        subject: "Recuperación de Contraseña - Clínica Dental",

        html: `

          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">

            <div style="text-align: center; margin-bottom: 20px;">

              <h2 style="color: #2c3e50; margin: 0;">Clínica Dental</h2>

            </div>

            <h3 style="color: #34495e;">Recuperación de Contraseña</h3>

            <p style="color: #555; font-size: 16px; line-height: 1.5;">Hola,</p>

            <p style="color: #555; font-size: 16px; line-height: 1.5;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no fuiste tú, puedes ignorar este correo de forma segura.</p>

            <div style="text-align: center; margin: 30px 0;">

              <a href="${urlRecuperacion}" style="background-color: #007bff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">Restablecer mi Contraseña</a>

            </div>

            <p style="color: #7f8c8d; font-size: 14px; text-align: center;">⚠️ Este enlace expirará en 2 horas.</p>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

            <p style="color: #95a5a6; font-size: 12px; text-align: center;">Si tienes problemas haciendo clic en el botón, copia y pega la siguiente URL en tu navegador web:</p>

            <p style="color: #3498db; font-size: 12px; text-align: center; word-break: break-all;">${urlRecuperacion}</p>

          </div>

        `,

      };

      // 3. Enviamos el correo

      await transporter.sendMail(mailOptions);

    } catch (error) {

      console.error("Error al enviar el correo:", error);

      throw new AppError(

        "Hubo un problema al intentar enviar el correo de recuperación. Por favor, intenta más tarde.",

        500

      );

    }

  }


  // Añadir este método a tu clase EmailService dentro de EmailService.js

  async enviarCorreoConfirmacionCita(destinatario, datosCita) {

    try {

      const transporter = nodemailer.createTransport({

        service: "gmail",

        auth: {

          user: process.env.EMAIL_USER,

          pass: process.env.EMAIL_PASS,

        },

      });

      const mailOptions = {

        from: `"Clínica Dental" <${process.env.EMAIL_USER}>`,

        to: destinatario,

        subject: "Confirmación de Cita Odontológica",

        html: `

          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">

            <h2 style="color: #2c3e50; text-align: center;">¡Tu Cita ha sido Agendada!</h2>

            <p>Hola <strong>${datosCita.nombrePaciente}</strong>,</p>

            <p>Hemos registrado tu cita médica con éxito. A continuación encuentras los detalles:</p>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">

              <p style="margin: 5px 0;"><strong>Servicio:</strong> ${datosCita.servicio}</p>

              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${datosCita.fecha}</p>

              <p style="margin: 5px 0;"><strong>Hora:</strong> ${datosCita.hora}</p>

              <p style="margin: 5px 0;"><strong>Odontólogo:</strong> ${datosCita.odontologo}</p>

            </div>

            <p style="color: #7f8c8d; font-size: 13px; text-align: center;">Si necesitas cancelar o reprogramar, comunícate con nosotros con anticipación.</p>

          </div>

        `,

      };

      await transporter.sendMail(mailOptions);

    } catch (error) {

      console.error("Error al enviar correo de cita:", error);

      // No interrumpimos la respuesta si falla únicamente el envío de correo

    }

  }

}

export default new EmailService();