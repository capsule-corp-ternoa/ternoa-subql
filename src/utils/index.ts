export const isHex = (str: string) => {
    for (const c of str.toString()) {
        if ("0123456789ABCDEFabcdefx".indexOf(c) === -1) {
            return false;
        }
    }
    return true;
}

export const hexToString = (hexToConvert: string) => {
    var hex  = hexToConvert.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str.substring(1, str.length);
}
  