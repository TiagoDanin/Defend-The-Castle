module.exports = {
	6: {
		icon: '🗿',
		name: 'Tower Defense',
		city: true,
		desc: 'Specialist in strategist of attack',
		doDefend: (data, ctx) => {
			const qt = data.city.filter((id, index) => id == '6' && index != 12).length
			if (Math.floor((Math.random() * 2)) == 0) {
				ctx.db.log.push([
					ctx._`🗿 Trap....`,
					ctx._`🗿 Oh! No... Trap..`
				])
				data.attack += Math.floor(70 * (data.qt_towerdefense / qt))
			} else {
				ctx.db.log.push([
					ctx._`🗿 The defense is down!`
				])
				data.shield += Math.floor(12 * (data.qt_towerdefense / qt))
			}

			return data
		},
		upgrade: [190, 'towerdefense']
	}
}
