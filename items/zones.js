module.exports = {
	'2': {
		icon: '⚔️',
		name: 'Zone War',
		city: true,
		desc: 'Military will protect this area with their lives!',
		doDefend: (data, ctx) => {
			if (Math.floor((Math.random() * 3)) == 0) {
				ctx.db.log.push([
					'We take the zone with the falicity!',
					'Easy!'
				])
			} else {
				ctx.db.log.push([
					'Trap....',
					'Oh! No... Trap..'
				])
				data.attack += Math.floor(
					Math.pow(100, Math.pow(data.qt_zonewar, 0.08)) / 2
				)
			}
			return data
		},
		upgrade: [120.60, 0.2, 'zonewar']
	},
	'3': {
		icon: '🛡',
		name: 'Zone Defense',
		city: true,
		desc: 'Military will protect this area with their lives!',
		doDefend: (data, ctx) => {
			if (Math.floor((Math.random() * 3)) == 0) {
				ctx.db.log.push([
					'... ?'
				])
			} else {
				ctx.db.log.push([
					'The defense is down!'
				])
				data.shield += Math.floor(
					Math.pow(100, Math.pow(data.qt_zonedefense, 0.08)) / 2
				)
			}
			return data
		},
		upgrade: [120.60, 0.2, 'zonedefense']
	}
}
