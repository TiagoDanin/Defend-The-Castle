const range = 1.34
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
				data.attack += Math.floor(
					Math.pow(100, Math.pow(data.qt_zonewar, 0.03)) / range
				)
			} else {
				ctx.db.log.push([
					'Trap....',
					'Oh! No... Trap..',
					'⚔️'
				])
				data.attack += Math.floor(
					Math.pow(100, Math.pow(data.qt_zonewar, 0.08)) / range
				)
			}
			return data
		},
		upgrade: [220, 0.18, 'zonewar']
	},
	'3': {
		icon: '🛡',
		name: 'Zone Defense',
		city: true,
		desc: 'Military will protect this area with their lives!',
		doDefend: (data, ctx) => {
			if (Math.floor((Math.random() * 3)) == 0) {
				ctx.db.log.push([
					'🛡'
				])
				data.shield += Math.floor(
					Math.pow(100, Math.pow(data.qt_zonedefense, 0.03)) / range
				)
			} else {
				ctx.db.log.push([
					'The defense is down!'
				])
				data.shield += Math.floor(
					Math.pow(100, Math.pow(data.qt_zonedefense, 0.08)) / range
				)
			}
			return data
		},
		upgrade: [200, 0.18, 'zonedefense']
	}
}
