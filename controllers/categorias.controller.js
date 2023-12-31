const { response } = require("express");
const { Categoria } = require("../models");

// Obtener Categorias- paginado total - populate

const obtenerCategorias = async (req = request, res = response) => {
  const { limite , desde } = req.query;
  const query = {
    estado: true,
  };

  const [total, categorias] = await Promise.all([
    Categoria.countDocuments(query),
    Categoria.find(query)
      .populate("usuario", "nombre")
      .skip(Number(desde))
      .limit(Number(limite)),
  ]);

  res.json({
    total,
    categorias,
  });
};

// Obtener Categoria - populate {}

const obtenerCategoria = async (req, res = response) => {
  const { id } = req.params;

  // Desactivar el usuario pero no borrarlo
  const categoria = await Categoria.findById(id).populate("usuario", "nombre");

  res.json({
    categoria,
  });
};

// Crear Categoria

const crearCategoria = async (req, res = response) => {
  const nombre = req.body.nombre.toUpperCase();

  const categoriaDB = await Categoria.findOne({
    nombre,
  });

  if (categoriaDB) {
    return res.status(400).json({
      msg: `La categoria ${categoriaDB.nombre},ya existe`,
    });
  }

  // Generar la data a guardar

  const data = {
    nombre,
    // TODO QUITAR precio, DE CATEGORIA
    usuario: req.usuario._id,
  };

  const categoria = new Categoria(data);

  // Guaradar en DB
  await categoria.save();

  res.status(201).json(categoria);
};

// Actualizar Categoria
const actualizarCategoria = async (req, res = response) => {
  const { id } = req.params;

  const { estado, usuario, ...data } = req.body;

  // capitalizando el nombre
  data.nombre = data.nombre.toUpperCase();
  // asignando el usuario ultimo por el que hace la actualizacion
  data.usuario = req.usuario._id;

  const categoria = await Categoria.findByIdAndUpdate(id, data, {
    new: true,
  });

  res.json(categoria);
};

// Borrar Categoria

const borrarCategoria = async (req, res = response) => {
  const { id } = req.params;

  const categoria = await Categoria.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );
  // {new : true} es para que se vean los cambios reflejados en la respuesta json

  res.json(categoria);
};

module.exports = {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoria,
  actualizarCategoria,
  borrarCategoria,
};
