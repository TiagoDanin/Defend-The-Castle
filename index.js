const Telegraf = require('telegraf')
const telegrafStart = require('telegraf-start-parts')
const debug = require('debug')
const stringify = require('json-stringify-safe')
const nl = require('numberlabel')
const session = require('telegraf/session')
const {
	Resources,
	Translation
} = require('nodejs-i18n')
const {
	CronJob
} = require('cron')

const badges = require('./base/badges')
const clan = require('./base/clan')
const classes = require('./base/classes')
const config = require('./base/config')
const database = require('./base/database')
const levels = require('./base/levels')
let quest = require('./base/quest')
const tips = require('./base/tips')
const items = require('./items')
const ia = require('./ia')
const season = require('./base/season')

const cache = {
	top: {
		wins: [],
		losts: [],
		battles: [],
		money: [],
		level: [],
		online: []
	}
}

const bot = new Telegraf(process.env.telegram_token, {
	username: 'DefendTheCastleBot'
})

const dlogBot = debug('bot')
const dlogPlugins = debug('bot:plugins')
const dlogReply = debug('bot:reply')
const dlogInline = debug('bot:inline')
const dlogCallback = debug('bot:callback')
const dlogError = debug('bot:error')
const dlogQuest = debug('bot:quest')
const dlogLang = id => debug(`user:${id}:lang`)
const dlogInfo = id => debug(`user:${id}:info`)

