import { NextFunction, Request, Response } from 'express';
const User = require("../models/User");
const AccessLevel = require("../models/AccessLevel");
const bcrypt = require('bcrypt')

const saltRounds = 10;

const { check, body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

function removeSpaces(req: any, res: Response, next: NextFunction) {
  if (req.files?.image) {
    req.files.image.name = req.files.image.name.replace(/\s/g, '');
  }
  next();
}

export default {
  createNewUser:[
  removeSpaces,
  body('firstname')
      .notEmpty().withMessage('Le champ Prénom est requis.')
      .isLength({ max: 50 }).withMessage('Le Prénom doit comporter au maximum 50 caractères.'), async (req: any, res: Response) => {
        const errors = validationResult(req);
        const errorMessages = errors.array().reduce((accumulator:any, error:any) => {
            accumulator[error.param] = error.msg;
            return accumulator;
        }, {});
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errorMessages });
        }
        const body = req.body;
    try {
      const hash = await bcrypt.hash(body.password, saltRounds);
      
      let picture;
      if (req.files?.image) {
        var file = req.files.image
        picture = `uploads/images/${file.name}`
        await file.mv(`./public/uploads/images/${file.name}`);
      } else {
        picture = '';
      }
      
      const user = {
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        password: hash,
        accessId: body.accessId,
        position: body.position,
        startDate: body.startDate,
        contractType: body.contractType,
        salary: body.salary,
        phone: body.phone,
        picture
      };

      const result = await User.create(user);
      res.status(200).json({ id: result.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }],
  updateUserById:[  removeSpaces,
    body('firstname')
        .notEmpty().withMessage('Le champ Prénom est requis.')
        .isLength({ max: 50 }).withMessage('Le Prénom doit comporter au maximum 50 caractères.'), async (req: any, res: Response) => {

          const errors = validationResult(req);
          const errorMessages = errors.array().reduce((accumulator:any, error:any) => {
              accumulator[error.param] = error.msg;
              return accumulator;
          }, {});
          if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errorMessages });
          }

          let oldUser:any = {};
          User.findByPk(req.params.id).then((olduser:any)=>{
            oldUser = olduser;
          }).catch((err:any)=>{
            res.status(404).end()
          })
          
          const body = req.body;
          
          let picture;
          if (req.files?.image) {
            var file = req.files.image
            picture = `uploads/images/${file.name}`
            await file.mv(`./public/uploads/images/${file.name}`);
          } else {
            picture = '';
          }

        const userData:any = {
          firstname: body.firstname,
          lastname: body.lastname,
          email: body.email,
          accessId: body.accessId,
          position: body.position,
          startDate: body.startDate,
          contractType: body.contractType,
          salary: body.salary,
          phone: body.phone,
          picture: picture ? picture : oldUser.picture,
        };

    if (userData.password) {
        const hash = await bcrypt.hash(userData.password, saltRounds);
        userData.password = hash;
    }
   
      try {
        const result = await User.update(userData, {
          where: { _id: req.params.id },
        });
        if (result[0] === 0) {
          res.status(204).end();
        } else {
          res.status(200).end();
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    
  }],
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const data = await User.findAll({
        attributes: {
          exclude: ['password'] // List of fields to exclude
        },
        include: [
          {
            model: AccessLevel,
            attributes: ['type'],
          },
        ],
        order: [['_id', 'ASC']],
      });
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  },
  getUserById: async (req: Request, res: Response) => {
    try {
      const data = await User.findByPk(req.params.id, {
        include: [
          {
            model: AccessLevel,
            attributes: ['type'],
          },
        ],
      });
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  },
  deleteUserById: async (req: Request, res: any) => {
    try {
      const data = await User.destroy({
        where: { _id: req.params.id },
      });
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  },
  getUserByUsernameWithPassword: async (username: string, done: any) => {
    try {
      const user = await User.findOne({
        where: {
          email: username,
        },
        include: [AccessLevel],
      });
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  },
};
