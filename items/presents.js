module.exports = {
	15: {
		icon: '‍🎁',
		name: 'Presents',
		desc: '+1 Present',
		city: false,
		battle: false,
		box: true,
		price: 3,
		qt: 1,
		view: (data, ctx) => {
			const date = new Date()
			let qtPresents = ctx.db.inventory.filter(id => id == 15).length || 0
			if (ctx.session.box < Number(date)) {
				qtPresents += 1
			}

			return qtPresents
		}
	}
}
