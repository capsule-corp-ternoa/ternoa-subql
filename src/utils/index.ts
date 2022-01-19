export const isHex = (str: string) => {
    const regex = /[0-9A-Fa-f]{6}/g;
    return regex.test(str)
}

export const hexToString = (hexToConvert: string) => {
    var hex  = hexToConvert.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str.substring(1, str.length);
}

export const roundedPrices = (amount : string) => {
	const divider = 1000000000000000000
	const parsedPrice = (parseInt(amount)/divider).toFixed(3)
    const roundedPrice = (parseFloat(parsedPrice)*100)/100;
	return roundedPrice
}