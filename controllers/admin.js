const User = require("../models/User");
const Visited=require("../models/Visited");
const MyEnjoy=require("../models/MyEnjoy");
const Reward=require("../models/Reward");
const Recharge = require("../models/Recharge");
const Withdrawl=require('../models/Withdrawl');
const Toss=require('../models/Toss');
const WeekResult = require("../models/WeekResult");
const DayResult = require("../models/DayResult");
const HourResult = require("../models/HourResult");
const Review = require("../models/Review");

const WeekBet = require("../models/WeekBet");
const DayBet = require("../models/DayBet");
const HourBet = require("../models/HourBet");

const WeekTicket = require("../models/WeekTicket");
const DayTicket = require("../models/DayTicket");
const HourTicket = require("../models/HourTicket");
exports.getTotal =async (req, res, next) => {
    const visits=await Visited.countDocuments({});
    const users=await User.countDocuments({});
    let revenue=await MyEnjoy.find();
    let revenue1=await Toss.find();
    revenue1=revenue1.reduce((all, ele) => all + parseFloat(ele.profit), 0);
    revenue1=-revenue1.toFixed(2)
    revenue=revenue.reduce((all, ele) => all + parseFloat(ele.amount), 0);
    revenue=-revenue.toFixed(2)+revenue1;
    let rewards=await Reward.find({status:true});
    rewards=rewards.reduce((all, ele) => all + parseFloat(ele.money), 0).toFixed(2);
    return res.status(200).json({visits, users, revenue, rewards});
};
exports.getRevenue =async (req, res, next) => {
    let fromDate=new Date(req.params.from);
    const toDate=new Date(req.params.to);
    const dates=Math.ceil((toDate-fromDate)/(3600000*24));
    const data=[];
    for(let i=0;i<=dates;i++){
        const dateString=""+fromDate.getFullYear()+(fromDate.getMonth()+1)+fromDate.getDate();
        // console.log(dateString);
        const revenue=await MyEnjoy.find({period:{$gte:parseInt(dateString)*10000,$lte:parseInt(dateString)*10000+9999}});
        data.push(-revenue.reduce((all, ele) => all + parseFloat(ele.amount), 0));
        fromDate.setDate(fromDate.getDate()+1);
    }    
    return res.json(data);
};
exports.getRevenue1 =async (req, res, next) => {
    let fromDate=new Date(req.params.from);
    const toDate=new Date(req.params.to);
    const dates=Math.ceil((toDate-fromDate)/(3600000*24));
    const data=[];
    for(let i=0;i<=dates;i++){
        const nextDate=new Date(fromDate);
        nextDate.setDate(nextDate.getDate()+1);
        // console.log(nextDate);
        const revenue=await Toss.find({createdAt:{$lt:nextDate,$gte:fromDate}});
        data.push(-revenue.reduce((all, ele) => all + parseFloat(ele.profit), 0));
        fromDate.setDate(fromDate.getDate()+1);
    }    
    return res.json(data);
};
exports.getVisit =async (req, res, next) => {
    let fromDate=new Date(req.params.from);
    const toDate=new Date(req.params.to);
    const dates=Math.ceil((toDate-fromDate)/(3600000*24));
    const visits=[];
    const users=[];
    for(let i=0;i<=dates;i++){
        const nextDate=new Date(fromDate);
        nextDate.setDate(nextDate.getDate()+1);
        // console.log(nextDate);
        const visit=await Visited.countDocuments({createdAt:{$lt:nextDate,$gte:fromDate}});
        const user=await User.countDocuments({createdAt:{$lt:nextDate,$gte:fromDate}});
        visits.push(visit);
        users.push(user);
        fromDate.setDate(fromDate.getDate()+1);
    }    
    return res.json({visits, users});
};
exports.getRWS =async (req, res, next) => {
    let fromDate=new Date(req.params.from);
    const toDate=new Date(req.params.to);
    const dates=Math.ceil((toDate-fromDate)/(3600000*24));
    const rewards=[];
    const recharges=[];
    const withdrawals=[];
    for(let i=0;i<=dates;i++){
        const nextDate=new Date(fromDate);
        nextDate.setDate(nextDate.getDate()+1);
        // console.log(nextDate);
        const reward=await Reward.find({createdAt:{$lt:nextDate,$gte:fromDate},status:true});
        const recharge=await Recharge.find({createdAt:{$lt:nextDate,$gte:fromDate},status:1});
        const withdrawal=await Withdrawl.find({createdAt:{$lt:nextDate,$gte:fromDate},status:1});
        rewards.push(reward.reduce((all, ele) => all + parseFloat(ele.money), 0).toFixed(2));
        recharges.push(recharge.reduce((all, ele) => all + parseFloat(ele.money), 0).toFixed(2));
        withdrawals.push(withdrawal.reduce((all, ele) => all + parseFloat(ele.money), 0).toFixed(2));
        fromDate.setDate(fromDate.getDate()+1);
    }    
    return res.json({rewards, recharges, withdrawals});
};

exports.getRaffles=async (req, res, next)=>{
    try{
        const hourlyBets=await HourBet.find({}).populate('userid');
        const dailyBets=await DayBet.find({}).populate('userid');
        const weeklyBets=await WeekBet.find({}).populate('userid');
        const hourlyTickets=await HourTicket.find({});
        const dailyTickets=await DayTicket.find({});
        const weeklyTickets=await WeekTicket.find({});
        return res.status(200).json({
            hourlyBets, dailyBets, weeklyBets, hourlyTickets, dailyTickets, weeklyTickets
        });
    }catch (error) {
        // console.log(error);
        next(error);
    }
}
exports.postReview = async (req, res, next) => {
    const user = await User.findById(req.userFromToken._id);
    if (user.bets.btc + user.bets.doge + user.bets.eth + user.bets.ltc < 10000) {
        return res.status(400).json({ message: 'You are not allowed to leave a feedback! Who bets more than 10000 can leave a feedback.' });
    }
    if (user.feedback != '') {
        return res.status(400).json({ message: 'You left a feedback already!' });
    }
    const tmp = {};
    tmp.userid = req.userFromToken._id;
    tmp.content = req.body.feedback;
    await (new Review(tmp)).save();
    user.feedback = req.body.feedback;
    await user.save();
    return res.status(200).json({ message: 'Successfully posted!' });
};
exports.getRecords = async (req, res, next) => {
    //Game Records 
    try {
        const user = await User.findById(req.userFromToken._id);
        const page = req.params.page;
        if (req.params.game == 'weekly') {
            const records = await WeekResult.find({ no: page }).populate('userid');
            const last = await WeekResult.aggregate([
                { $match: {} },
                {
                    $group:
                    {
                        _id: "$no",
                        count: { $sum: 1 }
                    }
                }]);
            return res.status(200).json({
                records: records,
                page: req.params.page,
                last: last.length
            });
        } else if (req.params.game == "daily") {
            const records = await DayResult.find({ no: page }).populate('userid');
            const last = await DayResult.aggregate([
                { $match: {} },
                {
                    $group:
                    {
                        _id: "$no",
                        count: { $sum: 1 }
                    }
                }]);
            return res.status(200).json({
                records: records,
                page: req.params.page,
                last: last.length
            });
        } else {
            const records = await HourResult.find({ no: page }).populate('userid');
            const last = await HourResult.aggregate([
                { $match: {} },
                {
                    $group:
                    {
                        _id: "$no",
                        count: { $sum: 1 }
                    }
                }]);
            return res.status(200).json({
                records: records,
                page: req.params.page,
                last: last.length
            });
        }

    } catch (error) {
        // console.log(error);
        next(error);
    }
}
