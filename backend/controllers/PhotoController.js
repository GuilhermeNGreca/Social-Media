const Photo = require("../models/Photo");
const User = require("../models/User");

const mongoose = require("mongoose");

//Inserir uma foto com um usuário relacionado a ela
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;
  const reqUser = req.user;

  try {
    if (!reqUser) {
      return res.status(401).json({ errors: ["Usuário não autenticado"] });
    }

    const user = await User.findById(reqUser._id);

    //criando foto
    const newPhoto = await Photo.create({
      image,
      title,
      userId: user._id,
      userName: user.name,
    });

    //se a foto foi criada com sucesso
    if (!newPhoto) {
      res
        .status(422)
        .json({ errors: ["Houve um problema, por favor tente novamente!"] });
    }
    res.status(201).json(newPhoto);
  } catch (error) {
    res.status(500).json({ errors: ["Erro interno do servidor"] });
    return;
  }
};

//removendo foto do banco de dados
const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

    //checando se a foto existe
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada!"] });
      return;
    }

    //checando se a foto pertence ao usuário
    if (!photo.userId.equals(reqUser._id)) {
      res.status(422).json({ errors: ["Por favor, tente novamente!"] });
    }

    await Photo.findByIdAndDelete(photo._id);

    res
      .status(200)
      .json({ id: photo._id, message: "Foto excluída com sucesso!" });
  } catch (error) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }
};

//pegando todas as fotos
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({})
    .sort([["createAt", -1]]) //pegando as mais novas primeiro
    .exec();

  res.status(200).json(photos);
};

//pegando fotos do usuário
const getUserPhotos = async (req, res) => {
  const { id } = req.params;
  const photos = await Photo.find({ userId: id })
    .sort([["createAt", -1]])
    .exec();

  return res.status(200).json(photos);
};

//pegando foto pelo id (individual)
const getPhotoById = async (req, res) => {
  const { id } = req.params;

  try {
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

    //checando se a foto existe
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada!"] });
      return;
    }
    res.status(200).json(photo);
  } catch (error) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }
};

// Alterando fotos
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const reqUser = req.user;

  try {
    const photo = await Photo.findById(id);

    //checando se a foto existe
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada!"] });
      return;
    }

    //checando se a foto pertence ao usuário
    if (!photo.userId.equals(reqUser._id)) {
      res.status(422).json({ errors: ["Ocorreu um erro, tente novamente!"] });
      return;
    }

    if (title) {
      photo.title = title;
    }
    await photo.save();

    res.status(200).json({ photo, message: "Foto atualizada com sucesso!" });
  } catch (error) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }
};

// Like nas fotos
const likePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    const photo = await Photo.findById(id);

    //checando se a foto existe
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada!"] });
      return;
    }

    //checando se o usuário já deu like na foto
    if (photo.likes.includes(reqUser._id)) {
      // Removendo o ID do usuário no array de likes para dar deslike
      photo.likes = photo.likes.filter(
        (like) => like.toString() !== reqUser._id.toString()
      );
      photo.save();

      res.status(200).json({
        photoId: id,
        userId: reqUser._id,
        message: "Você deu deslike na foto!",
      });
      return;
    }

    //colocando id do usuário no array de likes
    photo.likes.push(reqUser._id);
    photo.save();

    res.status(200).json({
      photoId: id,
      userId: reqUser._id,
      message: "A foto foi curtida!",
    });
  } catch (error) {
    res.status(404).json({ errors: ["Erro ao dar like!"] });
    return;
  }
};

// Adicionando comentários
const commentPhoto = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const reqUser = req.user;

  try {
    const user = await User.findById(reqUser._id);
    const photo = await Photo.findById(id);

    // Verifique se a foto existe
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada!"] });
      return;
    }

    //colocando comentários no array de comentários
    const userComment = {
      comment,
      userName: user.name,
      userImage: user.profileImage,
      userId: user._id,
    };

    photo.comments.push(userComment);
    await photo.save();

    res.status(200).json({
      comment: userComment,
      message: "O comentário foi adicionado com sucesso!",
    });
  } catch (error) {
    res.status(404).json({ errors: ["Erro ao comentar!"] });
    return;
  }
};

// Procurando imagem pelo titulo
const searchPhotos = async (req, res) => {
  const { q } = req.query;
  const photos = await Photo.find({ title: new RegExp(q, "i") }).exec();

  res.status(200).json(photos);
};

module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  likePhoto,
  commentPhoto,
  searchPhotos,
};
