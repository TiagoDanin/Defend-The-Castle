const stringify = require('json-stringify-safe')

const base = async ctx => {
	if (ctx.privilege <= 2) {
		return
	}

	if (!ctx.update.message.reply_to_message.forward_from) {
		ctx.update.message.reply_to_message.forward_from = {}
	}

	const id = ctx.update.message.reply_to_message.forward_from.id || ctx.update.message.reply_to_message.from.id
	ctx.from.id = id
	ctx.db = await ctx.userInfo(ctx)
	console.log(ctx.db)
	ctx.replyWithHTML(`
<b>Telegram: @${ctx.db.cache.tgusername} - ${ctx.db.cache.tgname}</b>
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level + 1 >= ctx.db.maxLevel ? `${ctx.db.level} (MAX)` : `${ctx.db.level} (${ctx.db.levelPoc}%)`}
<b>🎖 Experience:</b> ${ctx.db.xp}
<b>📝 Badges:</b> ${ctx.badges(ctx.from.id).map(element => element.icon).join(', ')}

<b>💰 Money:</b> ${ctx.db.money} (${ctx.db.moneyPerHour}/hour)
<b>💎 Diamonds:</b> ${ctx.db.diamond}
<b>‍👮‍ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}

<b>⚔️ Attack:</b> ${ctx.db.attack}
<b>🛡 Shield:</b> ${ctx.db.shield}
<b>❤️ Life:</b> ${ctx.db.life}

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
	ctx.telegram.sendDocument(
		ctx.config.ids.log,
		{
			filename: `${id}.CACHE.JSON`,
			source: Buffer.from(stringify(
				ctx.caches[ctx.from.id]
			), 'utf8')
		}
	)
}

module.exports = {
	id: 'add',
	plugin: base,
	regex: [
		/^\/view/i
	]
}
