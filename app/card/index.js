angular.module('card', [
	/* Declare any module-specific dependencies here */
	'common'
]);

// Taken from http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

// Takes in an integer that represents milliseconds since epoch time, and parses it to days
function UTCToDays(utc) {
	var days = utc / 1000 / 60 / 60 / 24;
	return parseInt(days);
}

function calculateDaysLeft(lastCall, intervalDays) {
	var daysElapsedSinceToday = UTCToDays(Date.now() - lastCall);
	return intervalDays - daysElapsedSinceToday;
}

// Will return an array with all the form elements that failed. Will return an empty array if all succeeded.
function formValidation(name, phone, email, interval, type) {
	var result = []
	// Check the name (check that it's not blank):
	if(!name) {
		result.push("name")
	}

	// Check the phone (remove all parentheses/spaces/dashes and make sure the result is a number, or blank)
	var removedParenthesesSpacesAndDashes = phone.replace(/[ \(\)-]/g, "")
	if(isNaN(removedParenthesesSpacesAndDashes)) {
		result.push("phone")
	}

	// Check the email (check if it's either a valid email or blank)
	var re = /^[A-Za-z0-9_%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z0-9]{2,}$/;
	if(!(email == "" || re.test(email))) {
		result.push("email")
	}

	// Check the interval (check that it's a number; this CANNOT be blank)
	if(isNaN(interval) || !interval) {
		result.push("interval")
	}

	// Check the type (check that it's either friend, coworker, or family)
	// NOTE, String.in is NOT part of String; it is defined as a prototype below
	if(!type.in( ["friend", "coworker", "family"] )) {
		result.push("type")
	}

	return result;
}

String.prototype.capitalizeFirstLetter = function() {
    return this=="" ? "" : this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.in = function(arr) {
	for(var i = 0; i < arr.length; i++) {
		if(arr[i] == this) {
			return true;
		}
	}
	return false;
}