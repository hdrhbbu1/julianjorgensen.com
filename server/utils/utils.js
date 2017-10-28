import crypto from 'crypto';

let NODE_ENV = (process.env.NODE_ENV || 'development');
let ENV_CONFIG = JSON.stringify(require('../../config/' + NODE_ENV + '.config'));

// Validates the payload (used for QuickBooks)
export const isValidPayload = (signature, token, payload) => {
	if (!signature || !token || !payload) {
		return false;
	}

	var hash = crypto.createHmac('sha256', token).update(JSON.stringify(payload)).digest('base64');
	if (signature === hash) {
		return hash;
	}
	return hash;
}

// Creates a MD5 token based on a secret varialbe
export const createToken = (secretVariable) => {
	let token = crypto.createHash('md5').update(secretVariable).digest('hex');
	return token;
}

// search objects by prop value
export const searchObjects = (nameKey, prop, arr) => {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i][prop] === nameKey) {
			return arr[i];
		}
	}
}

export const addHttp = (url) => {
	if (!url.match(/^[a-zA-Z]+:\/\//)) {
		url = 'http://' + url;
	}
	return url;
}

export const envConfig = () => {
	return JSON.parse(ENV_CONFIG);
}
