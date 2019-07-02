module.exports = {
	4: {
		icon: '🚀',
		name: 'Rocket',
		city: true,
		desc: 'Troop focused on knocking down drones and airplanes.',
		doDefend: (data, ctx) => {
			const qt = data.city.filter((id, index) => id == '4' && index != 12).length
			ctx.db.log.push([
				ctx._`🚀 Our airplane is down!`,
				ctx._`🚀 I think we can escape in time.`
			])
			data.attack += Math.floor(
				(
					50 * (data.qt_rocket / qt)
				) / (
					Math.floor((Math.random() * 3)) + 3 // Random
				)
			)
			return data
		},
		upgrade: [240, 'rocket']
	}
}
