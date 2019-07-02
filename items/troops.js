module.exports = {
	14: {
		icon: '‍👮',
		name: 'Troops',
		desc: '+5 Troops',
		city: false,
		battle: false,
		box: true,
		price: 3,
		qt: 5,
		view: (data, ctx) => {
			return data.troops
		},
		do: (data, ctx) => {
			data.troops += 1
			return data
		}
	}
}
