import { Request, Response } from 'express';
const WorkLog = require("../models/WorkLog")
const DayWorkLog = require("../models/DayWorkLog")

const workLogController = {
  createWorkLog: async (req:any, res:any) => {
    try {
      const userId: number = req.user._id; // Replace with how you identify the user
      // Check if a dayWorkLog exists for today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let dayWorkLog = await DayWorkLog.findOne({
        where: { userId: userId, date: today },
      });
      
      if (!dayWorkLog) {
        // Create a new dayWorkLog if it doesn't exist
        dayWorkLog = await DayWorkLog.create({userId, date: today });
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
const timeDifference = endTime.getTime() - startTimeDate.getTime() - 3600000;
console.log(timeDifference)

// Update the open workLog with endTime (clock-out)
await openWorkLog.update({ endTime });

// Increment the totalWorkTime in dayWorkLog
console.log(dayWorkLog.totalWorkTime);
const newTotalWorkTime = dayWorkLog.totalWorkTime + timeDifference;
console.log(newTotalWorkTime)
await dayWorkLog.update({ totalWorkTime: newTotalWorkTime });
} else {
  // Create a new workLog with startTime (clock-in)
  await WorkLog.create({ dayWorkLogId: dayWorkLog.id, startTime: new Date() });
}

res.status(200).json({ message: "Clock-in/clock-out successful." });
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: "An error occurred." });
}
},
getWorkClockStatus: async (req: any, res: Response) => {
  try {
    const userId: number = req.user._id; // Replace with how you identify the user

    // Find the last dayWorkLog for the user
    const lastDayWorkLog = await DayWorkLog.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!lastDayWorkLog) {
      // If no dayWorkLog is found, it's not created
      res.status(200).json({ status: "not_created" });
      return; // Exit the function
    }

    // Find the associated workLog for the last dayWorkLog
    const lastWorkLog = await WorkLog.findOne({
      where: { dayWorkLogId: lastDayWorkLog.id },
      order: [["createdAt", "DESC"]],
    });

    if (!lastWorkLog) {
      // If no workLog is found for the dayWorkLog, it's not created
      res.status(200).json({ status: "not_created" });
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
},
getDayWorkLog: async (req: any, res: Response) => {
  try {
    const userId: number = req.user._id; // Replace with how you identify the user

    // Find the current dayWorkLog for the user (today's date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDayWorkLog = await DayWorkLog.findOne({
      where: { userId, date: today },
      include: WorkLog, // Include associated WorkLog records
    });

    if (!currentDayWorkLog) {
      // If no current dayWorkLog is found, create one
      currentDayWorkLog = await DayWorkLog.create({ userId, date: today });
    }

    // The associated workLogs are already included in currentDayWorkLog

    // Return the current dayWorkLog and its associated workLogs
    res.status(200).json(currentDayWorkLog);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
},
  updateAccessLevel: async (req: Request, res: Response) => {
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

  getAccessLevelById: async (req: Request, res: Response) => {
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

  deleteAccessLevel: async (req: Request, res: Response) => {
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

export default workLogController;
