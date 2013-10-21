var settings = {};

exports.updateSettings = function(twitterId,data) {
	settings[twitterId] = {
		id: twitterId,
		theme: 'adfero_b',
		account: data
	}
	return settings[twitterId];
};

exports.fetchSettings = function(twitterId,callback) {
	callback(settings[twitterId]);
}