const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const User = require("../models/user");

function signUp(req, res) {
  const user = new User();
  const { email, password, repeatPassword, name, lastname } = req.body;
  user.name = name;
  user.lastname = lastname;
  user.email = email.toLowerCase();
  user.role = "admin";
  user.active = false;

  if (!password || !repeatPassword) {
    res.status(404).send({ message: "las contraseñas son obligatorias." });
  } else {
    if (password !== repeatPassword) {
      res.status(404).send({ message: "LAs contraseñas no son iguales" });
    } else {
      bcrypt.hash(password, null, null, function (err, hash) {
        if (err) {
          res.status(500).send({ message: "Error al encriptar la contraseña" });
        } else {
          user.password = hash;
          user.save((err, userStored) => {
            if (err) {
              res.status(500).send({ message: "El usuario ya existe" });
            } else {
              if (!userStored) {
                res.status(404).sen({ message: "Error al crear usuario" });
              } else {
                res.status(200).send({ user: userStored });
              }
            }
          });
        }
      });
    }
  }
}

function signIn(req, res) {
  const params = req.body;
  const email = params.email.toLowerCase();
  const password = params.password;

  User.findOne({ email }, (err, userStored) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!userStored) {
        res.status(404).send({ message: "Usuario no encontrado" });
      } else {
        bcrypt.compare(password, userStored.password, (err, check) => {
          if (err) {
            res.status(500).send({ message: "Error del servidor" });
          } else if (!check) {
            res.status(404).send({ message: "La Contraseña es incorrecta" });
          } else {
            if (!userStored.active) {
              res.status(200).send({ message: "El usuario no se ha activado" });
            } else {
              res.status(200).send({
                accessToken: jwt.createAccessToken(userStored),
                refreshToken: jwt.createRefreshToken(userStored),
              });
            }
          }
        });
      }
    }
  });
}

function getUsers(req, res) {
  User.find().then((users) => {
    if (!users) {
      res.status(404).send({ message: "No se ha encontrado ningun usuario" });
    } else {
      res.status(200).send({ users });
    }
  });
  console.log("   Gets users...");
}
function getUsersActive(req, res) {
  const query = req.query;
  User.find({ active: query.active }).then((users) => {
    if (!users) {
      res.status(404).send({ message: "No se ha encontrado ningun usuario" });
    } else {
      res.status(200).send({ users });
    }
  });
  console.log("   Gets users...");
}

function uploadAvatar(req, res) {
  // "Params" ya necesitamos el id
  const params = req.params;

  // buscamos en User...  por el id ,y nos devuelva err y el usuario

  User.findById({ _id: params.id }, (err, userData) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor" });
    } else {
      if (!userData) {
        res.status(404).send({ message: "no se ha encontrado ningun usuario" });
      } else {
        let user = userData;

        if (req.files) {
          // spliteamos por el "/"( y si viene vacia \\),en e espacio dos para sacar solo el nobrey a extension
          let filePath = req.files.avatar.path;
          let fileSplit = filePath.split(`\\`);
          let fileName = fileSplit[2];

          // separamos la extension por el "." y a guardamos en extSplit
          let extSplit = fileName.split(".");
          let fileExt = extSplit[1];

          console.log(fileExt);

          // solo permitiremos que entren jpg y png

          if (fileExt !== "png" && fileExt !== "jpg") {
            res.status(400).send({
              message:
                "La extension de la imagen no es valida. (Estensiones permitidas: png y jpg. )",
            });
          } else {
            // le pasamos ala variabe user la propiedad avatar
            user.avatar = fileName;
            // buscamos en USer el usuario por el id,y update con la variable user, nos devovera err y userResult
            User.findByIdAndUpdate(
              { _id: params.id },
              user,
              (err, userResult) => {
                if (err) {
                  res.status(500).send({ message: "Error de servidor" });
                } else {
                  if (!userResult) {
                    res
                      .status(400)
                      .send({ message: "No se ha encontrado ningun usuario" });
                  } else {
                    res.status(200).send({ avatarName: fileName });
                  }
                }
              }
            );
          }
        }
      }
    }
  });
}

function getAvatar(req, res) {
  // nombre de los parametros de la imagen
  const avatarName = req.params.avatarName;

  // completamos el ficheron  con url de a imagen + el nombre
  const filePath = "./uploads/avatar/" + avatarName;

  //funcion para revisar si existe el archivo
  fs.exists(filePath, (exists) => {
    if (!exists) {
      res.status(404).send({ message: "El Avatar que  buscas no existe" });
    } else {
      res.sendFile(path.resolve(filePath));
    }
  });
}

function updateUser(req, res) {
  let userData = req.body;
  console.log(userData);
}
module.exports = {
  signUp,
  signIn,
  getUsers,
  getUsersActive,
  uploadAvatar,
  getAvatar,
  updateUser,
};
