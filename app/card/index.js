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

function calculateDaysLeft(lastCall, interval, unit) {
	var copiedLastCall = new Date(lastCall.getTime()); // Need to do this because JavaScript's pass-by-reference screws everything up
	// First, convert from units to days, where units∈{days, weeks, months, years}
	switch(unit) {
		case "days": // Do nothing
			break;
		case "weeks": // Multiply by 7
			interval = 7*interval;
			break;
		case "months": // Do some open-source library magic
			copiedLastCall.addMonths(interval);
			break;
		case "years": // Goto case "months": and read comment
			copiedLastCall.addMonths(12*interval);
			break;
	}
	var daysElapsedSinceToday = UTCToDays(Date.now() - copiedLastCall);
	return interval - daysElapsedSinceToday;
}

// Will return an array with all the form elements that failed. Will return an empty array if all succeeded.
function formValidation(name, phone, email, interval, type) {
	var result = []
	// Check the name (check that it's not blank):
	if(!name) {
		result.push("name")
	}

	// Check the phone (remove all parentheses/spaces/dashes and make sure the result is a number, or blank)
	// var removedParenthesesSpacesAndDashes = phone.replace(/[ \(\)-]/g, "")
	// if(isNaN(removedParenthesesSpacesAndDashes)) {
	// 	result.push("phone")
	// }

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

// Some String prototypes that are used throughout the app

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

// Everything below taken from https://github.com/datejs/Datejs
Date.isLeapYear = function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () { 
    return Date.isLeapYear(this.getFullYear()); 
};

Date.prototype.getDaysInMonth = function () { 
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};