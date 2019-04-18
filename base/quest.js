const done = (ctx) => {
	ctx.replyWithMarkdown(
		ctx._`📦 *#Quest*`,
		{
			reply_markup: {
				inline_keyboard: [
					[{text: ctx._`Open (Click Here)` , callback_data: `quests:${select.key}` }]
				]
			},
			disable_web_page_preview: true
		}
	)
}

const list = [
	{
		id: 'badges',
		text: 'Be the King of Emblems',
		validation: (ctx) => {
			if (ctx.badges(ctx.from.id).length >= 1) {
				done(ctx)
			}
			return
		},
		inventory: [11, 10],
		money: 1000,
		xp: 1000
	}, {
		id: 'present',
		text: '🎁 Find the best present!',
		validation: (ctx) => {
			return (data, numb, ctx) => {
				done(ctx)
				return data
			}
		},
		inventory: [11, 11, 10, 12],
		money: 4000,
		xp: 140
	}, {
		id: 'fight',
		text: 'Show your power to the other castles 🤔😉',
		validation: (ctx) => {
			ctx.session.count = ctx.session.count+1 || 1
			if (ctx.session.count >= 15) {
				done(ctx)
			}
			return
		},
		inventory: [10, 10, 12, 12],
		money: 500,
		xp: 100
	}, {
		id: 'key',
		text: 'Find the key (🔑) to the Castle vault.',
		validation: (ctx) => {
			return
		},
		inventory: [11, 12],
		money: 1500,
		xp: 500
	}, {
		id: 'points',
		text: 'Earn points for your clan.',
		validation: (ctx) => {
			const pts = ctx.caches[ctx.from.id].pts
			if (pts > 1) {
				done(ctx)
			}
			return
		},
		inventory: [13, 13, 13],
		money: 500,
		xp: 500
	}
]
const date = new Date()
const select = list[4] //list[Math.floor((Math.random() * list.length))]
select.key = `${select.id}${Math.floor(Math.random() * (900000 - 100000) + 100000)}`
date.setDate(date.getDate() + 7)
select.date = +date

const check = (id, ctx) => {
	if (+new Date() > select.date) {
		select.key = ''
		select.id = ''
		return false
	}
	if (select.id == id && !ctx.session.quest) {
		return select.validation(ctx)
	}
	return false
}

module.exports = {
	select,
	check,
	done,
	list
}
