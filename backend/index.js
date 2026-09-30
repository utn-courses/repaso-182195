import express from "express"
import mongoose from "mongoose"
import cors from "cors"

process.loadEnvFile()

const app = express()

app.use(express.json())
app.use(cors())

// CREDENCIAL
// mongodb://localhost:27017/db_utn_182195
const URI_DB = process.env.URI_DB

const connectDb = async (URI_DB) => {
  try {
    await mongoose.connect(URI_DB)
    console.log("✅ Conectado a MongoDB con éxito.")
  } catch (error) {
    console.error("🚨 No se pudo conectar a la base de datos")
  }
}

// Modelo de usuario
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  rol: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
})

const Usuario = mongoose.model("Usuario", usuarioSchema)

// Obtener todos los usuarios
app.get("/usuarios", async (req, res) => {
  const usuarios = await Usuario.find({}, { password: 0, rol: 0, __v: 0 })
  console.log("Se ejecuto :)")
  res.json(usuarios)
})

// Obtener un usuario por ID
app.get("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id, { password: 0, __v: 0, rol: 0 })

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      })
    }

    res.json(usuario)
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400).json({ error: "Invalid ID, please again" })
    }
    console.log("Algo fallo :(")
  }
})

// Crear usuario
app.post("/usuarios", async (req, res) => {
  const { nombre, email, password, rol } = req.body

  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    rol
  })

  res.status(201).json(usuario)
})

// Eliminar usuario
app.delete("/usuarios/:id", async (req, res) => {
  const usuario = await Usuario.findByIdAndDelete(req.params.id)

  if (!usuario) {
    return res.status(404).json({
      mensaje: "Usuario no encontrado"
    })
  }

  res.json({
    mensaje: "Usuario eliminado"
  })
})

// LOGIN

app.post("/login", async (req, res) => {
  const { email, password } = req.body

  const usuario = await Usuario.findOne({
    email,
    password
  })

  if (!usuario) {
    return res.status(401).json({
      mensaje: "Email o contraseña incorrectos"
    })
  }

  //GENERAR el TOKEN
  res.json({
    id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol
  })
})

app.listen(3000, () => {
  connectDb(URI_DB)
  console.log("Servidor funcionando en http://localhost:3000")
})


console.log(crypto.randomUUID())