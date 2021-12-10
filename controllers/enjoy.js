const User = require("../models/User");
const Enjoy = require("../models/Enjoy");
const Bonus1 = require("../models/Bonus1");
const Bonus2 = require("../models/Bonus2");
const MyEnjoy = require("../models/MyEnjoy");
const { generateFloats, sha256 } = require("../functions/game");
const ColorHash = require("../models/ColorHash");
const Profit = require("../models/Profit");
var status = 0;
var d = new Date();
var old_d;
var start_time = d.getTime();
//betters info
//first is level -Linda,..
//second is better list
//
//0 -> user.id
//1 -> budget
//2 -> array, 0~12 betting amount on  colors and numbers
//3 -> array, 0~12 prize amount on colors and numbers
//4 -> total betting amount
//5 -> total prize amount
var bet = [];
//better count
var bet_no = [];
//result
var nonce = 0;
var hash = 0;
var result = [];
var all_log = [];
//total budget
var budget;
//total price
var no = 1;
var log_time;
const rooms = 4;
var auto = false;
for (var i = 0; i < rooms; i++) {
  bet[i] = [];
  bet_no[i] = 0;
  Enjoy.find({ level: i })
    .sort({ _id: -1 })
    .limit(10)
    .then((reviews) => {
      all_log[i] = reviews;
    });
}

