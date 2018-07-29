var EEIDE = function() {
	
	//stuff for the editor
	var editor = ace.edit("jscode");
	editor.setTheme("ace/theme/monokai");
	editor.session.setMode("ace/mode/javascript");
	
	let eeide = {};

	// consts
	const buttonConnect = "button-connect";
	const buttonCompile = "button-compile";
	const inputEmail = "input-email";
	const inputPassword = "input-password";
	const inputWorld = "input-world";
	const textareaWorkspace= "jscode";
	const demoLoad = "demo-load";
	
	// ~ HELPER FUNCTIONS ~

	// string replacing function
	let strRepl = function(str, search, repl) {
		while(str.indexOf(search) >= 0) str = str.replace(search, repl);
		return str;
	}

	// getById - smaller version of the long document.whatever
	let getById = function(id) {
		return document.getElementById(id);
	}

	// disable something
	let disable = function(id) {
		getById(id).disabled = true;
	}

	// enable something
	let enable = function(id) {
		getById(id).disabled = false;
	}
	
	// color something
	let color = function(htmlItem, color) {
		htmlItem.style.color = color;
	};
	
	// color something on the form then return it to a lighter color
	let colorItem = function(id, color1 = "#FF0000", color2 = "#990000") {
		let htmlItem = getById(id);
		color(htmlItem, color1);
		setTimeout(() => {
			color(htmlItem, color2);
		}, 600);
	}

	// run some text as a script on the page
	let runAsScript = function(textInput) {
		let scriptContainer = "script-container";

		let oldScript = document.getElementById(scriptContainer);

		if (oldScript) {
			oldScript.parentNode.removeChild(oldScript);
		}

		let newScript = document.createElement("script");
		newScript.id = scriptContainer;
		newScript.text = textInput;
		document.body.appendChild(newScript);
	}

	// ~ BUTTON ACTIONS
	
	// connect to a world
	var connect = function() {
		disable(buttonConnect);
		disable(buttonCompile);

		let email = getById(inputEmail).value;
		let password = getById(inputPassword).value;

		let promise = authenticate(email, password).then(auth => {
			eeide.client = auth.cli;
			eeide.config = auth.cfg;
			
			colorItem(buttonConnect, "#00FF00", "#FFFFFF");

			enable(buttonConnect);
			enable(buttonCompile);
		}).catch(err => {
			console.log(err);
			
			enable(buttonConnect);
			
			colorItem(buttonConnect);
			
			throw err;
		});

		Promise.resolve(promise);
	}

	var compile = function() {
		disable(buttonConnect);
		disable(buttonCompile);

		if(eeide.connection !== undefined && eeide.connection !== null) {
			eeide.connection.disconnect();
		}

		let promise = joinRoom(eeide.client, eeide.config, getById(inputWorld).value).then(con => {
			eeide.connection = con.con;

			runAsScript(
				"var connection = eeide.connection;" +
				"var client = eeide.client;" +
				"var config = eeide.config;" +
				editor.getSession().getValue());
			
			colorItem(buttonCompile, "#00FF00", "#FFFFFF");

			enable(buttonConnect);
			enable(buttonCompile);
		}).catch(err => {
			console.log(err);
			
			enable(buttonConnect);
			enable(buttonCompile);
			
			colorItem(buttonCompile);
			
			throw err;
		});

		Promise.resolve(promise);
	}

	var transcode = function() {
		let baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + "/";

		let request = new XMLHttpRequest();
		request.open('GET', "transcode.html", true);

		request.onload = function() {
			if (this.status >= 200 && this.status < 400) {

				let demoHtml = this.response;

				demoHtml = strRepl(demoHtml, "///", "");
				demoHtml = strRepl(demoHtml, "$baseUrl$", baseUrl);
				demoHtml = strRepl(demoHtml, "$userCode", editor.getSession().getValue());

				let filename = "my-bot.html";

				var blob = new Blob([demoHtml], {type: 'text/html'});
				if(window.navigator.msSaveOrOpenBlob) {
					window.navigator.msSaveBlob(blob, filename);
				} else {
					var elem = window.document.createElement('a');
					elem.href = window.URL.createObjectURL(blob);
					elem.download = filename;        
					document.body.appendChild(elem);
					elem.click();        
					document.body.removeChild(elem);
				}
			} else {
				alert("Failed loading the transcode html file!");
				// We reached our target server, but it returned an error
			}
		};

		request.onerror = function(e) {
			alert("Failed loading the transcode html file!");
		};

		request.send();
	};

	var loaddemo = function() {
		let canErase = editor.getSession().getValue().length < 1;

		if(!canErase) {
			canErase = confirm("Are you sure you want to clear the text in your workspace?");
		}

		if(canErase) {
			editor.getSession().setValue("");
		}

		let request = new XMLHttpRequest();
		request.open('GET', "demos/" + getById(demoLoad).value + '-demo.js', true);

		request.onload = function() {
			if (this.status >= 200 && this.status < 400) {
				if(canErase) {
					editor.getSession().setValue(this.response);
					//alert("Demo loaded!");
				}
			} else {
				alert("Demo load failed!");
				// We reached our target server, but it returned an error
			}
		};

		request.onerror = function(e) {
			alert("Demo load failed!");
		};

		request.send();
	};

	eeide.connect = connect;
	eeide.compile = compile;
	eeide.transcode = transcode;
	eeide.loaddemo = loaddemo;
	eeide.client = null;
	eeide.config = null;

	disable(buttonCompile); // in case of refresh

	return eeide;
}

var eeide = EEIDE();

