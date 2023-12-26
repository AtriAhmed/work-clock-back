import { NextFunction, Request, Response } from 'express';
import { accessIdSupOrEqualTo } from '../middlewares/accessIdSupOrEqTo';
const WorkLog = require("../models/WorkLog")
const DayWorkLog = require("../models/DayWorkLog")
const User = require("../models/User")
const { Op } = require('sequelize');



const workLogController = {
  createWorkLog: [accessIdSupOrEqualTo(1), async (req:any, res:Response) => {
    try {
      const userId: number = req.user._id; // Replace with how you identify the user
      // Check if a dayWorkLog exists for today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let dayWorkLog = await DayWorkLog.findOne({
        where: { userId: userId, date: today },
      });
      
      const weekDay = today.getDay()

      if (!dayWorkLog) {
        // Create a new dayWorkLog if it doesn't exist
        dayWorkLog = await DayWorkLog.create({userId, date: today, weekDay });
      }
      
      // Check if an open workLog exists for the user
      const openWorkLog = await WorkLog.findOne({
        where: {dayWorkLogId:dayWorkLog.id, endTime: null },
      });
      
      if (openWorkLog) {
        
        const startTime = openWorkLog.startTime;
        
        const startTimeParts = startTime.split(":");
const startTimeDate = new Date();
startTimeDate.setHours(parseInt(startTimeParts[0], 10));
startTimeDate.setMinutes(parseInt(startTimeParts[1], 10));
startTimeDate.setSeconds(parseInt(startTimeParts[2], 10));

const endTime = new Date();
endTime.setHours(endTime.getHours()+1)
const timeDifference = endTime.getTime() - startTimeDate.getTime() - 3600000;

// Update the open workLog with endTime (clock-out)
await openWorkLog.update({ endTime });

// Increment the totalWorkTime in dayWorkLog
const newTotalWorkTime = dayWorkLog.totalWorkTime + timeDifference;
await dayWorkLog.update({ totalWorkTime: newTotalWorkTime });
} else {
  const startTime = new Date();
  startTime.setHours((new Date).getHours()+1)
  // Create a new workLog with startTime (clock-in)
  await WorkLog.create({ dayWorkLogId: dayWorkLog.id, startTime });
}

res.status(200).json({ message: "Clock-in/clock-out successful." });
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: "An error occurred." });
}
}],
getWorkClockStatus: [accessIdSupOrEqualTo(1), async (req: any, res:Response) => {
  try {
    const userId: number = req.user._id; // Replace with how you identify the user

    // Find the last dayWorkLog for the user
    const lastDayWorkLog = await DayWorkLog.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!lastDayWorkLog) {
      // If no dayWorkLog is found, it's not created
      res.status(200).json({ status: "day work log not_created" });
      return; // Exit the function
    }

    // Find the associated workLog for the last dayWorkLog
    const lastWorkLog = await WorkLog.findOne({
      where: { dayWorkLogId: lastDayWorkLog.id },
      order: [["createdAt", "DESC"]],
    });

    if (!lastWorkLog) {
      // If no workLog is found for the dayWorkLog, it's not created
      res.status(200).json({ status: "work log not_created" });
    } else if (!lastWorkLog.endTime) {
      // If the last workLog exists but endTime is null, it's opened
      res.status(200).json({ status: "opened" });
    } else {
      // If the last workLog exists and endTime is not null, it's closed
      res.status(200).json({ status: "closed" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
}],
getDayWorkLog: [accessIdSupOrEqualTo(1), async (req: any, res:Response) => {
  try {
    const userId: number = req.user._id; // Replace with how you identify the user

    // Find the current dayWorkLog for the user (today's date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDayWorkLog = await DayWorkLog.findOne({
      where: { userId, date: today },
      include: WorkLog, // Include associated WorkLog records
    });

    const weekDay = today.getDay();

    if (!currentDayWorkLog) {
      const lastDayWorkLog = await DayWorkLog.findOne({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });

      if(lastDayWorkLog){
            // Find the associated workLog for the last dayWorkLog
            const lastWorkLog = await WorkLog.findOne({
              where: { dayWorkLogId: lastDayWorkLog.id },
              order: [["createdAt", "DESC"]],
            });
      
            if(lastWorkLog){
                    const day = new Date()
                  if(lastDayWorkLog.date != `${day.getFullYear()}-${(day.getMonth()+1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`){
                    if(!lastWorkLog?.endTime){
                      const endTime = "23:59:59";
                        await lastWorkLog?.update({endTime});
                    }
            }
          }
      }
      // If no current dayWorkLog is found, create one
      currentDayWorkLog = await DayWorkLog.create({ userId, date: today,weekDay });
    }

    // Return the current dayWorkLog and its associated workLogs
    res.status(200).json(currentDayWorkLog);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
}],
getWeekWorkLog: [accessIdSupOrEqualTo(1), async (req: any, res:Response) => {
  try {
    const userId = req.user._id; // Replace with how you identify the user

    // Calculate the start and end dates for the last week
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setHours(0, 0, 0, 0);
    const lastWeekStartDate = new Date(endDate);
    lastWeekStartDate.setDate(lastWeekStartDate.getDate() - 6); // Last week starts 6 days ago

    // Query the database for WorkDayLog entries in the last week, excluding Sundays (0) and Saturdays (6)
    const workDayLogs = await DayWorkLog.findAll({
      where: {
        userId: userId,
        date: {
          [Op.between]: [lastWeekStartDate, endDate],
        },
        weekday: {
          [Op.notIn]: [0, 6], // Exclude Sunday and Saturday
        },
      },
    });

    // Calculate the total work time by summing up the work times from workDayLogs
    const totalWorkTimeInSeconds = workDayLogs.reduce(
      (total:any, workDayLog:any) => total + workDayLog.totalWorkTime,
      0
    );
    let total = totalWorkTimeInSeconds;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDayWorkLog = await DayWorkLog.findOne({
      where: { userId, date: today },
      include: WorkLog, // Include associated WorkLog records
    });

    if(currentDayWorkLog){
      let workLogs = currentDayWorkLog.WorkLogs
      if(workLogs.length > 0)
      if(!workLogs[workLogs.length-1]?.endTime){
        const startTimeOnly = workLogs[workLogs.length-1]?.startTime.split(":")
        const startTime = new Date()
        startTime.setHours(startTimeOnly[0])
        startTime.setMinutes(startTimeOnly[1])
        startTime.setSeconds(startTimeOnly[2])
      
      total += new Date().getTime() - startTime.getTime()
      }
    }


    let result = (total/1000) - (workDayLogs.length * 8 * 60 * 60);
    

    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
}],
getMonthWorkLog: [accessIdSupOrEqualTo(1), async (req: any, res:Response) => {
  try {
    const userId = req.user._id;

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setHours(0, 0, 0, 0);
    const lastWeekStartDate = new Date(endDate);
    lastWeekStartDate.setDate(lastWeekStartDate.getDate() - 30);

    const workDayLogs = await DayWorkLog.findAll({
      where: {
        userId: userId,
        date: {
          [Op.between]: [lastWeekStartDate, endDate],
        },
        weekday: {
          [Op.notIn]: [0, 6], // Exclude Sunday and Saturday
        },
      },
    });

    const workLogByDate = workDayLogs.reduce((result:any, workLog:any) => {
      // Extract the date (YYYY-MM-DD) from the work log
      const date = workLog.date;
      
      // If the date doesn't exist in the result object, create an entry for it
      if (!result[date]) {
        result[date] = 0;
      }
     
      // Add the work time for the date
      result[date] += workLog.totalWorkTime - (8 * 60 * 60 * 1000);
    
      return result;
    }, {});

    res.status(200).json(workLogByDate);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
}],
getSpecifiedMonthWorkLog: [accessIdSupOrEqualTo(1), async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    let startDate;
    let endDateFilter;

    if (req.params.month) {
      const monthYear = req.params.month.split("-");
      const month = monthYear[0];
      const year = parseInt(monthYear[1]);

      const monthIndex = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(month.toLowerCase());
      if (monthIndex === -1) {
        throw new Error("Invalid month format");
      }

      startDate = new Date(year, monthIndex, 1);
      const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
      endDateFilter = new Date(lastDayOfMonth);
      endDateFilter.setHours(23, 59, 59, 999); // Set end date to the last millisecond of the day
    } else {
      startDate = firstDayOfMonth;
      endDateFilter = endDate;
    }

    const workDayLogs = await DayWorkLog.findAll({
      where: {
        userId: userId,
        date: {
          [Op.between]: [startDate, endDateFilter],
        }
      },
    });

    const workLogByDate = workDayLogs.reduce((result: any, workLog: any) => {
      const date = workLog.date;

      if (!result[date]) {
        result[date] = 0;
      }

      result[date] += workLog.totalWorkTime - (8 * 60 * 60 * 1000);

      return result;
    }, {});

    res.status(200).json(workLogByDate);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
}],

  getDateWorkLog: [accessIdSupOrEqualTo(1), async (req: any, res:Response) => {
   try {
    const userId: number =  req.params.id || req.user._id; // Replace with how you identify the user
    // Find the current dayWorkLog for the user (today's date)
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    let currentDayWorkLog = await DayWorkLog.findOne({
      where: { userId, date: date },
      include: WorkLog, // Include associated WorkLog records
    });

    // Return the current dayWorkLog and its associated workLogs
    res.status(200).json(currentDayWorkLog);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
  }],
  getUsersWorkLog: [accessIdSupOrEqualTo(2), async (req: Request, res:Response) => {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const offset = (Number(page)-1) * Number(pageSize);
      // Fetch all users with their last 30 workDayLog entries
      const usersWithLogs = await User.findAndCountAll({
        where:{accessId: 1},
        limit: Number(pageSize),
        offset:Number(offset),
        include: {
          model: DayWorkLog,
          limit: 30,
          order: [['date', 'DESC']], // Order by date in descending order to get the most recent logs
        },
      });

      const totalPages = Math.ceil(usersWithLogs.count / Number(pageSize));
  
      res.status(200).json({data:usersWithLogs.rows,
        pagination: {
          currentPage: +page,
          pageSize: +pageSize,
          totalPages,
        },});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred.' });
    }
  }],
  getUserMonthWorkLog: [accessIdSupOrEqualTo(2), async (req: any, res:Response) => {
    try {
      const userId = req.params.id; // Replace with how you identify the user
  
      // Calculate the start and end dates for the last week
      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setHours(0, 0, 0, 0);
      const lastWeekStartDate = new Date(endDate);
      lastWeekStartDate.setDate(lastWeekStartDate.getDate() - 30); // Last week starts 6 days ago
  
      // Query the database for WorkDayLog entries in the last week, excluding Sundays (0) and Saturdays (6)
      const workDayLogs = await DayWorkLog.findAll({
        where: {
          userId: userId,
          date: {
            [Op.between]: [lastWeekStartDate, endDate],
          },
          weekday: {
            [Op.notIn]: [0, 6], // Exclude Sunday and Saturday
          },
        },
      });
  
      const workLogByDate = workDayLogs.reduce((result:any, workLog:any) => {
        // Extract the date (YYYY-MM-DD) from the work log
        const date = workLog.date;
        
        // If the date doesn't exist in the result object, create an entry for it
        if (!result[date]) {
          result[date] = 0;
        }
       
        // Add the work time for the date
        result[date] += workLog.totalWorkTime - (8 * 60 * 60 * 1000);
      
        return result;
      }, {});
  
      res.status(200).json(workLogByDate);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred." });
    }
  }],
};

export default workLogController;
