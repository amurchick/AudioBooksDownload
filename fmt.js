/**
 * Created by a.murin on 29.03.15.
 */

String.prototype.fmt = function (formats) {

	var cachedFormats = formats;

	if (!Array.isArray(cachedFormats) || arguments.length > 0) {

		cachedFormats = new Array(arguments.length);

		for (var i = 0, l = arguments.length; i < l; i++) {

			cachedFormats[i] = arguments[i];
		}
	}

	var idx  = 0;
	return this.replace(/%@([0-9]+)?/g, function(s, argIndex) {

		argIndex = (argIndex) ? parseInt(argIndex, 10) - 1 : idx++;
		s = cachedFormats[argIndex];
		return (s === null) ? '(null)' : (s === undefined) ? '' : s;
	});
};
