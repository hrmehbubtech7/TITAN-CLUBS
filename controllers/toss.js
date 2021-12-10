const User = require("../models/User");
const Bonus1 = require("../models/Bonus1");
const Bonus2 = require("../models/Bonus2");
const TossSeed = require('../models/TossSeed');
const { generateFloats, generateServerSeed, sha512, sha256 } = require('../functions/game');
const Profit = require("../models/Profit");
const Toss = require('../models/Toss');
exports.getToss = async (req, res, next) => {
	const user = await User.findById(req.userFromToken._id);
	await TossSeed.deleteMany({ user: user._id });
	const tmp = {};
	tmp.user = user._id;
	tmp.seed = generateServerSeed();
	const toss = await (new TossSeed(tmp)).save();
	return res.status(200).json({
		heads_count: user.heads,
		tails_count: user.tails,
		hash: sha256(toss.seed),
		wallet: user.budget.toFixed(0)
	});


};
exports.postToss = async (req, res, next) => {
	try {
		let user = await User.findById(req.userFromToken._id);
		let tossSeed = await TossSeed.findOne({ user: user._id });
		const server_seed = tossSeed.seed;

		const heads = Math.abs(parseInt(req.body.heads));
		const tails = Math.abs(parseInt(req.body.tails));

		const result = Math.round(generateFloats(server_seed, (user.heads + user.tails), 0, 1));
		if (heads + tails > user.budget)
			return res.status(200).json({ 'error': "Not enough balance!" });
		if (heads + tails < 10)
			return res.status(200).json({ 'error': `More than ₹ 10 are allowed to bet!` });


		let profit;
		if (!user.level || user.level == 1)
			profit = result == 0 ? heads * 0.3 - tails : tails * 0.3 - heads;
		else if (user.level == 2)
			profit = result == 0 ? heads * 0.3 * Number(process.env.LEVEL_2_TIMES) - tails : tails * 0.3 * Number(process.env.LEVEL_2_TIMES) - heads;
		else if (user.level == 3)
			profit = result == 0 ? heads * 0.3 * Number(process.env.LEVEL_3_TIMES) - tails : tails * 0.3 * Number(process.env.LEVEL_3_TIMES) - heads;
		else if (user.level == 4)
			profit = result == 0 ? heads * 0.3 * Number(process.env.LEVEL_4_TIMES) - tails : tails * 0.3 * Number(process.env.LEVEL_4_TIMES) - heads;
		else if (user.level == 5)
			profit = result == 0 ? heads * 0.3 * Number(process.env.LEVEL_5_TIMES) - tails : tails * 0.3 * Number(process.env.LEVEL_5_TIMES) - heads;
		else if (user.level == 6)
			profit = result == 0 ? heads * 0.3 * Number(process.env.LEVEL_6_TIMES) - tails : tails * 0.3 * Number(process.env.LEVEL_6_TIMES) - heads;
		profit=Math.round(profit);


		const toss = new Toss();
		toss.userid = user._id;
		toss.phone = user.phone;
		toss.bet = heads + tails;
		toss.profit = profit;
		await toss.save();

		const financial = {};
		financial.type = "Toss";
		financial.amount = profit;
		financial.details = {};
		financial.details.period = Date.now();
		const tmp_profit = {};
		tmp_profit.period = Date.now();
		tmp_profit.raffle = "Toss";
		tmp_profit.amount = -profit;
		await (new Profit(tmp_profit)).save();
		if (result == 0) {
			user = await User.findByIdAndUpdate(req.userFromToken._id, {
				'$inc': {
					'heads': 1,
					'budget': profit,
					'bets': tails + heads,
					'prize': profit
				},
				'$push': {
					'financials': financial
				}
			}, { new: true });
		} else {
			user = await User.findByIdAndUpdate(req.userFromToken._id, {
				'$inc': {
					'tails': 1,
					'budget': profit,
					'bets': tails + heads,
					'prize': profit
				},
				'$push': {
					'financials': financial
				}
			}, { new: true });
		}

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
				user = await User.findByIdAndUpdate(user._id, {
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
				user = await User.findByIdAndUpdate(user._id, {
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
				user = await User.findByIdAndUpdate(user._id, {
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
				user = await User.findByIdAndUpdate(user._id, {
					'$inc': {
						budget: Number(process.env.LEVEL_3_PRIZE),
						withdrawals: Number(process.env.LEVEL_3_PRIZE)
					},
					'$push': {
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
				user = await User.findByIdAndUpdate(user._id, {
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

		await TossSeed.deleteMany({ user: user._id });
		const tmp = {};
		tmp.user = user._id;
		tmp.seed = generateServerSeed();
		tossSeed = await (new TossSeed(tmp)).save();
		return res.status(200).json({
			server_seed, hash: sha256(tossSeed.seed), levelup,
			heads_count: user.heads, tails_count: user.tails, profit, result, wallet: user.budget
		});
	} catch (error) {
		console.log(error)
		next(error);
	}

};



