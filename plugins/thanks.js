const base = async ctx => {
	if (ctx.privilege <= 6) {
		return
	}

	let id = 0
	id = ctx.match[5] ? ctx.match[5] : ctx.update.message.reply_to_message.from.id || ctx.update.message.reply_to_message.forward_from.id

	const play = await ctx.database.getUser(id)
	if (play && id) {
		const user = {
			from: {
				id
			},
			db: play
		}
		user.db.old = {...user.db}
		if (ctx.match[1] == 'thanks') {
			user.db.xp += 1200
			user.db.money += 5000
			user.db.inventory.push('11')
			ctx.replyWithHTML(`
<b>Thanks!</b>
+ 1200 XP
+ 5000 Money
+ 1 Diamond
			`)
		} else {
			for (let i = 0; i < Number(ctx.match[4]); i++) {
				if (ctx.match[2] == 'inventory') {
					user.db.inventory.push(Number(ctx.match[3]))
				} else {
					user.db[ctx.match[2]] += Number(ctx.match[3])
				}
			}

			ctx.replyWithHTML(`<b>ADD:</b> ${ctx.match[2]} += ${ctx.match[3]} * ${ctx.match[4]}`)
		}

		await ctx.database.saveUser(user)
	}
}

module.exports = {
	id: 'add',
	plugin: base,
	regex: [
		/^\/(thanks)/i,
		/^\/(add) (\w*) (\d*) (\d*)$/i,
		/^\/(add) (\w*) (\d*) (\d*) (\d*)/i
	]
}
