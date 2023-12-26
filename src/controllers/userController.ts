import { NextFunction, Request, Response } from 'express';
import { accessIdSupOrEqualTo } from '../middlewares/accessIdSupOrEqTo';

const User = require("../models/User");
const AccessLevel = require("../models/AccessLevel");
const bcrypt = require('bcrypt')

const saltRounds = 10;

const { check, body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

function removeSpaces(req: any, res:Response, next: NextFunction) {
  if (req.files?.image) {
    req.files.image.name = req.files.image.name.replace(/\s/g, '');
  }
  next();
} 

export default {
  createNewUser:[
  removeSpaces,
  accessIdSupOrEqualTo(3),
  body('firstname')
      .notEmpty().withMessage('Le champ Prénom est requis.')
      .isLength({ max: 50 }).withMessage('Le Prénom doit comporter au maximum 50 caractères.'),
  body('lastname')
      .notEmpty().withMessage('Le champ Nom est requis.')
      .isLength({ max: 50 }).withMessage('Le Nom doit comporter au maximum 50 caractères.'),
  body('email')
      .notEmpty().withMessage('Le champ Email est requis.')
      .isEmail().withMessage('Le format de l\'email est incorrect.')
      .isLength({ max: 50 }).withMessage('L\'email doit comporter au maximum 50 caractères.'),
  body('password')
      .notEmpty().withMessage('Le champ Mot de passe est requis.')
      .isLength({ min:4, max: 50 }).withMessage('Le Mot de passe doit comporter entre 4 et 50 caractères.'),
  body('accessId')
      .notEmpty().withMessage('Le champ Niveau d\'accès est requis.')
      .isNumeric().withMessage('Le Niveau d\'accès doit être un nombre.')
      .isLength({ min:1, max:1 }).withMessage('Le Niveau d\'accès doit comporter 1 seul caractères.'),
  body('position')
      .notEmpty().withMessage('Le champ Poste est requis.')
      .isLength({ max: 192 }).withMessage('Le Poste doit comporter au maximum 192 caractères.'),
  body('startDate')
      .notEmpty().withMessage('Le champ Date de début est requis.')
      .isDate().withMessage('Le format de la date est incorrect.'),
  body('contractType')
      .notEmpty().withMessage('Le champ Type de contrat est requis.')
      .isLength({ max: 192 }).withMessage('Le Type de contrat doit comporter au maximum 192 caractères.'),
  body('salary')
      .notEmpty().withMessage('Le champ Salaire est requis.')
      .isNumeric().withMessage('Le Salaire doit être un nombre.')
      .isLength({ max: 50 }).withMessage('Le Salaire doit comporter au maximum 50 caractères.'),
  body('phone')
      .notEmpty().withMessage('Le champ Téléphone est requis.')
      .isLength({min:8,max:8}).withMessage('Le Téléphone doit comporter 8 caractères.'),
      async (req: any, res:Response) => {
        const errors = validationResult(req);
        const errorMessages = errors.array().reduce((accumulator:any, error:any) => {
            accumulator[error.path] = error.msg;
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
        ...body,
        password: hash,
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
    accessIdSupOrEqualTo(3),
    body('firstname')
      .notEmpty().withMessage('Le champ Prénom est requis.')
      .isLength({ max: 50 }).withMessage('Le Prénom doit comporter au maximum 50 caractères.'),
  body('lastname')
      .notEmpty().withMessage('Le champ Nom est requis.')
      .isLength({ max: 50 }).withMessage('Le Nom doit comporter au maximum 50 caractères.'),
  body('email')
      .notEmpty().withMessage('Le champ Email est requis.')
      .isEmail().withMessage('Le format de l\'email est incorrect.')
      .isLength({ max: 50 }).withMessage('L\'email doit comporter au maximum 50 caractères.'),
  body('accessId')
      .notEmpty().withMessage('Le champ Niveau d\'accès est requis.')
      .isNumeric().withMessage('Le Niveau d\'accès doit être un nombre.')
      .isLength({ min:1, max:1 }).withMessage('Le Niveau d\'accès doit comporter 1 seul caractères.'),
  body('position')
      .notEmpty().withMessage('Le champ Poste est requis.')
      .isLength({ max: 192 }).withMessage('Le Poste doit comporter au maximum 192 caractères.'),
  body('startDate')
      .notEmpty().withMessage('Le champ Date de début est requis.')
      .isDate().withMessage('Le format de la date est incorrect.'),
  body('contractType')
      .notEmpty().withMessage('Le champ Type de contrat est requis.')
      .isLength({ max: 192 }).withMessage('Le Type de contrat doit comporter au maximum 192 caractères.'),
  body('salary')
      .notEmpty().withMessage('Le champ Salaire est requis.')
      .isNumeric().withMessage('Le Salaire doit être un nombre.')
      .isLength({ max: 50 }).withMessage('Le Salaire doit comporter au maximum 50 caractères.'),
  body('phone')
      .notEmpty().withMessage('Le champ Téléphone est requis.')
      .isLength({min:8,max:8}).withMessage('Le Téléphone doit comporter 8 caractères.'),
    async (req: any, res:Response) => {

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
          ...body,
          picture: picture ? picture : oldUser.picture,
        };

        
        if (body.password) {
        const hash = await bcrypt.hash(body.password, saltRounds);
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
  getAllUsers: [accessIdSupOrEqualTo(3), async (req: Request, res: Response) => {
    
    try {
      const { keyword } = req.query;

      const where:any = {};

      if (keyword) {
        where[Op.or] = [
          {
            firstname: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            lastname: {
              [Op.like]: `%${keyword}%`,
            },
          },
        ];
      }
      

      const { page = 1, pageSize = 10 } = req.query;
const offset = (Number(page)-1) * Number(pageSize);

      const data = await User.findAndCountAll({
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: AccessLevel,
            attributes: ['type'],
          },
        ],
        order: [['_id', 'ASC']],
        limit: Number(pageSize),
        offset:Number(offset),
        where
      });
  
      const totalPages = Math.ceil(data.count / Number(pageSize));
  
      res.status(200).json({
        data: data.rows,
        pagination: {
          currentPage: +page,
          pageSize: +pageSize,
          totalPages,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }],
  
  getUserById: [accessIdSupOrEqualTo(3),async (req: Request, res:Response) => {
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
  }],
  deleteUserById: [accessIdSupOrEqualTo(3),async (req: Request, res:Response) => {
    try {
      const data = await User.destroy({
        where: { _id: req.params.id },
      });
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }],
  updateProfile:[  removeSpaces,
    accessIdSupOrEqualTo(1),
    body('firstname')
        .notEmpty().withMessage('Le champ Prénom est requis.')
        .isLength({ max: 50 }).withMessage('Le Prénom doit comporter au maximum 50 caractères.'), async (req: any, res:Response) => {

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
          phone: body.phone,
          picture: picture ? picture : oldUser.picture,
        };

        
        if (body.password) {
        const hash = await bcrypt.hash(body.password, saltRounds);
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
