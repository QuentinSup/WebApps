
function calculateOvershootDay(numberOfEarths, year) {
	if (numberOfEarths > 1) {
		var d = new Date(year || new Date().getFullYear(), 0, 0);
		d.setDate(d.getDate() + (365 / numberOfEarths));
		return d;
	}
	return null;
}

function buildOvershootDayString(d) {
	return d == null ? "-" : d.toLocaleDateString();
}