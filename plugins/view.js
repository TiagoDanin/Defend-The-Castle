const stringify = require('json-stringify-safe')
const base = async (ctx) => {
	if (ctx.privilege <= 2) {
		return
	}
	const id = ctx.update.message.reply_to_message.from.id || ctx.update.message.reply_to_message.forward_from.id
	ctx.from.id = id
	ctx.db = await ctx.userInfo(ctx)
	ctx.replyWithHTML(`
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level+1 >= ctx.db.maxLevel ? `${ctx.db.level} (MAX)` : `${ctx.db.level} (${ctx.db.levelPoc}%)`}
<b>🎖 Experience:</b> ${ctx.db.xp}
<b>💰 Money:</b> ${ctx.db.money} (${ctx.db.moneyPerHour}/hour)
<b>💎 Diamonds:</b> ${ctx.db.diamond}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}

<b>City:</b> ${ctx.db.city.join(', ')}
<b>Inventory:</b> ${ctx.db.inventory.join(', ')}
	`)
	ctx.telegram.sendDocument(
		ctx.config.ids.log,
		{
			filename: `${id}.USER.JSON`,
			source: Buffer.from(stringify(
				await ctx.database.findAllTable('stats')
			), 'utf8')
		}
	)
	return
}

module.exports = {
	id: 'add',
	plugin: base,
	regex: [
		/^\/view/i
	]
}
