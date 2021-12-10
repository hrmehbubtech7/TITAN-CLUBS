const User = require("../models/User");
const WeekBet = require('../models/WeekBet');
const WeekResult = require('../models/WeekResult');
const WeekTicket = require('../models/WeekTicket');
const WeekHash = require('../models/WeekHash');
const Profit = require("../models/Profit");
const { generateFloats, sha256 } = require('../functions/game');
const total_time = 3600 * 24 * 7 * 1000;
const finishing_time = 30000;
var d = new Date();
var start_time = d.getTime();
var period = 0;
var hash = "";
const total_tickets = 10000;
const total_win_tickets = Number(process.env.WEEKLY_1_COUNT) + Number(process.env.WEEKLY_2_COUNT) + Number(process.env.WEEKLY_3_COUNT) + Number(process.env.WEEKLY_4_COUNT) + Number(process.env.WEEKLY_5_COUNT) + Number(process.env.WEEKLY_6_COUNT) + Number(process.env.WEEKLY_7_COUNT);

const finishing_period = async () => {
	setTimeout(betting_period, finishing_time);
	let bets = await WeekBet.find({});
	if (bets.length > 0) {
		const tmp_profits = {};
		tmp_profits.period = bets[0].no;
		tmp_profits.raffle = "Weekly";
		tmp_profits.amount = 0;

		for (let bet of bets) {
			tmp_profits.amount += Number(process.env.WEEKLY_PRICE);
			const place = await WeekTicket.find({ ticket: bet.ticket });
			const financial = {};
			financial.type = "Weekly";
			financial.amount = -Number(process.env.WEEKLY_PRICE);
			financial.details = {};
			financial.details.period = bet.no;
			financial.details.place = 0;
			financial.details.ticket = bet.ticket;
			if (place.length > 0) {
				tmp_profits.amount -= Number(place[0].prize);
				financial.amount += Number(place[0].prize);
				financial.details.place = place[0].place;
			}
			let user = await User.findByIdAndUpdate(bet.userid,
				{
					$push: { financials: financial }
				}, { new: true });

			//level up
			let levelup = 0;

			if (user.bets > Number(process.env.LEVEL_6)) {
				if (!user.level || user.level < 6) {
					const financial = {};
					financial.type = "Bonus";
					financial.amount = Number(process.env.LEVEL_6_PRIZE);
					financial.details = {};
					financial.details.level = 6;

					const tmp_profit = {};
					tmp_profit.period = Date.now();
					tmp_profit.raffle = "Bonus";
					tmp_profit.amount = -Number(process.env.LEVEL_6_PRIZE);
					await (new Profit(tmp_profit)).save();

					user.level = 6;
					await user.save();
					user = await User.findByIdAndUpdate(bet.userid, {
						$inc: {
							budget: Number(process.env.LEVEL_6_PRIZE),
							withdrawals: Number(process.env.LEVEL_6_PRIZE)
						},
						$push: {
							'financials': financial
						}
					}, { new: true });
					levelup = 6;
				}
			} else if (user.bets > Number(process.env.LEVEL_5)) {
				if (!user.level || user.level < 5) {
					const financial = {};
					financial.type = "Bonus";
					financial.amount = Number(process.env.LEVEL_5_PRIZE);
					financial.details = {};
					financial.details.level = 5;

					const tmp_profit = {};
					tmp_profit.period = Date.now();
					tmp_profit.raffle = "Bonus";
					tmp_profit.amount = -Number(process.env.LEVEL_5_PRIZE);
					await (new Profit(tmp_profit)).save();

					user.level = 5;
					await user.save();
					user = await User.findByIdAndUpdate(bet.userid, {
						$inc: {
							budget: Number(process.env.LEVEL_5_PRIZE),
							withdrawals: Number(process.env.LEVEL_5_PRIZE)
						},
						$push: {
							'financials': financial
						}
					}, { new: true });
					levelup = 5;
				}
			} else if (user.bets > Number(process.env.LEVEL_4)) {
				if (!user.level || user.level < 4) {
					const financial = {};
					financial.type = "Bonus";
					financial.amount = Number(process.env.LEVEL_4_PRIZE);
					financial.details = {};
					financial.details.level = 4;

					const tmp_profit = {};
					tmp_profit.period = Date.now();
					tmp_profit.raffle = "Bonus";
					tmp_profit.amount = -Number(process.env.LEVEL_4_PRIZE);
					await (new Profit(tmp_profit)).save();

					user.level = 4;
					await user.save();
					user = await User.findByIdAndUpdate(bet.userid, {
						$inc: {
							budget: Number(process.env.LEVEL_4_PRIZE),
							withdrawals: Number(process.env.LEVEL_4_PRIZE)
						},
						$push: {
							'financials': financial
						}
					}, { new: true });
					levelup = 4;
				}
			} else if (user.bets > Number(process.env.LEVEL_3)) {
				if (!user.level || user.level < 3) {
					const financial = {};
					financial.type = "Bonus";
					financial.amount = Number(process.env.LEVEL_3_PRIZE);
					financial.details = {};
					financial.details.level = 3;

					const tmp_profit = {};
					tmp_profit.period = Date.now();
					tmp_profit.raffle = "Bonus";
					tmp_profit.amount = -Number(process.env.LEVEL_3_PRIZE);
					await (new Profit(tmp_profit)).save();

					user.level = 3;
					await user.save();
					user = await User.findByIdAndUpdate(bet.userid, {
						$inc: {
							budget: Number(process.env.LEVEL_3_PRIZE),
							withdrawals: Number(process.env.LEVEL_3_PRIZE)
						},
						$push: {
							'financials': financial
						}
					}, { new: true });
					levelup = 3;
				}
			} else if (user.bets > Number(process.env.LEVEL_2)) {
				if (!user.level || user.level < 2) {
					const financial = {};
					financial.type = "Bonus";
					financial.amount = Number(process.env.LEVEL_2_PRIZE);
					financial.details = {};
					financial.details.level = 2;

					const tmp_profit = {};
					tmp_profit.period = Date.now();
					tmp_profit.raffle = "Bonus";
					tmp_profit.amount = -Number(process.env.LEVEL_2_PRIZE);
					await (new Profit(tmp_profit)).save();

					user.level = 2;
					await user.save();
					user = await User.findByIdAndUpdate(bet.userid, {
						$inc: {
							budget: Number(process.env.LEVEL_2_PRIZE),
							withdrawals: Number(process.env.LEVEL_2_PRIZE)
						},
						$push: {
							'financials': financial
						}
					}, { new: true });
					levelup = 2;
				}

			} else {
				user.level = 1;
				await user.save();
			}

			if (place.length > 0) {
				await User.findByIdAndUpdate(bet.userid, {
					$inc: {
						'budget': Number(place[0].prize),
						'prize': Number(place[0].prize) - Number(process.env.WEEKLY_PRICE)
					}
				});
			}
		}
		if (tmp_profits.amount != 0)
			await (new Profit(tmp_profits)).save();

	}
	const places = await WeekTicket.find({});
	for (let place of places) {
		const tmp_result = {};
		tmp_result.place = place.place;
		tmp_result.ticket = place.ticket;
		tmp_result.prize = place.prize;
		tmp_result.no = place.no;
		bets = await WeekBet.find({ ticket: place.ticket });
		if (bets.length > 0) {
			tmp_result.userid = bets[0].userid;
		}
		await (new WeekResult(tmp_result)).save();
	}
	await WeekHash.updateOne({ nonce: period }, { used: true });
	await WeekBet.deleteMany({});
	await WeekTicket.deleteMany();
};
const betting_period = async () => {
	setTimeout(finishing_period, total_time - finishing_time);
	d = new Date();
	start_time = d.getTime();
	const priorBets = await WeekBet.find({});
	for (let i = 0; i < priorBets.length; i++) {
		await User.findByIdAndUpdate(priorBets[i].userid, {
			$inc: {
				'budget': Number(process.env.WEEKLY_PRICE),
				'bets': -Number(process.env.WEEKLY_PRICE)
			}
		});
	}
	await WeekBet.deleteMany({});
	await WeekTicket.deleteMany({});
	const lastNo = await WeekHash.find({ used: false }).sort({ 'nonce': 1 }).limit(1);
	period = lastNo[0].nonce;
	hash = sha256(lastNo[0].hash);
	//generate the tickets with the provably fair seed
	//...........
	const randomNumbers = generateFloats(lastNo[0].hash, lastNo[0].nonce, 0, total_win_tickets);
	// console.log(randomNumbers);
	const tmp_tickets = [];
	for (let i = 0; i < total_tickets; i++) {
		tmp_tickets.push(i);
	}
	let tmp_i = 0;
	let tmp_no;
	for (let i = 0; i < Number(process.env.WEEKLY_1_COUNT); i++) {
		tmp_no = Math.floor(randomNumbers[tmp_i] * tmp_tickets.length);
		await WeekTicket.create({
			no: period,
			ticket: tmp_tickets[tmp_no],
			place: 1,
			prize: Number(process.env.WEEKLY_1_PRIZE)
		});
		tmp_tickets.splice(tmp_no, 1);
		tmp_i++;
	}
	for (let i = 0; i < Number(process.env.WEEKLY_2_COUNT); i++) {
		tmp_no = Math.floor(randomNumbers[tmp_i] * tmp_tickets.length);
		await WeekTicket.create({
			no: period,
			ticket: tmp_tickets[tmp_no],
			place: 2,
			prize: Number(process.env.WEEKLY_2_PRIZE)
		});
		tmp_tickets.splice(tmp_no, 1);
		tmp_i++;
	}
	for (let i = 0; i < Number(process.env.WEEKLY_3_COUNT); i++) {
		tmp_no = Math.floor(randomNumbers[tmp_i] * tmp_tickets.length);
		await WeekTicket.create({
			no: period,
			ticket: tmp_tickets[tmp_no],
			place: 3,
			prize: Number(process.env.WEEKLY_3_PRIZE)
		});
		tmp_tickets.splice(tmp_no, 1);
		tmp_i++;
	}
	for (let i = 0; i < Number(process.env.WEEKLY_4_COUNT); i++) {
		tmp_no = Math.floor(randomNumbers[tmp_i] * tmp_tickets.length);
		await WeekTicket.create({
			no: period,
			ticket: tmp_tickets[tmp_no],
			place: 4,
			prize: Number(process.env.WEEKLY_4_PRIZE)
		});
		tmp_tickets.splice(tmp_no, 1);
		tmp_i++;
	}
	for (let i = 0; i < Number(process.env.WEEKLY_5_COUNT); i++) {
		tmp_no = Math.floor(randomNumbers[tmp_i] * tmp_tickets.length);
		await WeekTicket.create({
			no: period,
			ticket: tmp_tickets[tmp_no],
			place: 5,
			prize: Number(process.env.WEEKLY_5_PRIZE)
		});
		tmp_tickets.splice(tmp_no, 1);
		tmp_i++;
	}
	for (let i = 0; i < Number(process.env.WEEKLY_6_COUNT); i++) {
		tmp_no = Math.floor(randomNumbers[tmp_i] * tmp_tickets.length);
		await WeekTicket.create({
			no: period,
			ticket: tmp_tickets[tmp_no],
			place: 6,
			prize: Number(process.env.WEEKLY_6_PRIZE)
		});
		tmp_tickets.splice(tmp_no, 1);
		tmp_i++;
	}
	for (let i = 0; i < Number(process.env.WEEKLY_7_COUNT); i++) {
		tmp_no = Math.floor(randomNumbers[tmp_i] * tmp_tickets.length);
		await WeekTicket.create({
			no: period,
			ticket: tmp_tickets[tmp_no],
			place: 7,
			prize: Number(process.env.WEEKLY_7_PRIZE)
		});
		tmp_tickets.splice(tmp_no, 1);
		tmp_i++;
	}
};
betting_period();







