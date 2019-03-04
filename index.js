const Telegraf = require('telegraf')
const telegrafStart = require('telegraf-start-parts')
const debug = require('debug')
const stringify = require('json-stringify-safe')
const nl = require('numberlabel')
const session = require('telegraf/session')
const { Resources, Translation } = require('nodejs-i18n')

const config = require('./config')
const database = require('./database')
const levels = require('./levels')
const tips = require('./tips')

let cache = {
	1: {
		id: 0,
		name: 'BOT 1 (Soon)',
		castle: '🏛',
		battles: 0,
		win: 0,
		lost: 0
	},
	2: {
		id: 0,
		name: 'BOT 2 (Soon)',
		castle: '🏛',
		battles: 0,
		win: 0,
		lost: 0
	},
	3: {
		id: 0,
		name: 'BOT 3 (Soon)',
		castle: '🏛',
		battles: 0,
		win: 0,
		lost: 0
	}
}

const items = {
	...require('./items/bank'),
	...require('./items/bomb'),
	...require('./items/clone'),
	...require('./items/diamond'),
	...require('./items/hospital'),
	...require('./items/null'),
	...require('./items/rocket'),
	...require('./items/shield'),
	...require('./items/tower'),
	...require('./items/zones')
}

const bot = new Telegraf(process.env.telegram_token, {
	username: 'DefendTheCastleBot'
})
const dlogBot = debug("bot")
const dlogPlugins = debug("bot:plugins")
const dlogReply = debug("bot:reply")
const dlogInline = debug("bot:inline")
const dlogCallback = debug("bot:callback")
const dlogError = debug("bot:error")

dlogBot("Start bot")
let startLog = `
#Start
<b>BOT START</b>
<b>Username:</b> @DefendTheCastleBot
`
bot.telegram.sendMessage(config.ids.log,
	startLog, {
		parse_mode: 'HTML'
	}
)

