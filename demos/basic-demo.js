// Demo JS Code - try pressing "connect" and then "compile"!
//
// This IDE includes for you:
// BlockHandler.js
// jsparse_clean.js
//
// So you can use whatever functions those have in your code!
//
// ~by SirJosh3917/ninjasupeatsninja

// please only use var, 'let' will give you errors.
var testVar;

// add a callback handler
connection.addMessageCallback("*", function(m) {
	switch(m.type) {
			
		// on "init"
		case "init": {
			
			// send "init2"
			connection.send("init2");
		} break;
			
		// on "init2"
		case "init2": {
			
			// say "Hello, World!"
			connection.send("say", "Hello, World!");
		} break;
			
		// when someone says something
		case "say": {
			
			// if they said "!download"
			if(m.getString(1) == "!download") {
				
				// tell them that
				connection.send("say", "There is no download for this bot, it runs in your browser! Check out the Everybody Edits JavaScript IDE!")
			}
		} break;
	}
});

// send "init"
connection.send("init");