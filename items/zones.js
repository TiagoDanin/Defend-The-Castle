module.exports = {
	'2': {
		icon: '⚔️',
		name: 'Zone War',
		city: true,
		desc: 'Military will protect this area with their lives!',
		doDb: (data, item) => {
			if (item.isInventory) return data
			data.attack += Math.floor(30 * data.qt_zonewar)
			return data
		},
		doDefend: (data, ctx) => {
			if (Math.floor((Math.random() * 3)) == 0) {
				ctx.db.log.push([
					'We take the zone with the falicity!',
					'Easy!'
				])
				ddata.attack += Math.floor(5 * data.qt_zonewar)
			} else {
				ctx.db.log.push([
					'Trap....',
					'Oh! No... Trap..',
					'⚔️'
				])
				data.attack += Math.floor(38 * data.qt_zonewar)
			}
			return data
		},
		upgrade: [220, 'zonewar']
	},
	'3': {
		icon: '🛡',
		name: 'Zone Defense',
		city: true,
		desc: 'Military will protect this area with their lives!',
		doDb: (data, item) => {
			console.log(item)
			if (item.isInventory) return data
			data.shield += Math.floor(15 * data.qt_zonedefense)
			console.log('>>>', data.shield)
			return data
		},
		doDefend: (data, ctx) => {
			if (Math.floor((Math.random() * 3)) == 0) {
				ctx.db.log.push([
					'🛡'
				])
				data.shield += Math.floor(20 * data.qt_zonedefense)
			} else {
				ctx.db.log.push([
					'The defense is down!'
				])
				data.shield += Math.floor(4 * data.qt_zonedefense)
			}
			return data
		},
		upgrade: [200, 'zonedefense']
	}
}
