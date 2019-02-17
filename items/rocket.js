module.exports = {
	'4': {
		icon: '🚀',
		name: 'Rocket',
		city: true,
		desc: 'Troop focused on knocking down drones and airplanes.',
		doDefend: (data, ctx) => {
			ctx.db.log.push([
				'Our airplane is down!',
				'I think we can escape in time.',
				'🚀'
			])
			data.attack += Math.floor(
				(
					50 * data.qt_rocket
				) / (
					Math.floor((Math.random() * 3)) + 3 //random
				)
			)
			return data
		},
		upgrade: [240, 'rocket']
	}
}
