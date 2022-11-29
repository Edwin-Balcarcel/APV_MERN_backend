import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emialOlvidePassword from "../helpers/emialOlvidePassword.js";

const registrar = async (req, res) => {
    const {email, nombre} = req.body;

    //Revisar si un usuario ya esta registrado
    const existeUsuario = await Veterinario.findOne({email});

    if (existeUsuario) {
        
        const error = new Error("Usuario ya registrado")

        return res.status(400).json({msg: error.message})
    }

    try {
        const veterinario = new Veterinario(req.body);

        const veterinarioGuardado = await veterinario.save();

        //Enviar emial
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        });
        
        res.json(veterinarioGuardado);

    } catch (error) {
        console.log(error)
    }

};

const perfil = (req, res) => {

    const { veterinario } = req;

    res.json(veterinario);
};

const confirmar = async (req, res) => {

    const {token} = req.params;

    const usuarioConfirmar = await Veterinario.findOne({token});

    if (!usuarioConfirmar) {
        const error = new Error('Token no válido');

        return res.status(404).json({msg: error.message});
    }

    try {

        usuarioConfirmar.token = null;

        usuarioConfirmar.confirmado = true;

        await usuarioConfirmar.save();

        res.json({msg: "Usuario Confirmado Correctamente"});
        
    } catch (error) {
        console.log(error);
    }

};

const autenticar = async (req, res) => {

    const {email, password} = req.body;

    //Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email});

    if (!usuario) {
        const error = new Error('El Usuario no existe');

        return res.status(404).json({msg: error.message});
    }

    // Comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error('Tu Cuenta no ha sido confirmada');
        return res.status(403).json({msg: error.message});    
    }

    // Revisar si el password es correcto
    if (await usuario.comprobarPassword(password)) {
        // Autenticar
        
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),
        });

    }else{
        const error = new Error('El Password es incorrecto');
        return res.status(403).json({msg: error.message});    
    }
    
};

const olvidePassword = async (req, res) => {
    const {email} = req.body;

    const existeVeterinario = await Veterinario.findOne({email});

    if (!existeVeterinario) {
        const error = new Error('El Usuario no existe');
        return res.status(400).json({msg: error.message});
    }

    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        //Enviar email con instrucciones
        emialOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })

        res.json({msg: "Hemos enviado un email con las instrucciones"});
    } catch (error) {
        console.log(error);
    }
};

const comprobarToken = async (req, res) => {
    const {token} = req.params;

    const tokenValido = await Veterinario.findOne({token});
     
    if (tokenValido) {
        //EL token es valido el usuario existe
        res.json({msg: "Token valido, el usuario existe"});


    }else{
        const error = new Error('Token no valido');
        return res.status(400).json({msg: error.message});
    }

};

const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const veterinario = await Veterinario.findOne({token});

    if (!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

    try {

        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({msg: "Password modificado correctamente"}); 
        console.log(veterinario);
    } catch (error) {
        console.log(error);
    }

};

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    if (!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({msg: error.message})
    }

    const {email} = req.body
    if (veterinario.email !== email) {
        const existeEmail = await Veterinario.findOne({email})
        if (existeEmail) {
            const error = new Error('Email ya registrado')
            return res.status(400).json({msg: error.message})
        }
    }

    try {
        veterinario.nombre = req.body.nombre || veterinario.nombre;
        veterinario.email = req.body.email || veterinario.email;
        veterinario.telefono = req.body.telefono;
        veterinario.web = req.body.web;

        const veterinarioActualizado = await veterinario.save()
        res.json(veterinarioActualizado)
        
    } catch (error) {
        console.log(error)
    }
};

const actualizarPassword = async (req, res) =>{
    //leer los datos   
    const {id} =req.veterinario;
    const {pwd_actual, pwd_nuevo} = req.body;

    //comprobar que le veterinario exista
    const veterinario = await Veterinario.findById(id);
    if (!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({msg: error.message})
    }
    
    //comprobar su password
    if (await veterinario.comprobarPassword(pwd_actual)) {
        //almacenar su password
        veterinario.password = pwd_nuevo;
        await veterinario.save();
        res.json({msg: 'Contraseña Almacenada Correctamente'})
        
    }else{
        const error = new Error('Contraseña Incorrecta');
        return res.status(400).json({msg: error.message})
    }

}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}