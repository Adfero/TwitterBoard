var settings = {};

exports.updateSettings = function(twitterId,data) {
	settings[twitterId] = {
		id: twitterId,
		theme: 'default',
		account: data
	}
	return settings[twitterId];
};

exports.fetchSettings = function(twitterId,callback) {
	callback(settings[twitterId]);
}