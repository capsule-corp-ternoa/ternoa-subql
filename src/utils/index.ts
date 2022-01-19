export const isHex = (str: string) => {
    const regex = /[0-9A-Fa-f]{6}/g;
    return regex.test(str)
}

export const isNumeric = (str: string) => {
	if (typeof str != "string") return false
	return !isNaN(str as unknown as number) && isNaN(parseFloat(str))
}
  

export const hexToString = (hexToConvert: string) => {
    var hex  = hexToConvert.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substring(n, n+2), 16));
	}
	return str;
}

export const roundPrice = (amount : string) => {
	const divider = 1000000000000000000
	const parsedPrice = (parseInt(amount)/divider).toFixed(3)
    const roundedPrice = (parseFloat(parsedPrice)*100)/100;
	return roundedPrice
}

export const formatString = (str: string) => {
	let result = str
	if (isNumeric(result)) return result
	if (isHex(result)) result = hexToString(result)
	if (JSON.stringify(result).indexOf('u0000') !== -1){
		result = JSON.stringify(result).split("u0000").join('')
			.split("\\").join('')
			.split("\"").join('')
	}
	return result
}