var completing = async () => {
  setTimeout(betting, 30000);
  status = 1;
  no++;
  for (var k = 0; k < rooms; k++) {
		if (auto == true) {
			// console.log('sdfsdfsdfsssssssss');
			var number_amounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			var top_budget_num, top_budget;
			for (var i = 0; i < bet_no[k]; i++) {
				for (var l = 0; l < 13; l++) {
					number_amounts[l] += parseInt(bet[k][i][2][l]);
				}
			}
			var tmp_budget, tmp_price, top_profits_arr = [];
			for (i = 0; i < 10; i++) {
				if (i % 5 === 0) {
					tmp_price = Math.floor(number_amounts[i] * 7.82 + number_amounts[12] * 3.41 + number_amounts[11 - (i % 2)] * 0.47);
					tmp_budget = 0;
					for (var l = 0; l < 13; l++)
						tmp_budget += number_amounts[l];
					tmp_budget = Math.floor(tmp_budget - tmp_price - number_amounts[i] - number_amounts[12] - number_amounts[11 - (i % 2)]);
				} else if (i % 2 === 0) {
					tmp_price = Math.floor(number_amounts[i] * 7.82 + number_amounts[11] * 0.96);
					tmp_budget = 0;
					for (l = 0; l < 13; l++)
						tmp_budget += number_amounts[l];
					tmp_budget = Math.floor(tmp_budget - tmp_price - number_amounts[i] - number_amounts[11]);
				} else {
					tmp_price = Math.floor(number_amounts[i] * 7.82 + number_amounts[10] * 0.96);
					tmp_budget = 0;
					for (l = 0; l < 13; l++)
						tmp_budget += number_amounts[l];
					tmp_budget = tmp_budget - tmp_price - number_amounts[i] - number_amounts[10];
				}

				if (top_budget === undefined) {
					top_budget = tmp_budget;
					top_budget_num = i;
					top_profits_arr.push(i);
				} else {
					if (top_budget < tmp_budget) {
						top_budget = tmp_budget;
						top_budget_num = i;
						top_profits_arr = [];
						top_profits_arr.push(i);
					} else if (top_budget == tmp_budget) {
						top_profits_arr.push(i);
					}
				}


			}

			if (top_profits_arr.length > 1) {
				let index = Math.round(top_profits_arr.length * Math.random());
				index = (index == top_profits_arr.length) ? 0 : index;
				result[k] = top_profits_arr[index];
			} else
				result[k] = top_budget_num;
		}


    result[k] = result[k] ? result[k] : 0;
    //each rooms -Linda, sapre, ...
    budget = 0;
    for (var i = 0; i < bet_no[k]; i++) {
      //each betters...
      bet[k][i][3] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      //total contract
      bet[k][i][4] = 0;
      //total price
      bet[k][i][5] = 0;
      for (var color = 0; color < 13; color++) {
        if (bet[k][i][2][color] == 0) continue;
        switch (color) {
          case 10: {
            // console.log("sdfsdf");
            if ([1, 3, 7, 9].find((ele) => ele == result[k])) {
              // bet[k][i][3][color] = parseInt(bet[k][i][2][color] * 1.5 * bet[k][i][6]);
              bet[k][i][3][color] = parseInt(bet[k][i][2][color] * 0.98 * 2);
            } else if (result[k] == 5) {
              // bet[k][i][3][color] = parseInt(bet[k][i][2][color] * 1.2 * bet[k][i][6]);
              bet[k][i][3][color] = parseInt(bet[k][i][2][color] * 0.98 * 1.5);
            }
            // console.log(bet[i]);
            break;
          }
          case 11: {
            if ([2, 4, 6, 8].find((ele) => ele == result[k])) {
              bet[k][i][3][color] = parseInt(
                bet[k][i][2][color] * 0.98*2
              );
            //   bet[k][i][3][color] = parseInt(
            //     bet[k][i][2][color] * 1.5 * bet[k][i][6]
            //   );
            } else if (result[k] == 0) {
              bet[k][i][3][color] = parseInt(
                bet[k][i][2][color] * 0.98*1.5
              );
            //   bet[k][i][3][color] = parseInt(
            //     bet[k][i][2][color] * 1.2 * bet[k][i][6]
            //   );
            }
            break;
          }
          case 12: {
            // console.log(result[k]);
            if (result[k] == 0 || [0, 5].find((ele) => ele == result[k])) {
              // console.log('hi');
              // bet[k][i][3][color] = parseInt(bet[k][i][2][color] * 2 * bet[k][i][6]);
              bet[k][i][3][color] = parseInt(bet[k][i][2][color] * 0.98 * 4.5);
            }
            break;
          }
          default: {
            if (result[k] == color)
              bet[k][i][3][color] = parseInt(bet[k][i][2][color] * 0.98 * 9);
            // bet[k][i][3][color] = parseInt(bet[k][i][2][color] * 4 * bet[k][i][6]);
            break;
          }
        }
        bet[k][i][4] += bet[k][i][2][color];
        bet[k][i][5] += bet[k][i][3][color];
        //MyEnjoy add
        ////////////////////////////////
        const myEnjoy = {};
        myEnjoy.period = log_time;
        myEnjoy.contract = bet[k][i][2][color];
        myEnjoy.select = color;
        myEnjoy.result = result[k] ? result[k] : 0;
        if (!result[k]) {
          console.log("result error!!!!!!!!!!!!");
          console.log(result);
          console.log(result.length);
          console.log(k);
        }
        myEnjoy.amount = bet[k][i][3][color] - bet[k][i][2][color];
        myEnjoy.user = bet[k][i][0];
        myEnjoy.category = k;

        await new MyEnjoy(myEnjoy).save();
        const financial = {};
        financial.type = "Betting";
        financial.amount = bet[k][i][3][color] - bet[k][i][2][color];
        financial.details = {};
        financial.details.period = log_time;
        await User.findByIdAndUpdate(bet[k][i][0], {
          $push: {
            financials: financial,
          },
        });
        //player budget
        /////////////////////////////////////
        //here [0][i][1] added all the betting ...

        bet[0][i][1] += bet[k][i][3][color];
        //Enjoy log
        ////////////////////////////////
        budget = budget - bet[k][i][3][color] + bet[k][i][2][color];
      }
    }
    // Enjoy add
    ////////////////////////
    const enjoy = {};
    let betters = 0;
    let bettersArray = [];
    for (let i = 0; i < bet_no[k]; i++) {
      if (bet[k][i][4] == 0) continue;
      betters++;
      bettersArray.push(bet[k][i]);
    }
    // try {
    // 	if (betters == 0) {
    // 		// console.log("bet 0");
    // 		enjoy.joiner = Math.floor(Math.random() * 15);
    // 		if (enjoy.joiner > 1) {
    // 			// console.log("more than 1");
    // 			enjoy.winner = (1000 + Math.floor(Math.random() * 8999)) + "****" + (10 + Math.floor(Math.random() * 89));
    // 			enjoy.loser = (1000 + Math.floor(Math.random() * 8999)) + "****" + (10 + Math.floor(Math.random() * 89));
    // 			enjoy.winner_amount = (10 + Math.floor(Math.random() * 10) * 10) * 0.98 * 9;
    // 			enjoy.loser_amount = -(10 + Math.floor(Math.random() * 10) * 10);
    // 		} else if (enjoy.joiner == 1) {
    // 			if (Math.floor(Math.random() * 2) == 1) {
    // 				// console.log("winner");
    // 				enjoy.winner = (1000 + Math.floor(Math.random() * 8999)) + "****" + (10 + Math.floor(Math.random() * 89));
    // 				enjoy.loser = "";
    // 				enjoy.winner_amount = (10 + Math.floor(Math.random() * 10) * 10) * 0.98 * 9;
    // 				enjoy.loser_amount = 0;
    // 			} else {
    // 				// console.log("loser");
    // 				enjoy.winner = "";
    // 				enjoy.loser = (1000 + Math.floor(Math.random() * 8999)) + "****" + (10 + Math.floor(Math.random() * 89));
    // 				enjoy.winner_amount = 0;
    // 				enjoy.loser_amount = -(10 + Math.floor(Math.random() * 10) * 10);
    // 			}
    // 		} else {
    // 			// console.log("0");
    // 			enjoy.winner = "";
    // 			enjoy.loser = "";
    // 			enjoy.winner_amount = 0;
    // 			enjoy.loser_amount = 0;
    // 		}
    // 	} else if (betters == 1) {
    // 		// console.log("bet 1");
    // 		enjoy.joiner = 1 + Math.floor(Math.random() * 10) + betters;
    // 		const user = await User.findById(bettersArray[0][0]);
    // 		const tmp_amount = bettersArray[0][5] - bettersArray[0][4];
    // 		if (tmp_amount > 0 && tmp_amount != 0) {
    // 			enjoy.winner = ("" + user.phone).substr(0, 4) + "****" + ("" + user.phone).substr(8, 2);
    // 			enjoy.loser = (1000 + Math.floor(Math.random() * 8999)) + "****" + (10 + Math.floor(Math.random() * 89));
    // 			enjoy.winner_amount = tmp_amount;
    // 			enjoy.loser_amount = -(10 + Math.floor(Math.random() * 10) * 10);
    // 		} else {
    // 			enjoy.loser = ("" + user.phone).substr(0, 4) + "****" + ("" + user.phone).substr(8, 2);
    // 			enjoy.winner = (1000 + Math.floor(Math.random() * 8999)) + "****" + (10 + Math.floor(Math.random() * 89));
    // 			enjoy.loser_amount = tmp_amount;
    // 			enjoy.winner_amount = (10 + Math.floor(Math.random() * 10) * 10) * 0.98 * 9;
    // 		}
    // 	}
    // 	else {
    // 		// console.log("bet more than 2");
    // 		enjoy.joiner = Math.floor(Math.random() * 11) + betters;
    // 		let user = await User.findById(bettersArray[0][0]);
    // 		let max_user = ("" + user.phone).substr(0, 4) + "****" + ("" + user.phone).substr(8, 2);
    // 		let max = bettersArray[0][5] - bettersArray[0][4];
    // 		let min_user = ("" + user.phone).substr(0, 4) + "****" + ("" + user.phone).substr(8, 2);
    // 		let min = bettersArray[0][5] - bettersArray[0][4];
    // 		for (let i = 1; i < betters; i++) {
    // 			if (max < bettersArray[i][5] - bettersArray[i][4]) {
    // 				max = bettersArray[i][5] - bettersArray[i][4];
    // 				user = await User.findById(bettersArray[i][0]);
    // 				max_user = ("" + user.phone).substr(0, 4) + "****" + ("" + user.phone).substr(8, 2);
    // 			}
    // 			if (min < bettersArray[i][5] - bettersArray[i][4]) {
    // 				min = bettersArray[i][5] - bettersArray[i][4];
    // 				user = await User.findById(bettersArray[i][0]);
    // 				min_user = ("" + user.phone).substr(0, 4) + "****" + ("" + user.phone).substr(8, 2);
    // 			}
    // 		}
    // 		enjoy.winner = max_user;
    // 		enjoy.loser = min_user;
    // 		enjoy.winner_amount = max;
    // 		enjoy.loser_amount = min;
    // 	}
    // } catch (err) {
    // 	console.log(err);
    // }

    enjoy.budget = parseFloat(budget.toFixed(2));
    if (!result[k]) {
      console.log("result error in enjoy");
      console.log(result);
      console.log(result.length);
      console.log(k);
      enjoy.recommend = 0;
    } else enjoy.recommend = result[k];

    // enjoy.price = (enjoy.winner_amount + enjoy.loser_amount * 2) * enjoy.joiner / 2;
    enjoy.price = Math.round(Math.random() * 10000);
    // enjoy.price = 01000;
    enjoy.level = k;
    enjoy.createdAt = log_time;
    // console.log('hey! here only once - ' +enjoy.createdAt + " created");
    // console.log(enjoy);
    await new Enjoy(enjoy).save();
    // console.log('hey! here only once - ' +enjoy.createdAt + " done");
  }
  await ColorHash.updateOne({ nonce: nonce }, { used: true });
};
var betting = async () => {
  d = new Date();
  start_time = d.getTime();
  setTimeout(completing, 150000);
  const tmp_profit = {};
  tmp_profit.period = log_time;
  tmp_profit.raffle = "Color";
  tmp_profit.amount = 0;
  for (let ppp = 0; ppp < bet[0].length; ppp++) {
    await User.findByIdAndUpdate(bet[0][ppp][0], {
      $inc: {
        // 'prize': (bet[0][ppp][5] - bet[0][ppp][4] + bet[1][ppp][5] - bet[1][ppp][4] +
        // 	bet[2][ppp][5] - bet[2][ppp][4] + bet[3][ppp][5] - bet[3][ppp][4]),
        budget:
          parseFloat(bet[0][ppp][5]) +
          parseFloat(bet[1][ppp][5]) +
          parseFloat(bet[2][ppp][5]) +
          parseFloat(bet[3][ppp][5]),
      },
    });
    for (let i = 0; i < 4; i++) {
      tmp_profit.amount -= bet[i][ppp][5] - bet[i][ppp][4];
    }
  }
  if (tmp_profit.amount != 0) await new Profit(tmp_profit).save();
  d = d.getFullYear() + "" + (1 + parseInt(d.getMonth())) + d.getUTCDate();
  if (old_d && old_d !== d) {
    no = 1;
  }
  old_d = d;
  if (log_time === undefined) {
    const docs = await Enjoy.find({ createdAt: { $regex: d + ".*" } }).sort({
      createdAt: -1,
    });
    // console.log(err);
    // console.log(docs);
    if (docs.length == 0) {
      log_time = d + "000" + 1;
      no = 1;
    } else {
      const tmp_no = parseInt(docs[0].createdAt.substring(d.length));
      if (tmp_no < 9) log_time = d + "000" + (tmp_no + 1);
      else if (tmp_no < 99) log_time = d + "00" + (tmp_no + 1);
      else if (tmp_no < 999) log_time = d + "0" + (tmp_no + 1);
      else if (tmp_no < 9999) log_time = d + "" + (tmp_no + 1);
      no = tmp_no + 1;
    }
  } else {
    if (no < 10) log_time = d + "000" + no;
    else if (no < 100) log_time = d + "00" + no;
    else if (no < 1000) log_time = d + "0" + no;
    else if (no < 10000) log_time = d + "" + no;
  }
  const lastNo = await ColorHash.find({ used: false })
    .sort({ nonce: 1 })
    .limit(1);
  // console.log(lastNo);
  if (lastNo.length > 0) {
    nonce = lastNo[0].nonce;
    hash = sha256(lastNo[0].hash);
  }
  //generate the tickets with the provably fair seed
  //...........
  const randomNumbers = generateFloats(
    lastNo[0].hash,
    lastNo[0].nonce,
    0,
    rooms
  );
  // console.log(randomNumbers);
  status = 0;
  result = [];
  for (let i = 0; i < rooms; i++) {
    result.push(Math.floor(randomNumbers[i] * 10));

    bet_no[i] = 0;

    bet[i] = [];
  }
  // console.log(result);
};
betting();