exports.getRaffle = async (req, res, next) => {
	try {
		const soldTickets = await WeekBet.find({}).populate('userid');
		const user = await User.findById(req.userFromToken._id);
		var d = new Date();
		var cur_time = d.getTime();
		return res.status(200).json({
			time: (total_time - (cur_time - start_time)) / 1000,
			soldTickets, period, hash,
			wallet: user.budget
		});
	} catch (err) {
		next(err);
	}
};
exports.postRaffle = async (req, res, next) => {
	try {
		var d = new Date();
		var cur_time = d.getTime();
		if (total_time - (cur_time - start_time) < finishing_time) {
			return res.status(400).json({ time: (total_time - (cur_time - start_time)) / 1000, message: "Wait to start the next round!" });
		}
		const ticket = Number(req.body.fourth + "" + req.body.third + "" + req.body.second + "" + req.body.first);
		const isExisted = await WeekBet.countDocuments({ ticket: ticket });
		if (isExisted > 0) {
			return res.status(400).json({ time: (total_time - (cur_time - start_time)) / 1000, message: "The ticket is already sold out!" });
		}

		let user = await User.findById(req.userFromToken._id);
		if (Number(user.budget) < Number(process.env.WEEKLY_PRICE)) {
			return res.status(400).json({ time: (total_time - (cur_time - start_time)) / 1000, message: "Not enough balance in your wallet!" });
		}
		user = await User.findByIdAndUpdate(req.userFromToken._id,
			{
				$inc: {
					'budget': -Number(process.env.WEEKLY_PRICE),
					'bets': Number(process.env.WEEKLY_PRICE)
				}
			}, { new: true });
		const current = await WeekTicket.findOne({});
		const tmp = {};
		tmp.userid = user._id;
		tmp.ticket = ticket;
		tmp.no = period;
		await (new WeekBet(tmp)).save();
		const soldTickets = await WeekBet.find({}).populate('userid');
		return res.status(200).json({
			time: (total_time - (cur_time - start_time)) / 1000,
			soldTickets, period, hash,
			wallet: user.budget
		});
	}
	catch (err) {
		// console.log(err);
		next(err);
	}
};