const processError = (error, ctx, plugin) => {
	if (error) {
		if (`${error}`.match('400: Bad Request: message is not modified')) {
			return ctx.answerCbQuery('You have already selected is option!', true).catch((e) => {
				return dlogError(e)
			})
		} else if (`${error}`.match('Error: 403: Forbidden: bot was blocked by the user')) {
			return true
		}
	}

	var fulllog = []
	var logId = `${+ new Date()}_`
	if (ctx && ctx.update && ctx.update.update_id) {
		logId += `${ctx.update.update_id}`
	} else {
		logId += 'NoUpdate'
	}

	var errorMsg = 'ERROR'
	if (ctx && ctx._) {
		errorMsg = ctx._('ERROR')
	}
	errorMsg += ` \`ID:${logId}\``

	if (ctx && ctx.updateType) {
		if (ctx.updateType == 'message') {
			ctx.replyWithMarkdown(errorMsg)
		} else if (ctx.updateType == 'callback_query' || ctx.updateType == 'edited_message') {
			ctx.reply(errorMsg, { //editMessageText
				parse_mode: 'Markdown'
			})
		} else if (ctx.updateType == '') {
			ctx.answerCbQuery(
				errorMsg.replace(/\*/g, '').replace(/`/g, ''),
				true
			)
		}
	}

	if (error) {
		fulllog.push({
			type: 'error',
			data: error
		})
		dlogError(`Oooops`, error)
	}
	if (ctx) {
		fulllog.push({
			type: 'ctx',
			data: ctx
		})
	}
	if (plugin) {
		fulllog.push({
			type: 'plugin',
			data: plugin
		})
	}

	var clearUser = (user) => JSON.stringify(user).replace(/[{"}]/g, '').replace(/,/g, '\n').replace(/:/g, ': ')

	var text = `#Error ID:${logId}`
	if (plugin && plugin.id) {
		text += `\nPlugin ~> ${plugin.id}`
	}
	if (error) {
		text += `\nERROR ~>\n${error.toString()}\n`
	}
	if (ctx && ctx.from) {
		text += `\nFROM ~>\n${clearUser(ctx.from)}\n`
	}
	if (ctx && ctx.chat) {
		text += `\nCHAT ~>\n${clearUser(ctx.chat)}`
	}

	bot.telegram.sendMessage(config.ids.log, text.substring(0, 4000))

	var jsonData = stringify(fulllog)
	var remove = (name) => {
		jsonData = jsonData.replace(new RegExp(name, 'gi'), 'OPS_SECRET')
	}

	[
		process.env.telegram_token
		//add more...
	].forEach(name => remove(name))

	return bot.telegram.sendDocument(
		config.ids.log,
		{
			filename: `${logId}.log.JSON`,
			source: Buffer.from(jsonData, 'utf8')
		}
	)
}

var inline = []
var callback = []
var reply = []

bot.use((ctx, next) => telegrafStart(ctx, next))
bot.use(session({
	getSessionKey: (ctx) => {
		return ctx.from.id
	}
}))

/*
const r = new Resources({
	lang: config.defaultLang
})
config.locales.forEach((id) => {
	r.load(id, `locales/${id}.po`)
})
*/

bot.use((ctx, next) => {
	//var langCode = 'en' //checkLanguage(ctx)
	//var i18n = new Translation(langCode)
	ctx._ = (t) => t //i18n._.bind(i18n)
	//ctx.langCode = langCode
	return next(ctx)
})

bot.use((ctx, next) => {
	ctx.privilege = 0
	if (config.ids.admins.includes(ctx.from.id)) {
		ctx.privilege = 7
	} else if (config.ids.mods.includes(ctx.from.id)) {
		ctx.privilege = 3
	}
	return next(ctx)
})

bot.context.cache = cache
bot.context.config = config
bot.context.database = database
bot.context.castles = config.castles
bot.context.items = items
bot.context.fixKeyboard = Array(90).join('\u0020') + '\u200B'
bot.context.tips = (ctx) => {
	return '💡 ' + tips[Math.floor((Math.random() * tips.length))](ctx)
}
bot.context.sleep = async (time) => {
	await new Promise((resolve) => setTimeout(
		resolve,
		time
	))
	return true
}
bot.context.nl = (number) => {
	return nl.convert(number, 'symbol', {
		start: 850
	})
}
bot.context.userInfo = async (ctx, onlyUser) => {
	if (typeof ctx != 'object') {
		ctx = {
			from: ctx //ctx == id
		}
	}
	let db = await database.getUser(ctx.from.id)
	if (!db) {
		if (typeof ctx == 'object' && onlyUser) {
			await ctx.replyWithMarkdown('*What\'s the name of your town?*', {
				reply_markup: {
					force_reply: true
				}
			})
		}
		return false
	}
	var data = {
		opponent: 0,
		maxLevel: levels.length,
		levelPoc: 0,
		maxTroops: 7,
		plusAtack: 0,
		plusShield: 0,
		plusLife: 0,
		plusXp: 0,
		plusMoney: 0,
		moneyPerHour: 0,
		log: [],
		old: {...db},
		...db,
		...config.class[db.type],
		castle: config.castles[db.city[12]] || '🏰'
	}

	const keysItems = Object.keys(items)

	data.inventory = data.inventory.reduce((total, id) => {
		if (id != 0 && keysItems.includes(id.toString())) {
			total.push(id.toString())
		}
		return total
	}, ['0'])

	data.diamond = data.inventory.filter(id => id == '11').length

	const inventoryWithTag = data.inventory.map((id) => {
		return {
			id: id,
			...items[id],
			isInventory: true,
			isCity: false
		}
	})

	data.allItems = data.city.reduce((total, id, index) => {
		if (id != 12 && keysItems.includes(id.toString())) {
			total.push({
				id: id,
				...items[id],
				isInventory: false,
				isCity: true
			})
		}
		return total
	}, inventoryWithTag)

	//Reset
	data.attack = 50
	data.shield = 50
	data.life = 50

	for (var item of data.allItems) {
		if (item.doDb) {
			data = item.doDb(data, item)
		}
		if (data.run && item.doTime) {
			data = item.doTime(data, item)
		}
	}
	data.money = Math.floor(data.money)
	if (data.run) {
		if (data.timerunning >= 604800) {//7 days in s
			data.xp = 0
			data.level--
			if (data.level < 1) {
				data.level = 1
			}
			data.money = Math.floor(data.old.money / 1.4)
			database.saveUser(ctx)
			ctx.replyWithMarkdown(`
				*‼️ The villagers are gone! (7 Days Offline)*
				-1 Level & Xp = 0
				-${Math.floor(data.old.money - data.money)} Coins
			`)
			return data
		}

		if (data.troops < data.maxTroops) {
			if (data.timerunning >= 120) {
				const winTroops = Math.floor(data.timerunning / 120)
				data.troops += winTroops
				if (data.troops > data.maxTroops) {
					data.troops = data.maxTroops
				}
			} else {
				data.troops++
			}
		}

		if (data.level < data.maxLevel && data.xp >= levels[data.level+1]) {
			data.level++
			data.xp -= levels[data.level]
		}
		database.saveUser(ctx)
	}
	data.levelPoc = Math.floor(
		data.xp / (
			(levels[data.level+1] || 9999999999999999) / 100
		)
	)
	if (data.levelPoc >= 100) {
		data.levelPoc = 99
	}

	data.moneyLabel = nl.convert(data.money, 'symbol', {
		start: 1000
	})
	return data
}

config.plugins.forEach(p => {
	var _ = require(`./plugins/${p}`)
	dlogBot(`Install plugin: ${_.id}`)

	if (_.install) {
		try {
			_.install()
		} catch (e) {
			processError(e, false, _)
		}
	}

	if (_.plugin) {
		bot.hears(_.regex, async (ctx) => {
			dlogPlugins(`Runnig cmd plugin: ${_.id}`)
			try {
				ctx.db = await ctx.userInfo(ctx, _.onlyUser)
				if (!ctx.db && _.onlyUser) return false
				await _.plugin(ctx)
			} catch (e) {
				processError(e, ctx, _)
			}
		})
	}

	if (_.inline) {
		inline.push(_)
	}

	if (_.callback) {
		callback.push(_)
	}

	if (_.reply) {
		reply.push(_)
	}
})

bot.on('message', async (ctx) => {
	var msg = ctx.message
	if (msg.reply_to_message && msg.reply_to_message.text && msg.text) {
		for (var _ of reply) {
			dlogReply(`Runnig Reply plugin: ${_.id}`)
			ctx.match = [
				msg.reply_to_message.text,
				msg.text
			]
			try {
				ctx.db = await ctx.userInfo(ctx)
				//if (!ctx.db) return false
				await _.reply(ctx)
			} catch (e) {
				processError(e, ctx, _)
			}
		}
	}
})

bot.on('callback_query', async (ctx) => {
	if (ctx.update && ctx.update.callback_query && ctx.update.callback_query.data) {
		var data = ctx.update.callback_query.data
		for (var _ of callback) {
			if (data.startsWith(_.id)) {
				ctx.match = [].concat(data, data.split(':'))
				dlogCallback(`Runnig callback plugin: ${_.id}`)
				try {
					ctx.db = await ctx.userInfo(ctx)
					//if (!ctx.db) return false
					await _.callback(ctx)
				} catch (e) {
					processError(e, ctx, _)
				}
			}
		}
	}
})

bot.catch((err) => {
	try {
		processError(err, false, false)
	} catch (e) {
		dlogError(`Oooops ${err}`)
		dlogError(`OH!!! ${e}`)
	}
})

bot.launch()