dlogBot('Start bot')
dlogQuest(quest.select)
const startLog = `
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
			return ctx.answerCbQuery('You have already selected is option!', true).catch(error_ => {
				return dlogError(e)
			})
		}

		if (`${error}`.match('Error: 403: Forbidden: bot was blocked by the user')) {
			return true
		}
	}

	const fulllog = []
	let logId = `${Number(new Date())}_`
	logId += ctx && ctx.update && ctx.update.update_id ? `${ctx.update.update_id}` : 'NoUpdate'

	let errorMessage = 'ERROR'
	if (ctx && ctx._) {
		errorMessage = ctx._('ERROR')
	}

	errorMessage += ` \`ID:${logId}\``

	if (ctx && ctx.updateType) {
		if (ctx.updateType == 'message') {
			ctx.replyWithMarkdown(errorMessage)
		} else if (ctx.updateType == 'callback_query' || ctx.updateType == 'edited_message') {
			ctx.reply(errorMessage, { // EditMessageText
				parse_mode: 'Markdown'
			})
		} else if (ctx.updateType == '') {
			ctx.answerCbQuery(
				errorMessage.replace(/\*/g, '').replace(/`/g, ''),
				true
			)
		}
	}

	const deleteKeys = [
		'id',
		'classes',
		'quest',
		'tags',
		'cache',
		'badges',
		'items',
		'database',
		'config',
		'caches',
		'clan'
	]

	if (error) {
		fulllog.push({
			type: 'error',
			data: error
		})
		dlogError('Oooops', error)
	}

	if (ctx) {
		delete ctx.ia
		fulllog.push({
			type: 'ctx',
			data: ctx
		})
		deleteKeys.map(key => {
			delete ctx[key]
		})
		fulllog.push({
			type: 'ctxBasic',
			data: ctx
		})
	}

	if (plugin) {
		fulllog.push({
			type: 'plugin',
			data: plugin
		})
	}

	const clearUser = user => JSON.stringify(user).replace(/[{"}]/g, '').replace(/,/g, '\n').replace(/:/g, ': ')

	let text = `#Error ID:${logId}`
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

	bot.telegram.sendMessage(config.ids.log, text.slice(0, 4000))

	let jsonData = stringify(fulllog)
	const remove = name => {
		jsonData = jsonData.replace(new RegExp(name, 'gi'), 'OPS_SECRET')
	}

	[
		process.env.telegram_token
		// Add more...
	].forEach(name => remove(name))

	return bot.telegram.sendDocument(
		config.ids.log, {
			filename: `${logId}.log.JSON`,
			source: Buffer.from(jsonData, 'utf8')
		}
	)
}

const inline = []
const callback = []
const reply = []

bot.use((ctx, next) => telegrafStart(ctx, next))
bot.use(session({
	getSessionKey: ctx => {
		if (ctx && ctx.from && ctx.from.id) {
			return ctx.from.id
		}

		return 0
	}
}))

const r = new Resources({
	lang: config.defaultLang
})
config.locales.forEach(id => {
	r.load(id, `locales/${id}.po`)
})

const locales = new Set([...config.locales, config.defaultLang])
const checkLanguage = ctx => {
	let language = config.defaultLang
	const types = [
		'message',
		'edited_message',
		'callback_query',
		'inline_query'
	]
	const type = types.find(t => ctx.update[t])
	if (type && ctx.update[type] && ctx.update[type].from && ctx.update[type].from.language_code) {
		language = ctx.update[type].from.language_code.slice(0, 2)
	}

	if (!locales.has(language)) {
		language = config.defaultLang
	}

	return language
}

const myCache = async (id, update, reset) => {
	if (!cache[id]) {
		const user = await database.getUser(id)
		let castle = config.castles[0]
		if (user.city) {
			castle = config.castles[Number(user.city[12])]
		}

		cache[id] = {
			id: user.id || id || 0,
			name: user.name || 'Null (DeleteMe)',
			tgname: 'Null',
			tgusername: 'Null',
			castle,
			battles: 0,
			wins: 0,
			losts: 0,
			clan: false,
			rate: false,
			count: 0,
			clanxp: 0,
			clanmoney: 0,
			pts: 50
		}
	} else if (reset) {
		cache[id].battles = 0
		cache[id].wins = 0
		cache[id].losts = 0
		cache[id].count = 0
		cache[id].clanxp = Math.floor(cache[id].clanxp / 12)
		cache[id].clanmoney = Math.floor(cache[id].clanmoney / 12)
	}

	cache[id].pts = Math.floor(
		(cache[id].wins * 12.2) +
		(cache[id].losts * -7.2) +
		(cache[id].clanxp * 0.18) +
		(cache[id].clanmoney * -0.12) + 50
	)
	cache[id].rate = Math.floor(cache[id].win / cache[id].lost)
	cache[id].count++
	if (update) {
		cache[id] = {
			...cache[id],
			...update
		}
	}

	return cache[id]
}

for (let i = 0; i < 10; i++) {
	// 0 = Null User
	// 0 > BOT IA User
	myCache(i, false, true)
}

const reload = async () => {
	dlogBot('Reload Bot')
	await season.done(cache, database, bot)

	quest = {
		...quest,
		select: quest.reload()
	}
	bot.context.quest = quest

	cache.top = {
		wins: [],
		losts: [],
		battles: [],
		money: [],
		level: [],
		online: []
	}

	const ids = Object.keys(cache).filter(element => element !== 'top')
	for (const id of ids) {
		await myCache(id, false, true)
	}

	dlogQuest(quest.select)
	bot.telegram.sendMessage(config.ids.log,
		`
#Reload
<b>BOT START (RELOAD)</b>
<b>Username:</b> @DefendTheCastleBot
		`, {
			parse_mode: 'HTML'
		}
	)
	dlogBot('Reload Bot')
	bot.context.caches = cache
}

badges.get = id => {
	const output = []
	if (cache.top.wins.includes(id)) {
		output.push(badges.list.wins)
	}

	if (cache.top.losts.includes(id)) {
		output.push(badges.list.losts)
	}

	if (cache.top.battles.includes(id)) {
		output.push(badges.list.battles)
	}

	if (cache.top.money.includes(id)) {
		output.push(badges.list.money)
	}

	if (cache.top.level.includes(id)) {
		output.push(badges.list.level)
	}

	if (config.ids.admins.includes(id)) {
		output.push(badges.list.admins)
	}

	if (config.ids.mods.includes(id)) {
		output.push(badges.list.mods)
	}

	if (cache.top.online.includes(id)) {
		output.push(badges.list.online)
	}

	return output
}

bot.use((ctx, next) => {
	const langCode = checkLanguage(ctx)
	const i18n = new Translation(langCode)
	ctx._ = i18n._.bind(i18n)
	ctx.lang = langCode
	if (ctx.from && ctx.from.id) {
		dlogLang(ctx.from.id)(ctx.lang)
	}

	return next(ctx)
})

bot.use((ctx, next) => {
	ctx.privilege = 0

	if (ctx.from && ctx.from.id) {
		if (config.ids.admins.includes(ctx.from.id)) {
			ctx.privilege = 7
		} else if (config.ids.mods.includes(ctx.from.id)) {
			ctx.privilege = 3
		}
	}

	return next(ctx)
})

bot.use((ctx, next) => {
	if (ctx && ctx.from && ctx.from.id && ctx.callbackQuery) {
		if (ctx.callbackQuery.message && ctx.callbackQuery.message.chat) {
			if (ctx.privilege >= 3) {
				ctx.from.id = ctx.callbackQuery.message.chat.id
			}
		}
	}

	return next(ctx)
})

bot.context.clan = clan
bot.context.config = config
bot.context.database = database
bot.context.castles = config.castles
bot.context.items = items

bot.context.ia = ia
bot.context.caches = cache
bot.context.cache = myCache
bot.context.quest = quest

bot.context.badges = badges.get
bot.context.classes = classes

bot.context.tags = id => {
	let output = badges.get(id)
	if (output.length > 0) {
		const badge = output[Math.floor((Math.random() * output.length))]
		output = `(<a href="https://telegram.me/DefendTheCastleBot?start=badges-${badge.id}">${badge.icon}</a>)`
		// Output = `(${output.map(el => el.icon).join(', ')})`
	} else {
		output = ''
	}

	if (cache[id] && cache[id].clan) {
		output += `[${cache[id].clan}]`
	}

	return output
}

bot.context.fixKeyboard = new Array(90).join('\u0020') + '\u200B'
bot.context.loadLang = langCode => {
	const i18n = new Translation(langCode)
	return i18n._.bind(i18n)
}

bot.context.tips = ctx => {
	return '💡 ' + tips[Math.floor((Math.random() * tips.length))](ctx)
}

bot.context.sleep = async time => {
	await new Promise(resolve => setTimeout(
		resolve,
		time
	))
	return true
}

bot.context.nl = number => {
	return nl.convert(number, 'symbol', {
		start: 850
	})
}

bot.context.userInfo = async (ctx, onlyUser) => {
	if (typeof ctx !== 'object') {
		ctx = {
			lang: 'en',
			from: {
				id: ctx // Ctx == id
			},
			chat: {
				id: ctx
			}
		}
	}

	const db = await database.getUser(ctx.from.id)
	if (!db) {
		if (typeof ctx === 'object' && onlyUser) {
			await ctx.replyWithMarkdown(ctx._`What's the name of your town?`, {
				reply_markup: {
					force_reply: true
				}
			})
		}

		return false
	}

	let data = {
		name: 'Null',
		id: 0,
		lang: 'en',
		opponent: 0,
		dual: 50,
		reply: false,
		notification: false,
		type: 'warrior',
		level: 0,
		xp: 0,
		money: 0,
		qt_bank: 0,
		qt_hospital: 0,
		qt_bomb: 0,
		qt_rocket: 0,
		qt_towerDefense: 0,
		qt_zoneWar: 0,
		qt_zoneDefense: 0,
		troops: 0,
		maxLevel: levels.length,
		levelPoc: 0,
		maxTroops: 7,
		moneyPerHour: 0,
		city: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		cache: cache[0],
		log: [],
		old: {
			...db
		},
		...db,
		castle: config.castles[db.city[12]] || '🏰'
	}
	data.cache = await myCache(data.id)

	if (locales.has(ctx.lang)) {
		data.lang = ctx.lang
	}

	if (!locales.has(data.lang)) {
		data.lang = config.defaultLang
	}

	const keysItems = Object.keys(items)

	const cl = classes[data.type]
	data.cl = cl

	data.inventory = data.inventory.reduce((total, id) => {
		if (id != 0 && keysItems.includes(id.toString())) {
			total.push(id.toString())
		}

		return total
	}, ['0'])

	data.diamond = data.inventory.filter(id => id == '11').length

	const inventoryWithTag = data.inventory.map(id => {
		return {
			id,
			...items[id],
			isInventory: true,
			isCity: false
		}
	})

	data.allItems = data.city.reduce((total, id, index) => {
		if (id != 12 && keysItems.includes(id.toString())) {
			total.push({
				id,
				...items[id],
				isInventory: false,
				isCity: true
			})
		}

		return total
	}, inventoryWithTag)

	// Reset
	data.attack = 50
	data.shield = 50
	data.life = 50

	for (const item of data.allItems) {
		if (item.doDb) {
			data = item.doDb(data, item)
		}

		if (data.run && item.doTime) {
			data = item.doTime(data, item)
		}
	}

	data.attack += Math.floor((data.attack / 100) * cl.attack)
	data.shield += Math.floor((data.shield / 100) * cl.shield)
	data.life += Math.floor((data.life / 100) * cl.life)

	data.money = Math.floor(data.money)

	if (data.run) {
		if (data.timerunning >= 604800) { // 7 days in s
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

		if (data.level < data.maxLevel && data.xp >= levels[data.level + 1]) {
			data.level++
			data.xp -= levels[data.level]
		}

		database.saveUser(ctx)
	}

	data.levelPoc = Math.floor(
		data.xp / (
			(levels[data.level + 1] || 9999999999999999) / 100
		)
	)
	if (data.levelPoc >= 100) {
		data.levelPoc = 99
	}

	data.moneyLabel = nl.convert(data.money, 'symbol', {
		start: 1000
	})

	dlogInfo(ctx.from.id)(data)
	return data
}

// Load Plugins
config.plugins.forEach(p => {
	const _ = require(`./plugins/${p}`)
	dlogBot(`Install plugin: ${_.id}`)

	if (_.install) {
		try {
			_.install()
		} catch (error) {
			processError(error, false, _)
		}
	}

	if (_.plugin) {
		bot.hears(_.regex, async ctx => {
			dlogPlugins(`Runnig cmd plugin: ${_.id}`)
			try {
				ctx.db = await ctx.userInfo(ctx, _.onlyUser)
				if (!ctx.db && _.onlyUser) {
					return false
				}

				_.plugin(ctx).catch(error => processError(error, ctx, _))
			} catch (error) {
				processError(error, ctx, _)
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

bot.hears(/^\/reload$/i, async ctx => {
	if (ctx.privilege <= 6) {
		return
	}

	reload()
})

bot.hears(/^\/quest (\w*)/i, async ctx => {
	if (ctx.privilege <= 6) {
		return
	}

	quest = {
		...quest,
		select: quest.reload(ctx.match[1])
	}
	bot.context.quest = quest
})

bot.on('message', async ctx => {
	const {message} = ctx
	if (message.reply_to_message && message.reply_to_message.text && message.text) {
		for (var _ of reply) {
			dlogReply(`Runnig Reply plugin: ${_.id}`)
			ctx.match = [
				message.reply_to_message.text,
				message.text
			]
			try {
				ctx.db = await ctx.userInfo(ctx)
				// If (!ctx.db) return false
				_.reply(ctx).catch(error => processError(error, ctx, _))
			} catch (error) {
				processError(error, ctx, _)
			}
		}
	}
})

bot.on('callback_query', async ctx => {
	if (ctx.update && ctx.update.callback_query && ctx.update.callback_query.data) {
		const {
			data
		} = ctx.update.callback_query
		for (var _ of callback) {
			if (data.startsWith(_.id)) {
				ctx.match = [].concat(data, data.split(':'))
				dlogCallback(`Runnig callback plugin: ${_.id}`)
				try {
					ctx.db = await ctx.userInfo(ctx)
					_.callback(ctx).catch(error => processError(error, ctx, _))
				} catch (error) {
					processError(error, ctx, _)
				}
			}
		}
	}
})

bot.catch(error => {
	try {
		processError(error, false, false)
	} catch (error_) {
		dlogError(`Oooops ${error}`)
		dlogError(`OH!!! ${error_}`)
	}
})

bot.launch()
new CronJob('0 0 0 * * 7', reload, null, true, 'America/Los_Angeles') // https://crontab.guru/#0_0_*_*_7
