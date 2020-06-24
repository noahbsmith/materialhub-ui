// check if logged in
var loggedIn = false;

/// Log a user into Cordra and store a token for later use
async function loginUser(username, password) {
	//TODO DO NOT LOG TOKEN THIS IS INSECURE AND FOR DEBUG ONLY
	console.log('auth started');

	if (!nonEmpty(username)) {
		alert("Error: username cannot be empty!");
		return false;
	}
	else if (!nonEmpty(password)) {
		alert("Error: password cannot be empty!");
		return false;
	}

	const response = await postData(
		'/auth/token', {
		'grant_type': 'password',
		'username': username,
		'password': password
	});

	console.log('auth returned');
	console.log(response)

	if (!response.ok) {
		console.log('auth failed');
		alert("Login failed: bad request!");
		return false;
	}

	// now await the json content as well
	resp = await response.json();

	// try to get access token
	let access_token = resp["access_token"];

	// does it exist?
	if (access_token == undefined) {
		console.log('auth failed');
		alert("Login failed: bad credentials!");
		return false;
	}

	console.log('auth success!!');

	// check token
	const intro_ret = postData('/auth/introspect', { 'token': access_token });

	// write back access token to global store
	saveAuthToken(username, access_token);

	alert(username + " is logged in!");

	// refresh page now that we're logged in
	location.reload();

	return true;
}


/// Dump all auth storage information
async function logoutUser() {
	const authdata = tryGetAuth();

	const was_logged_in = (null !== authdata);

	if (was_logged_in) {
		alert(authdata["username"] + " was logged out!");
	} else {
		alert("No one was logged in, so nothing has been done!");
		// return false; // always dump data anyways
	}

	sessionStorage.removeItem("username");
	sessionStorage.removeItem("authToken");
	// force reload since we logged out
	location.reload();

	return was_logged_in;
}

// check if we're logged in and toggle button accordingly
function checkLogin() {
	const authdata = tryGetAuth();
	// logged in if auth isn't null
	loggedIn = (null !== authdata);
	if (loggedIn) {
		document.getElementById('loginToggleButton').innerHTML = "Logout";
	} else {
		document.getElementById('loginToggleButton').innerHTML = "Login";
	}
	return loggedIn;
}

function loginPopup() {
	// sigh apparently we're supposed to use JQuery for this
	$("#modalLoginForm").modal('show');
}

async function processModalLogin() {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	// no errors so far
	// try to log user in
	var success = await loginUser(username, password);
	if (success) {
		// hide this form on success
		$("#modalLoginForm").modal('hide');
		// force reload since we logged in
	}

}



// If we have a query string, search it now
document.addEventListener('DOMContentLoaded', function () {
	checkLogin();
}, false);

// Listener for the shared button
document.getElementById('loginToggleButton').addEventListener('click', (event) => {
	event.preventDefault();
	console.log("button pressed!")
	if (loggedIn) {
		// if we're logged in, then we should be trying to log out
		logoutUser();
	} else {
		// if we're not logged in, popup login form
		loginPopup(false);
	}
});

// Listener for the login form
document.getElementById('loginSubmitForm').addEventListener('submit', (event) => {
	event.preventDefault();
	processModalLogin();
});



