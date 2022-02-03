export const isHex = (str: string) => {
	if (str.length > 1 && str.substring(0,2) === "0x"){
		return /^[A-F0-9]+$/i.test(str.substring(2))
	}else{
		return /^[A-F0-9]+$/i.test(str)
	}
}

export const isNumeric = (str: string) => {
	if (typeof str != "string") return false
	return !isNaN(str as unknown as number) && !isNaN(parseFloat(str))
}
  

export const hexToString = (hexToConvert: string) => {
    var hex  = hexToConvert.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substring(n, n+2), 16));
	}
	return str;
}

export const formatString = (str: string) => {
	let result = str
	let startWith0X = false
	if(str.length > 1 && str.substring(0,2) === "0x"){
		result = str.substring(2)
		startWith0X = true
	}
	if (isNumeric(result) && !startWith0X) return result
	if (isHex(result)) result = hexToString(result)
	// if (JSON.stringify(result).indexOf('u0000') !== -1){
	// 	result = JSON.stringify(result).split("u0000").join('')
	// 		.split("\\").join('')
	// 		.split("\"").join('')
	// }
	return result
}

export const roundPrice = (amount : string) => {
	try{
		if (!amount || amount.length === 0 || !isNumeric(amount)) throw new Error()
		const divider = 1000000000000000000
		const parsedPrice = (parseInt(amount)/divider).toFixed(3)
	    const roundedPrice = (parseFloat(parsedPrice)*100)/100;
		return roundedPrice
	}catch{
		return null
	}
}