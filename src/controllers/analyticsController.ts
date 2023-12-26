import { Request, Response } from 'express';
import { accessIdSupOrEqualTo } from '../middlewares/accessIdSupOrEqTo';
const { Op } = require('sequelize');
const moment = require('moment');
const User = require("../models/User");

const DayWorkLog = require('../models/DayWorkLog');
const WorkLog = require('../models/WorkLog');
const Holiday = require('../models/Holiday');
const CompanySettings = require('../models/CompanySettings');
const LeaveRequest = require('../models/LeaveRequest');

const analyticsController = {
  getMonthsAvgWorkHours: [accessIdSupOrEqualTo(3), async (req: any, res:Response) => {
    try {
        const currentYear = new Date().getFullYear();
    
        const yearStartDate = new Date(currentYear, 0, 1);
        const yearEndDate = new Date(currentYear, 11, 31);

        const yearStart = `${yearStartDate.getFullYear()}-${(yearStartDate.getMonth()+1).toString().padStart(2, "0")}-${yearStartDate.getDate().toString().padStart(2, "0")}`
        const yearEnd = `${yearEndDate.getFullYear()}-${(yearEndDate.getMonth()+1).toString().padStart(2, "0")}-${yearEndDate.getDate().toString().padStart(2, "0")}`
    
        const workLogs = await DayWorkLog.findAll({
          where: {
            date: 
                {
                  [Op.between]: [yearStart, yearEnd],
                },
          },
        });
    
        const monthlyWorkHours = Array(12).fill(0);
        workLogs.forEach((workLog:any) => {
          const month = (new Date(workLog.date)).getMonth(); 
          const workHours = workLog.totalWorkTime / 1000 / 60 / 60; 
          monthlyWorkHours[month] += workHours;
        });

        const monthlyAverageWorkHours = monthlyWorkHours.map(async(month,index)=>{
            
            const holidays = await Holiday.findAll({
              where: {
                month: index+1,
              }
            });
            
            const monthHolidays = holidays.length;

            const year = (new Date()).getFullYear()

            const lastDay = new Date(year, index+1, 0).getDate();
            console.log("lastday:" + lastDay)

            const firstDate = moment({year, month: index, day:1})
            const lastDate = moment({year, month: index, day:lastDay})
            console.log("month"+ index+ " first:"+firstDate+" lastDate:"+lastDate)

            let workdays = 0;

            const companySettings = await CompanySettings.findOne();

            let weekRestDays: Number[] = JSON.parse(companySettings.weekRestDays);
            
            while (lastDate.isAfter(firstDate)) {
              if (!weekRestDays.includes(lastDate.day())) {
                  workdays++;
              }
              lastDate.subtract(1, 'day');
            }
            workdays -= monthHolidays;
             return month / workdays;
        })

    Promise.all(monthlyAverageWorkHours)
  .then((result) => {
        res.status(200).json(result);
  })
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred.' });
      }
    }],
    getWeekdaysAvgWorkHours : [accessIdSupOrEqualTo(3), async (req:any, res:Response) => {
      try {
        const companySettings = await CompanySettings.findOne();

            let weekRestDays: Number[] = JSON.parse(companySettings.weekRestDays);

        const weekdaysWorkLogs = await DayWorkLog.findAll({
          where: {
            weekDay: {
              [Op.notIn]: weekRestDays,
            },
          }
        });
    
        const avgWorkHoursPerWeekday = [0, 0, 0, 0, 0]; 
    
        weekdaysWorkLogs.forEach((dayWorkLog:any) => {
    
          avgWorkHoursPerWeekday[dayWorkLog.weekDay] +=
            (dayWorkLog.totalWorkTime /1000 / 60 / 60 / weekdaysWorkLogs.length); 
        });
    
        res.status(200).json( avgWorkHoursPerWeekday);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred.' });
      }
    }],
    getMonthsLeaveRequestsStatus : [accessIdSupOrEqualTo(3), async (req:any, res:Response) => {
  try {
    const currentYear = new Date().getFullYear();

    const leaveRequests = await LeaveRequest.findAll({
      where: {
        startDate: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
        },
        status: {
          [Op.in]: [1, 2],
        },
      },
    });

    const approuvedCounts = Array(12).fill(0);
    const rejectedCounts = Array(12).fill(0);

    leaveRequests.forEach((leaveRequest:any) => {
      const month = (new Date(leaveRequest.startDate)).getMonth();
      if (leaveRequest.status === 1) {
        approuvedCounts[month]++;
      } else if (leaveRequest.status === 2) {
        rejectedCounts[month]++;
      } 
    }); 

    res.status(200).json({ approuved: approuvedCounts, rejected: rejectedCounts });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred.' });
  }
    }],
    getMonthsLeaveRequests : [accessIdSupOrEqualTo(3), async (req:any, res:Response)=> {
  try {
    const currentYear = new Date().getFullYear();

    const leaveRequests = await LeaveRequest.findAll({
      where: {
        startDate: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
        },
      },
    });

    const totalRequestsCounts = Array(12).fill(0);

    leaveRequests.forEach((leaveRequest:any) => {
      const month = (new Date(leaveRequest.startDate)).getMonth();
      totalRequestsCounts[month]++;
    });
 
    res.status(200).json(totalRequestsCounts);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred.' });
  }
}],
getSalariesSum : [accessIdSupOrEqualTo(3), async (req:any, res:Response)=> {
  try {
    const result = await User.sum('salary');
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}],
getMotivationAndReduction:[accessIdSupOrEqualTo(3),async (req:any, res:Response)=>{
  try {
    // Fetch all users with their last 30 workDayLog entries
    const usersWithLogs = await User.findAll({
      where: { accessId: 1 },
      include: {
        model: DayWorkLog,
        limit: 30,
        order: [['date', 'DESC']], // Order by date in descending order to get the most recent logs
      },
    });

    // Calculate the sum of users' worklogs totals difference which are > 0
    const positiveDifferenceSum = usersWithLogs.reduce((sum:number, user:any) => {
      const totalDifference = workTimeDifference(user.DayWorkLogs, 30);
      return sum + Math.max(0, totalDifference);
    }, 0);

    // Calculate the sum of users' worklogs totals difference which are < 0
    const negativeDifferenceSum = usersWithLogs.reduce((sum:number, user:any) => {
      const totalDifference = workTimeDifference(user.DayWorkLogs, 30);
      return sum + Math.min(0, totalDifference);
    }, 0);

    res.status(200).json({
      positiveDifferenceSum,
      negativeDifferenceSum,
    });
  } catch (error) {
    console.error('Error:', error);
    throw new Error('An error occurred.');
  }
}]
}

function workTimeDifference(workLogs:any[], daysNb:number) {
  const lastNDaysWorkLogs = workLogs.slice(0, daysNb);

  // Calculate the sum of totalWorkTime values for the last n workLogs
  const total = lastNDaysWorkLogs.reduce(
    (total, workLog) => total + workLog.totalWorkTime,
    0
  );

  const time = total - daysNb * 8 * 60 * 60 * 1000;
  return time;
}

export default analyticsController;