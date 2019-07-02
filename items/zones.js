module.exports = {
	2: {
		icon: '⚔️',
		name: 'Zone War',
		city: true,
		desc: 'Military will protect this area with their lives!',
		battle: false,
		price: 70,
		qt: 1,
		doDb: (data, item) => {
			if (item.isInventory) {
				return data
			}

			data.attack += Math.floor(30 * data.qt_zonewar)
			return data
		},
		doDefend: (data, ctx) => {
			const qt = data.city.filter((id, index) => id == '2' && index != 12).length
			if (Math.floor((Math.random() * 3)) == 0) {
				ctx.db.log.push([
					ctx._`⚔️ We take the zone with the facility!`,
					ctx._`⚔️ Easy!`
				])
				data.attack += Math.floor(5 * (data.qt_zonewar / qt))
			} else {
				ctx.db.log.push([
					ctx._`⚔️ Trap....`,
					ctx._`⚔️ Oh! No... Trap..`
				])
				data.attack += Math.floor(38 * (data.qt_zonewar / qt))
			}

			return data
		},
		upgrade: [220, 'zonewar']
	},
	3: {
		icon: '🛡',
		name: 'Zone Defense',
		city: true,
		desc: 'Military will protect this area with their lives!',
		battle: false,
		price: 70,
		qt: 1,
		doDb: (data, item) => {
			if (item.isInventory) {
				return data
			}

			data.shield += Math.floor(15 * data.qt_zonedefense)
			return data
		},
		doDefend: (data, ctx) => {
			const qt = data.city.filter((id, index) => id == '3' && index != 12).length
			if (Math.floor((Math.random() * 3)) == 0) {
				// Ctx.db.log.push(['🛡 '])
				data.shield += Math.floor(20 * (data.qt_zonedefense / qt))
			} else {
				ctx.db.log.push([
					ctx._`🛡 The defense is down!`
				])
				data.shield += Math.floor(4 * (data.qt_zonedefense / qt))
			}

			return data
		},
		upgrade: [200, 'zonedefense']
	}
}
