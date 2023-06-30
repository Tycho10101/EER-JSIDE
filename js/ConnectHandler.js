// ConnectHandler.js Version 1.0 (by LukeM)

const isHttps = location.protocol == 'https:';
PlayerIO.useSecureApiRequests = isHttps;

function asPromise(func, ...args) {
	return new Promise((resolve, reject) => func(...args, resolve, reject));
}

async function authenticate(email, password) { 
	let cli = await asPromise(PlayerIO.authenticate, "everybody-edits-v226-5ugofmmni06qbc11k5tqq", "public", { email: email, password: password }, { });
	cli.multiplayer.useSecureConnections = isHttps;

	const cfgPromise = asPromise(cli.bigDB.load, "config", "config");
	let cfg = await cfgPromise;
	
	return { cli: cli, cfg: cfg };
}

async function joinRoom(cli, cfg, worldID) {
	let roomType = "Everybodyedits";
	
	if (worldID.startsWith("BW")) {
		roomType = "Beta";
	}
	
	let con = await asPromise(cli.multiplayer.createJoinRoom, worldID, roomType + cfg.version, true, null, null);
	
	return { con: con };
}