const buildMap = (keys) => {
	return keys.map((key) => {
		return key.map((k) => {
			return {text: k, callback_data: 'tutorial:done'}
		})
	})
}

const base = async (ctx) => {
	let keyboard = []
	let text = ''
	const id = ctx.match[2] || 0

	if (id == 'done') {
		return ctx.answerCbQuery('Preview only!')
	}

	if (id == 0) {
		text = `
Welcome to <b>defend the castle</b>
* How to attack a castle
• Open the Menu
• Click on "Fight "
• Select a zone to drop the troops
TIP: A 3x3 zone is selected!
Map:`
		const map = buildMap([
			['🏚', '🏚', '🏚', '🏚', '🏚'],
			['🏚', '🏚', '🏚', '🏚', '🏚'],
			['🏚', '🏚', '🏚', '🏚', '🏚'],
			['🏚', '🏚', '🏚', '🏚', '🏚'],
			['🏚', '🏚', '🏚', '🏚', '🏚']
		])
		keyboard = map
	} else if (id == 1) {
		text = `
Best possition to drop of troops!
❌ = Not cause damage in castle (and you lose the battle)
✅ = Cause damage in castle`
		const map = buildMap([
			['❌', '❌', '❌', '❌', '❌'],
			['❌', '✅', '✅', '✅', '❌'],
			['❌', '✅', '🏚', '✅', '❌'],
			['❌', '✅', '✅', '✅', '❌'],
			['❌', '❌', '❌', '❌', '❌']
		])
		keyboard = map
	} else if (id == 2) {
		text = `
* Edit City
• Open menu
• Click in "City"
• Select an zone
• Upgrade ou Change Zone`
	} else if (id == 3) {
		text = `
* Edit Attack Troops
• Open menu
• Click in "Military Base"
• Upgrade Life, Shield or Attack
TIP: +1 troop per 120s`
	} else if (id == 4) {
		text = `
* NOTE
• Offline for 7 days causes penalties to the castle:
- Loss of money (E.g 100 ~> 71 "100 / 1.4 = 71")
- Reset XP (Xp = 0)
- -1 Level (E.g lvl10 ~> lvl9)
• Attack Troops are not used to defend the castle`
	}

	let back = []
	if (id > 0) {
		back = [
			{text: '◀️ Back' , callback_data: `tutorial:${Number(id)-1}` }
		]
	}
	keyboard = [
		...keyboard,
		[
			...back,
			{text: '▶️ Next' , callback_data: `tutorial:${Number(id)+1}` }
		]
	]
	if (id >= 5) {
		text = 'Finalized!'
		keyboard = [
			[{text: '◀️ Back' , callback_data: `tutorial:${Number(id)-1}` }],
			[{text: '✅ Let\'s Go!' , callback_data: 'menu:main' }]
		]
	}
	if (ctx.updateType == 'callback_query') {
		return ctx.editMessageText(text + ctx.fixKeyboard, {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: keyboard
			},
			disable_web_page_preview: true
		})
	}
	return ctx.replyWithHTML(text + ctx.fixKeyboard, {
		reply_markup: {
			inline_keyboard: keyboard
		},
		disable_web_page_preview: true
	})
	return
}

module.exports = {
	id: 'tutorial',
	plugin: base,
	callback: base,
	onlyUser: true,
	regex: [
		/^\/tutorial/i
	]
}