exports.getEnjoy = async (req, res, next) => {
  //getInfo
  const user = await User.findById(req.userFromToken._id);
  try {
    var d = new Date();
    var cur_time = d.getTime();
    const level = parseInt(req.params.level);
    if (bet[level].length == 0) {
      for (var i = 0; i < rooms; i++) {
        bet[i][bet_no[i]] = [];
        bet[i][bet_no[i]][0] = req.userFromToken._id;
      }
      const user = await User.findById(req.userFromToken._id);
      if (user) {
        for (var i = 0; i < rooms; i++) {
          bet[i][bet_no[i]][1] = parseFloat(user.budget.toFixed(2));
          bet[i][bet_no[i]][2] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          //each betters...
          bet[i][bet_no[i]][3] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          //total contract
          bet[i][bet_no[i]][4] = 0;

          bet[i][bet_no[i]][5] = 0;
          bet[i][bet_no[i]][6] = 0;
          bet_no[i]++;
        }
        //console.log("budget="+user);

        // console.log(bet[0][1]+bet[0][0]);
        // console.log(bet_no);
        // console.log(bet[bet_no-1]);
        let reviews;
        if (cur_time - start_time > 178000 || cur_time - start_time < 150000) {
          reviews = await Enjoy.find({ level: level })
            .sort({ _id: -1 })
            .limit(10);
        } else {
          reviews = await Enjoy.find({ level: level })
            .sort({ _id: -1 })
            .skip(1)
            .limit(10);
        }
        all_log[level] = reviews;
        const myReview = await MyEnjoy.find({
          $and: [
            { category: level },
            { user: bet[level][bet_no[level] - 1][0] },
          ],
        })
          .sort({ _id: -1 })
          .limit(10);
        const enjoy_count = await Enjoy.countDocuments({ level: level });
        const my_enjoy_count = await MyEnjoy.countDocuments({
          $and: [
            { category: level },
            { user: bet[level][bet_no[level] - 1][0] },
          ],
        });
        var tmp_bet = [];
        tmp_bet[0] = bet[0][bet_no[level] - 1][1];
        tmp_bet[1] = bet[0][bet_no[level] - 1][2];
        return res.status(200).json({
          log_time: log_time,
          time: cur_time - start_time,
          records: all_log[level],
          bet: tmp_bet,
          my_records: myReview,
          records_page: 1,
          last_records_page: Math.ceil(enjoy_count / 10),
          records_my_page: 1,
          last_records_my_page: Math.ceil(my_enjoy_count / 10),
          hash,
          nonce,
          balance: user.budget,
        });
      }
    } else if (
      bet[level].find((ele) => ele[0] == req.userFromToken._id) === undefined
    ) {
      for (var i = 0; i < rooms; i++) {
        bet[i][bet_no[i]] = [];
        bet[i][bet_no[i]][0] = req.userFromToken._id;
      }
      // console.log('prior bet'+bet);

      const user = await User.findById(req.userFromToken._id);
      for (var i = 0; i < rooms; i++) {
        // console.log('after bet[i][bet_no[i]]'+bet[i][bet_no[i]]);
        bet[i][bet_no[i]][1] = parseFloat(user.budget.toFixed(2));
        bet[i][bet_no[i]][2] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        //each betters...
        bet[i][bet_no[i]][3] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        //total contract
        bet[i][bet_no[i]][4] = 0;

        bet[i][bet_no[i]][5] = 0;
        bet[i][bet_no[i]][6] = 0;
        bet_no[i]++;
      }
      //console.log("budget="+user);

      // console.log(bet[0][1]+bet[0][0]);
      // console.log(bet_no);
      // console.log(bet[bet_no-1]);
      let reviews;
      if (cur_time - start_time > 178000 || cur_time - start_time < 150000) {
        reviews = await Enjoy.find({ level: level })
          .sort({ _id: -1 })
          .limit(10);
      } else {
        reviews = await Enjoy.find({ level: level })
          .sort({ _id: -1 })
          .skip(1)
          .limit(10);
      }
      all_log[level] = reviews;
      const myReview = await MyEnjoy.find({
        $and: [{ category: level }, { user: req.userFromToken._id }],
      })
        .sort({ _id: -1 })
        .limit(10);
      // console.log(myReview);
      const enjoy_count = await Enjoy.countDocuments({ level: level });
      const my_enjoy_count = await MyEnjoy.countDocuments({
        $and: [{ category: level }, { user: req.userFromToken._id }],
      });
      // console.log(myReview);
      var tmp_bet = [];
      tmp_bet[0] = bet[0][bet_no[level] - 1][1];
      tmp_bet[1] = bet[0][bet_no[level] - 1][2];

      return res.status(200).json({
        log_time: log_time,
        time: cur_time - start_time,
        records: all_log[level],
        bet: tmp_bet,
        my_records: myReview,
        records_page: 1,
        last_records_page: Math.ceil(enjoy_count / 10),
        records_my_page: 1,
        last_records_my_page: Math.ceil(my_enjoy_count / 10),
        balance: user.budget,
        hash,
        nonce,
      });
    } else {
      if (status == 0) {
        //bettting
        // console.log('0');
        var _bet = bet[level].find((ele) => ele[0] == req.userFromToken._id);
        var _bet_id = bet[level].findIndex(
          (ele) => ele[0] == req.userFromToken._id
        );
        // console.log(bet_no);
        // console.log(bet[bet_no-1]);
        let reviews;
        if (cur_time - start_time > 178000 || cur_time - start_time < 150000) {
          reviews = await Enjoy.find({ level: level })
            .sort({ _id: -1 })
            .limit(10);
        } else {
          reviews = await Enjoy.find({ level: level })
            .sort({ _id: -1 })
            .skip(1)
            .limit(10);
        }
        all_log[level] = reviews;
        const myReview = await MyEnjoy.find({
          $and: [{ category: level }, { user: req.userFromToken._id }],
        })
          .sort({ _id: -1 })
          .limit(10);
        const enjoy_count = await Enjoy.countDocuments({ level: level });
        const my_enjoy_count = await MyEnjoy.countDocuments({
          $and: [{ category: level }, { user: req.userFromToken._id }],
        });
        // console.log(myReview);
        var tmp_bet = [];
        tmp_bet[0] = bet[0][_bet_id][1];
        tmp_bet[1] = bet[level][_bet_id][2];
        return res.status(200).json({
          log_time: log_time,
          time: cur_time - start_time,
          records: all_log[level],
          bet: tmp_bet,
          my_records: myReview,
          records_page: 1,
          last_records_page: Math.ceil(enjoy_count / 10),
          records_my_page: 1,
          last_records_my_page: Math.ceil(my_enjoy_count / 10),
          balance: user.budget,
          hash,
          nonce,
        });
      } else {
        var _bet = bet[level].find((ele) => ele[0] == req.userFromToken._id);
        var _bet_id = bet[level].findIndex(
          (ele) => ele[0] == req.userFromToken._id
        );
        let reviews;
        if (cur_time - start_time > 178000 || cur_time - start_time < 150000) {
          reviews = await Enjoy.find({ level: level })
            .sort({ _id: -1 })
            .limit(10);
        } else {
          reviews = await Enjoy.find({ level: level })
            .sort({ _id: -1 })
            .skip(1)
            .limit(10);
        }

        all_log[level] = reviews;
        const myReview = await MyEnjoy.find({
          $and: [{ category: level }, { user: _bet[0] }],
        })
          .sort({ _id: -1 })
          .limit(10);
        var tmp_contract = [0, 0, 0, 0];
        var tmp_price = [0, 0, 0, 0];
        for (var i = 0; i < rooms; i++) {
          tmp_contract[i] = bet[i][_bet_id][4];
          tmp_price[i] = bet[i][_bet_id][5];
        }
        const enjoy_count = await Enjoy.countDocuments({ level: level });
        const my_enjoy_count = await MyEnjoy.countDocuments({
          $and: [{ category: level }, { user: _bet[0] }],
        });
        var tmp_bet = [];
        // console.log('_bet_id='+_bet_id);
        // console.log(bet[level][_bet_id]);
        tmp_bet[0] = bet[0][_bet_id][1];
        tmp_bet[1] = bet[level][_bet_id][2];
        if (cur_time - start_time > 175000) {
          return res.status(200).json({
            number: result,
            price: tmp_price,
            contract: tmp_contract,
            log_time: log_time,
            time: cur_time - start_time,
            records: all_log[level],
            bet: tmp_bet,
            my_records: myReview,
            records_page: 1,
            last_records_page: Math.ceil(enjoy_count / 10),
            records_my_page: 1,
            last_records_my_page: Math.ceil(my_enjoy_count / 10),
            balance: user.budget,
            hash,
            nonce,
          });
        } else {
          return res.status(200).json({
            price: tmp_price,
            contract: tmp_contract,
            log_time: log_time,
            time: cur_time - start_time,
            records: all_log[level],
            bet: tmp_bet,
            my_records: myReview,
            records_page: 1,
            last_records_page: Math.ceil(enjoy_count / 10),
            records_my_page: 1,
            last_records_my_page: Math.ceil(my_enjoy_count / 10),
            balance: user.budget,
            hash,
            nonce,
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};
exports.postEnjoy = async (req, res, next) => {
  try {
    var d = new Date();
    var cur_time = d.getTime();
    const level = req.body.level;
    if (status == 0) {
      let user = await User.findById(req.userFromToken._id);
      var _bet = bet[level].find((ele) => ele[0] == req.userFromToken._id);
      var _bet_id = bet[level].findIndex(
        (ele) => ele[0] == req.userFromToken._id
      );
      // console.log(bet_no);
      // console.log(bet[bet_no-1]);
      if (!_bet) return res.status(200).json({ error: "unknown user!" });
      const input_contract = Math.abs(parseInt(req.body.contract_money));
      // _bet[2][parseInt(req.body.guess)]=
      if (input_contract < 10) {
        return res
          .status(200)
          .json({ error: "More than ₹ 9 is allowed to bet!" });
      } else if (user.budget - input_contract < 0) {
        return res.status(200).json({ error: "Not enough balance!" });
      }
      if (req.body.guess == 10) {
        if (_bet[2][11] > 0) {
          return res
            .status(200)
            .json({
              error:
                "You are not allowed to bet on Both side in a Single Period.",
            });
        }
      }
      if (req.body.guess == 11) {
        if (_bet[2][10] > 0) {
          return res
            .status(200)
            .json({
              error:
                "You are not allowed to bet on Both side in a Single Period.",
            });
        }
      }
      user = await User.findByIdAndUpdate(
        req.userFromToken._id,
        {
          $inc: {
            budget: -input_contract,
            bets: parseInt(input_contract),
          },
        },
        { new: true }
      );

      //level up
      let levelup = 0;

      // if (user.bets > Number(process.env.LEVEL_6)) {
      //   if (!user.level || user.level < 6) {
      //     const financial = {};
      //     financial.type = "Bonus";
      //     financial.amount = Number(process.env.LEVEL_6_PRIZE);
      //     financial.details = {};
      //     financial.details.level = 6;

      //     const tmp_profit = {};
      //     tmp_profit.period = Date.now();
      //     tmp_profit.raffle = "Bonus";
      //     tmp_profit.amount = -Number(process.env.LEVEL_6_PRIZE);
      //     await new Profit(tmp_profit).save();

      //     user.level = 6;
      //     await user.save();
      //     user = await User.findByIdAndUpdate(
      //       user._id,
      //       {
      //         $inc: {
      //           budget: Number(process.env.LEVEL_6_PRIZE),
      //           withdrawals: Number(process.env.LEVEL_6_PRIZE),
      //         },
      //         $push: {
      //           financials: financial,
      //         },
      //       },
      //       { new: true }
      //     );
      //     levelup = 6;
      //   }
      // } else if (user.bets > Number(process.env.LEVEL_5)) {
      //   if (!user.level || user.level < 5) {
      //     const financial = {};
      //     financial.type = "Bonus";
      //     financial.amount = Number(process.env.LEVEL_5_PRIZE);
      //     financial.details = {};
      //     financial.details.level = 5;

      //     const tmp_profit = {};
      //     tmp_profit.period = Date.now();
      //     tmp_profit.raffle = "Bonus";
      //     tmp_profit.amount = -Number(process.env.LEVEL_5_PRIZE);
      //     await new Profit(tmp_profit).save();

      //     user.level = 5;
      //     await user.save();
      //     user = await User.findByIdAndUpdate(
      //       user._id,
      //       {
      //         $inc: {
      //           budget: Number(process.env.LEVEL_5_PRIZE),
      //           withdrawals: Number(process.env.LEVEL_5_PRIZE),
      //         },
      //         $push: {
      //           financials: financial,
      //         },
      //       },
      //       { new: true }
      //     );
      //     levelup = 5;
      //   }
      // } else if (user.bets > Number(process.env.LEVEL_4)) {
      //   if (!user.level || user.level < 4) {
      //     const financial = {};
      //     financial.type = "Bonus";
      //     financial.amount = Number(process.env.LEVEL_4_PRIZE);
      //     financial.details = {};
      //     financial.details.level = 4;

      //     const tmp_profit = {};
      //     tmp_profit.period = Date.now();
      //     tmp_profit.raffle = "Bonus";
      //     tmp_profit.amount = -Number(process.env.LEVEL_4_PRIZE);
      //     await new Profit(tmp_profit).save();

      //     user.level = 4;
      //     await user.save();
      //     user = await User.findByIdAndUpdate(
      //       user._id,
      //       {
      //         $inc: {
      //           budget: Number(process.env.LEVEL_4_PRIZE),
      //           withdrawals: Number(process.env.LEVEL_4_PRIZE),
      //         },
      //         $push: {
      //           financials: financial,
      //         },
      //       },
      //       { new: true }
      //     );
      //     levelup = 4;
      //   }
      // } else if (user.bets > Number(process.env.LEVEL_3)) {
      //   if (!user.level || user.level < 3) {
      //     const financial = {};
      //     financial.type = "Bonus";
      //     financial.amount = Number(process.env.LEVEL_3_PRIZE);
      //     financial.details = {};
      //     financial.details.level = 3;

      //     const tmp_profit = {};
      //     tmp_profit.period = Date.now();
      //     tmp_profit.raffle = "Bonus";
      //     tmp_profit.amount = -Number(process.env.LEVEL_3_PRIZE);
      //     await new Profit(tmp_profit).save();

      //     user.level = 3;
      //     await user.save();
      //     user = await User.findByIdAndUpdate(
      //       user._id,
      //       {
      //         $inc: {
      //           budget: Number(process.env.LEVEL_3_PRIZE),
      //           withdrawals: Number(process.env.LEVEL_3_PRIZE),
      //         },
      //         $push: {
      //           financials: financial,
      //         },
      //       },
      //       { new: true }
      //     );
      //     levelup = 3;
      //   }
      // } else if (user.bets > Number(process.env.LEVEL_2)) {
      //   if (!user.level || user.level < 2) {
      //     const financial = {};
      //     financial.type = "Bonus";
      //     financial.amount = Number(process.env.LEVEL_2_PRIZE);
      //     financial.details = {};
      //     financial.details.level = 2;

      //     const tmp_profit = {};
      //     tmp_profit.period = Date.now();
      //     tmp_profit.raffle = "Bonus";
      //     tmp_profit.amount = -Number(process.env.LEVEL_2_PRIZE);
      //     await new Profit(tmp_profit).save();

      //     user.level = 2;
      //     await user.save();
      //     user = await User.findByIdAndUpdate(
      //       user._id,
      //       {
      //         $inc: {
      //           budget: Number(process.env.LEVEL_2_PRIZE),
      //           withdrawals: Number(process.env.LEVEL_2_PRIZE),
      //         },
      //         $push: {
      //           financials: financial,
      //         },
      //       },
      //       { new: true }
      //     );
      //     levelup = 2;
      //   }
      // } else {
      //   user.level = 1;
      //   await user.save();
      // }

      bet[0][_bet_id][1] = user.budget;
      _bet[2][parseInt(req.body.guess)] += input_contract;

      if (!user.level || user.level == 1) _bet[6] = 1;
      else if (user.level == 2) _bet[6] = Number(process.env.LEVEL_2_TIMES);
      else if (user.level == 3) _bet[6] = Number(process.env.LEVEL_3_TIMES);
      else if (user.level == 4) _bet[6] = Number(process.env.LEVEL_4_TIMES);
      else if (user.level == 5) _bet[6] = Number(process.env.LEVEL_5_TIMES);
      else if (user.level == 6) _bet[6] = Number(process.env.LEVEL_6_TIMES);

      var tmp = [];
      // const bonus1 = parseInt(input_contract) >= 1000 ? parseInt(input_contract) * 0.003 : parseInt(input_contract) * 0.006;
      // const bonus2 = parseInt(input_contract) >= 1000 ? parseInt(input_contract) * 0.0015 : parseInt(input_contract) * 0.003;
      const bonus1 = parseInt(input_contract) * 0.002;
      const bonus2 = parseInt(input_contract) * 0.001;
      if (user.refer1) {
      	const tmp1 = {};
      	tmp1.better = req.userFromToken._id;
      	tmp1.money = bonus1;
      	tmp1.receiver = user.refer1;
      	await (new Bonus1(tmp1)).save();
      }
      if (user.refer2) {
      	const tmp1 = {};
      	tmp1.better = req.userFromToken._id;
      	tmp1.money = bonus2;
      	tmp1.receiver = user.refer2;
      	await (new Bonus2(tmp1)).save();
      }
      tmp[0] = user.budget;
      tmp[1] = bet[level][_bet_id][2];
      return res.status(200).json({ bet: tmp, levelup });
    } else {
      return res
        .status(200)
        .json({ error: "finished", time: cur_time - start_time });
    }
  } catch (error) {
    next(error);
  }
};
exports.getEnjoyPage = async (req, res, next) => {
  try {
    var d = new Date();
    var cur_time = d.getTime();
    const level = req.params.level;
    const page = req.params.page;
    let reviews, enjoy_count;
    if (cur_time - start_time > 178000 || cur_time - start_time < 150000) {
      reviews = await Enjoy.find({ level: level })
        .sort({ _id: -1 })
        .skip((page - 1) * 10)
        .limit(10);
      enjoy_count = await Enjoy.countDocuments({ level: level });
    } else {
      reviews = await Enjoy.find({ level: level })
        .sort({ _id: -1 })
        .skip((page - 1) * 10 + 1)
        .limit(10);
      enjoy_count = (await Enjoy.countDocuments({ level: level })) - 1;
    }
    return res.status(200).json({
      records: reviews,
      records_page: page,
      last_records_page: Math.ceil(enjoy_count / 10),
    });
  } catch (error) {
    next(error);
  }
};
exports.getEnjoyMyPage = async (req, res, next) => {
  try {
    var d = new Date();
    var cur_time = d.getTime();
    const level = req.params.level;
    const page = req.params.page;
    let reviews, enjoy_count;
    if (cur_time - start_time > 178000 || cur_time - start_time < 150000) {
      reviews = await MyEnjoy.find({
        $and: [{ category: level }, { user: req.userFromToken._id }],
      })
        .sort({ _id: -1 })
        .skip((page - 1) * 10)
        .limit(10);
      enjoy_count = await MyEnjoy.countDocuments({
        $and: [{ category: level }, { user: req.userFromToken._id }],
      });
    } else {
      reviews = await MyEnjoy.find({
        $and: [{ category: level }, { user: req.userFromToken._id }],
      })
        .sort({ _id: -1 })
        .skip(1 + (page - 1) * 10)
        .limit(10);
      enjoy_count =
        (await MyEnjoy.countDocuments({
          $and: [{ category: level }, { user: req.userFromToken._id }],
        })) - 1;
    }
    return res.status(200).json({
      my_records: reviews,
      records_my_page: page,
      last_records_my_page: Math.ceil(enjoy_count / 10),
    });
  } catch (error) {
    next(error);
  }
};

exports.getEnjoyAdmin = async (req, res, next) => {
  const tmp_bets = JSON.parse(JSON.stringify(bet));
  for (let i = 0; i < rooms; i++) {
    for (let k = 0; k < tmp_bets[i].length; k++) {
      tmp_bets[i][k][0] = (await User.findById(tmp_bets[i][k][0])).phone;
    }
  }
  try {
    if (req.params.level == 4) {
      var d = new Date();
      var cur_time = d.getTime();
      res.status(200).json({
        log_time: log_time,
        time: cur_time - start_time,
        bet: tmp_bets,
        auto: auto,
        number: result,
        hash,
        nonce,
      });
    } else {
      const level = req.params.level;
      var d = new Date();
      var cur_time = d.getTime();
      res.status(200).json({
        log_time: log_time,
        time: cur_time - start_time,
        bet: tmp_bets[level],
        auto: auto,
        number: result[level],
        hash,
        nonce,
      });
    }
  } catch (error) {
    next(error);
  }
};
exports.postEnjoyAdminAuto = (req, res, next) => {
	auto = req.body.auto;
	// console.log(auto);
	res.status(200).json({ message: "ok" });
};