type AnyFunction = <T extends unknown[], R extends unknown>(args?: T) => R | Promise<R>

export function tcWrapper<F extends AnyFunction>(fn: F) {
  return ((...args) => {
    try {
      return fn.apply(this, args)
    } catch (e) {
      console.log(e)
    }
  }) as F
}

export function hexToString(str: string){
  var hex  = str.toString();
	var s = '';
	for (var n = 0; n < hex.length; n += 2) {
		s += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return s.substr(1, str.length - 1);
}