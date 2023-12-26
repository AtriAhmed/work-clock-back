import { Request, Response } from 'express';
import { accessIdSupOrEqualTo } from '../middlewares/accessIdSupOrEqTo';
const CompanySettings = require("../models/CompanySettings")
const Holiday = require("../models/Holiday")

const { check, body, validationResult } = require('express-validator');

const companySettingsController = {
  getAllCompanySettings: [accessIdSupOrEqualTo(3), async (req: Request, res:Response) => {
    try {
      const companySettings = await CompanySettings.findOne();
      res.status(200).json(companySettings);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  getAllHolidays: [accessIdSupOrEqualTo(3), async (req: Request, res:Response) => {
    try {
      const holidays = await Holiday.findAll();
      const holidaysByDate = holidays.reduce((result:any, holiday:any) => {
        const date = `${holiday.month.toString()
        .padStart(2, "0")}-${holiday.day.toString()
          .padStart(2, "0")}`;
                
        // Add the work time for the date
        result[date] = holiday.name;
        
        return result;
      }, {});
      res.status(200).json(holidaysByDate);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  createCompanySettings: [accessIdSupOrEqualTo(3),
    async (req: Request, res:Response) => {
    try {
      const companySettings = await CompanySettings.create(req.body);
      res.status(201).json({ message: 'Access level created successfully', companySettings });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  createHoliday: [accessIdSupOrEqualTo(3),
    body('name')
    .notEmpty().withMessage('Le champ Nom est requis.')
    .isLength({ min: 2,max: 256 }).withMessage('Le Nom doit comporter entre 2 et 256 caractères.'),
    async (req: Request, res:Response) => {
      const errors = validationResult(req);
      const errorMessages = errors.array().reduce((accumulator:any, error:any) => {
          accumulator[error.path] = error.msg;
          return accumulator;
      }, {});
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errorMessages });
      }
    try {
      const holiday = await Holiday.create(req.body);
      res.status(201).json({ message: 'Holiday created successfully', holiday });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  updateCompanySettings: [accessIdSupOrEqualTo(3), async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      console.log(id)
      console.log(req.body)
      const [updatedRowsCount, updatedCompanySettings] = await CompanySettings.update(req.body, {
        returning: true,
        where: { id },
      });
      if (updatedRowsCount === 0) {
        return res.status(404).json({ message: 'Access level not found' });
      }
      res.status(200).json({ message: 'Access level updated successfully', companySettings: updatedCompanySettings });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],

  getCompanySettingsById: [accessIdSupOrEqualTo(3), async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      const companySettings = await CompanySettings.findByPk(id);
      if (!companySettings) {
        return res.status(404).json({ message: 'CompanySettings not found' });
      }
      return res.status(200).json(companySettings);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],

  deleteCompanySettings: [accessIdSupOrEqualTo(3), async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      const deletedRowCount = await CompanySettings.destroy({ where: { id } });
      if (deletedRowCount === 0) {
        return res.status(404).json({ message: 'Access level not found' });
      }
      res.status(200).json({ message: 'Access level deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
};

export default companySettingsController;
