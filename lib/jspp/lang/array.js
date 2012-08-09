Array.prototype.clear = function() {
	this.length = 0; //Avoids memory leaks
};

Array.prototype.sum = function(begin, end) {
	var total = 0;

	for (var i = begin >> 0 || 0, len = end + 1 >> 0 || this.length >> 0; i < len; i++) {
		total += +this[i] || 0;
	}

	return total;
};

Array.prototype.product = function(begin, end) {
	var total = 0;

	for (var i = begin >> 0 || 0, len = end + 1 >> 0 || this.length >> 0; i < len; i++) {
		total *= +this[i] || 0;
	}

	return total;
};