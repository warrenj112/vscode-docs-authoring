const myMSALObj = new Msal.UserAgentApplication(msalConfig);

function signIn() {
	myMSALObj
		.loginPopup(loginRequest)
		.then(loginResponse => {
			if (myMSALObj.getAccount()) {
				showWelcomeMessage(myMSALObj.getAccount());
			}
		})
		.catch(error => {});
}

function signOut() {
	myMSALObj.logout();
}

function getTokenPopup(request) {
	return myMSALObj.acquireTokenSilent(request).catch(error => {
		// fallback to interaction when silent call fails
		return myMSALObj
			.acquireTokenPopup(request)
			.then(tokenResponse => {
				return tokenResponse;
			})
			.catch(error => {});
	});
}

function seeProfile() {
	if (myMSALObj.getAccount()) {
		getTokenPopup(loginRequest)
			.then(response => {
				callMSGraph(graphConfig.graphMeEndpoint, response.accessToken, updateUI);
				profileButton.classList.add('d-none');
				mailButton.classList.remove('d-none');
			})
			.catch(error => {});
	}
}

function readMail() {
	if (myMSALObj.getAccount()) {
		getTokenPopup(tokenRequest)
			.then(response => {
				callMSGraph(graphConfig.graphMailEndpoint, response.accessToken, updateUI);
			})
			.catch(error => {});
	}
}
