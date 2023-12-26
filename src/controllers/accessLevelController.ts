import { Request, Response } from 'express';
const AccessLevel = require("../models/AccessLevel")

const accessLevelController = {
  getAllAccessLevels: async (req: Request, res:Response) => {
    try {
      const accessLevels = await AccessLevel.findAll();
      res.status(200).json(accessLevels);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  },

  createAccessLevel: async (req: Request, res:Response) => {
    try {
      const accessLevel = await AccessLevel.create(req.body);
      res.status(201).json({ message: 'Access level created successfully', accessLevel });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  },

  updateAccessLevel: async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      const [updatedRowsCount, [updatedAccessLevel]] = await AccessLevel.update(req.body, {
        returning: true,
        where: { id },
      });
      if (updatedRowsCount === 0) {
        return res.status(404).json({ message: 'Access level not found' });
      }
      res.status(200).json({ message: 'Access level updated successfully', accessLevel: updatedAccessLevel });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  },

  getAccessLevelById: async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      const accessLevel = await AccessLevel.findByPk(id);
      if (!accessLevel) {
        return res.status(404).json({ message: 'AccessLevel not found' });
      }
      return res.status(200).json(accessLevel);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  },

  deleteAccessLevel: async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      const deletedRowCount = await AccessLevel.destroy({ where: { id } });
      if (deletedRowCount === 0) {
        return res.status(404).json({ message: 'Access level not found' });
      }
      res.status(200).json({ message: 'Access level deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  },
};

export default accessLevelController;
