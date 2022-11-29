import nodemailer from 'nodemailer';

const emialOlvidePassword = async (datos) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

  //Enviar el email
    const {email, nombre, token} = datos;

    const info = await transporter.sendMail({
      from: "APV- Administrador de Pacientes de Veterianria",
      to: email,
      subject: 'Reestablece tu Password',
      text: 'Reestablece tu Password',
      html: `<p>Hola: ${nombre}, has solicitado reestablecer tu password.</P> 

        <P>sigue el siguiente enlace para generar un nuevo password:
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a> </p>

        <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje.</p>

      `
    });

  console.log("Mensaje enviado: %s", info.messageId);
}

export default emialOlvidePassword;