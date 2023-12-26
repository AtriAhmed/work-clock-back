import { Request, Response } from 'express';
import { accessIdSupOrEqualTo } from '../middlewares/accessIdSupOrEqTo';
const LeaveRequest = require("../models/LeaveRequest")
const { Op } = require('sequelize');
const User = require("../models/User")
const DayWorkLog = require("../models/DayWorkLog")
const Holiday = require("../models/Holiday")
const CompanySettings = require("../models/CompanySettings")
const moment = require('moment');
const { check, body, validationResult } = require('express-validator');

const leaveRequestController = {
  getAllLeaveRequests: [accessIdSupOrEqualTo(3), async (req: Request, res:Response) => {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const offset = (Number(page)-1) * Number(pageSize);

       const { status }: { status?: string } = req.query;

        const where:any = {};

        if (status) { 
           console.log(status.split(','))
            where.status = {
                [Op.in]: status.split(',')
            };
        }

      const leaveRequests = await LeaveRequest.findAndCountAll({
        include: [
            {
              model: User,
            },
          ],
          where,
          limit: Number(pageSize),
          offset:Number(offset),
      });

      const totalPages = Math.ceil(leaveRequests.count / Number(pageSize));

      res.status(200).json({data:leaveRequests.rows,
        pagination: {
          currentPage: +page,
          pageSize: +pageSize,
          totalPages,
        }});
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  getUserLeaveRequests: [accessIdSupOrEqualTo(1), async (req: any, res:Response) => {
    try {
    
    const { status }: { status?: string } = req.query;
    const where:any = {};
    where.userId = req.user._id;

        if (status) {
            where.status = {
                [Op.in]: status.split(',')
            };
        }

      const leaveRequests = await LeaveRequest.findAll({
        include: [
            {
              model: User,
            },
          ],
          where
      });
      res.status(200).json(leaveRequests);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  createLeaveRequest: [accessIdSupOrEqualTo(1),
    body('startDate')
      .notEmpty().withMessage('Le champ Date de début est requis.')
      .isDate().withMessage('Le format de la date est incorrect.'),
    body('endDate')
      .notEmpty().withMessage('Le champ Date de fin est requis.')
      .isDate().withMessage('Le format de la date est incorrect.'),
    async (req: any, res:Response) => {
      const errors = validationResult(req);
      const errorMessages = errors.array().reduce((accumulator:any, error:any) => {
          accumulator[error.path] = error.msg;
          return accumulator;
      }, {});
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errorMessages });
      }
    try {
      const userId = req.user._id;

      const data= {...req.body,userId}

      const leaveRequest = await LeaveRequest.create(data);
      res.status(201).json({ message: 'Leave Request created successfully', leaveRequest });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }], 
  updateLeaveRequest: [accessIdSupOrEqualTo(1),
      body('startDate')
      .notEmpty().withMessage('Le champ Date de début est requis.')
      .isDate().withMessage('Le format de la date est incorrect.'),
    body('endDate')
      .notEmpty().withMessage('Le champ Date de fin est requis.')
      .isDate().withMessage('Le format de la date est incorrect.'),
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
      const { id } = req.params;
      const [updatedRowsCount, updatedLeaveRequest] = await LeaveRequest.update(req.body, {
        returning: true,
        where: { id },
      });
      if (updatedRowsCount === 0) {
        return res.status(404).json({ message: 'Leave request not found' });
      }
      res.status(200).json({ message: 'Leave Request updated successfully', leaveRequest: updatedLeaveRequest });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  getLeaveRequestById: [accessIdSupOrEqualTo(1), async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      const leaveRequest = await LeaveRequest.findByPk(id);
      if (!leaveRequest) {
        return res.status(404).json({ message: 'LeaveRequest not found' });
      }
      return res.status(200).json(leaveRequest);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  archiveLeaveRequest: [accessIdSupOrEqualTo(1), async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      const leaveRequest = await LeaveRequest.findOne({ where: { id } });

      if (!leaveRequest) {
        return res.status(404).json({ message: 'Leave Request not found' });
      }

      await leaveRequest.update({ status :4 });

      res.status(200).json({ message: 'Leave Request archived successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  declineLeaveRequest: [accessIdSupOrEqualTo(3), async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      const leaveRequest = await LeaveRequest.findOne({ where: { id } });

      if (!leaveRequest) {
        return res.status(404).json({ message: 'Leave Request not found' });
      }

      await leaveRequest.update({ status :2 });

      res.status(200).json({ message: 'Leave Request declined successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  approuveLeaveRequest: [accessIdSupOrEqualTo(3), async (req: Request, res:Response) => {
    try {
      const { id } = req.params;
      const leaveRequest = await LeaveRequest.findOne({ where: { id } });

      if (!leaveRequest) {
        return res.status(404).json({ message: 'Leave Request not found' });
      }

      await leaveRequest.update({ status :1 });

      res.status(200).json({ message: 'Leave Request approuved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }],
  getRemainingLeaveDays: [accessIdSupOrEqualTo(1), async (req:any, res:Response)=>{
    const userId: number =  req.params.id || req.user._id;
try{
  const companySettings = await CompanySettings.findOne();

  let weekRestDays: Number[] = JSON.parse(companySettings.weekRestDays);

  const approvedLeaveRequests = await LeaveRequest.findAll({
    where: {
      userId,
      status: 1,
      startDate: {
        [Op.gte]: new Date(new Date().getFullYear(), 0, 1),
      },
      endDate: {
        [Op.lte]: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59),
      },
    },
  });
  
  const workDays = await DayWorkLog.findAll({
    where: {
      userId,
      date: {
        [Op.gte]: new Date(new Date().getFullYear(), 0, 1),
        [Op.lte]: new Date(new Date().getFullYear(), 11, 31),
      },
      weekday: {
        [Op.notIn]: weekRestDays ,
      },
    },
  });

  let totalWorkTime = 0;
  for (const dayWorkLog of workDays) {
      totalWorkTime += dayWorkLog.totalWorkTime;
  }

  let totalWorkDays = Math.floor(totalWorkTime / 1000 / 60 / 60 / 8) + 1;


const approvedLeaveDays = approvedLeaveRequests.length;

const currentYear = moment().year();
const startDate = moment({ year: currentYear, month: 0, day: 1 });
const currentDate = moment();

const holidays = await Holiday.findAll({
  where: {
    month: { [Op.gte]: startDate.month() + 1 },
    day: { [Op.lte]: currentDate.date() },
  },
});

const holidaysTillToday = holidays.length;

let workdays = 0;

while (currentDate.isAfter(startDate)) {
  if (!weekRestDays.includes(currentDate.day())) {
      workdays++;
  }
  currentDate.subtract(1, 'day');
}

const remainingLeaveDays = companySettings.yearLeaveDays - (approvedLeaveDays + (workdays - (totalWorkDays + holidaysTillToday)))
  
res.status(200).json(remainingLeaveDays)

}catch(err){
  res.status(500).json(err)
}

  }]
};

export default leaveRequestController;
