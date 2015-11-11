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
angular
	.module('card')
	.controller("AddController", function ($scope, supersonic) {

		$scope.cancel = function () {
			supersonic.ui.modal.hide();
		};

		$scope.SaveTapped = function () {

			// Save input in variables
			var typeElement = document.getElementById("type");
			var unitElement = document.getElementById("unit");
			var type = typeElement.options[typeElement.selectedIndex].text.toLowerCase();
			var name = document.getElementById("name").value;
			var phone = document.getElementById("phone").value;
			var email = document.getElementById("email").value;
			var lastCall = new Date();
			var interval = document.getElementById("interval").value;
			var unit = unitElement.options[unitElement.selectedIndex].text.toLowerCase();

			// Perform form validation and mark each incorrect input with a pastel red color
			var validation = formValidation(name, phone, email, interval, type);
			var validationOptions = ["name", "phone", "email", "interval", "type"];
			for(var i = 0; i < validationOptions.length; i++) {
				if(validationOptions[i].in(validation)) { // NOTE: String.in is NOT part of String; it is defined as a prototype in index.js
					document.getElementById(validationOptions[i] + "Label").style.backgroundColor = "#DFA5A4"; // Pastel red slash pink
				}
				else {
					document.getElementById(validationOptions[i] + "Label").style.backgroundColor = "#FFFFFF"; // White
				}
			}
			// Do not submit if there is any validation error
			if(validation.length != 0) {
				return;
			}

			// If all looks good, then submit info
			var ContactsObject = Parse.Object.extend("ketchupData");
			var card = new ContactsObject();

			card.save({
				type: type,
				name: name,
				phone: parseInt(phone.replace(/[ \(\)-]/g, "")) || undefined,
				email: email || undefined,
				lastCall: lastCall,
				interval: parseInt(interval) || undefined,
				unit: unit
			}, {
				success: function(card) {
					// The object was saved successfully
				},
				error: function(card, error) {
					alert("Error in NewController: " + error.code + " " + error.message);
				}
			});

			supersonic.ui.modal.hide();
		}
		
    });
angular
	.module('card')
	.controller('EditController', function($scope, supersonic) {
		$scope.card;

		$scope.cancel = function () {
			supersonic.ui.modal.hide();
		};

		supersonic.ui.views.current.whenVisible( function() {
			var ContactsObject = Parse.Object.extend("ketchupData");
			var query = new Parse.Query(ContactsObject);
			query.get(getURLParameter("id"), {
				success: function(result) {
					$scope.card = result;
					// Added this to select a default value from the dropdown
					// NOTE: capitalizeFirstLetter() is NOT built into String, but it is defined as a String prototype in index.js
					$( "#editType" ).val(result.get("type").capitalizeFirstLetter());
					$( "#editUnit" ).val(result.get("unit").capitalizeFirstLetter());
				},
				error: function(object, error) {
					alert("Error in EditController: " + error.code + " " + error.message);
				}
			});
		})

		$scope.save = function() {

			// Save input in variables
			var typeElement = document.getElementById("editType");
			var unitElement = document.getElementById("editUnit");
			var type = typeElement.options[typeElement.selectedIndex].text.toLowerCase();
			var name = document.getElementById("editName").value;
			var phone = parseInt(document.getElementById("editPhone").value).toString();
			var email = document.getElementById("editEmail").value;
			var lastCall = new Date();
			var interval = parseInt(document.getElementById("editInterval").value).toString();
			var unit = unitElement.options[unitElement.selectedIndex].text.toLowerCase();

			// Perform form validation and mark each incorrect input with a pastel red color
			var validation = formValidation(name, phone, email, interval, type);
			var validationOptions = ["name", "phone", "email", "interval", "type"];
			for(var i = 0; i < validationOptions.length; i++) {
				if(validationOptions[i].in(validation)) { // NOTE: String.in is NOT part of String; it is defined as a prototype in index.js
					document.getElementById(validationOptions[i] + "Label").style.backgroundColor = "#DFA5A4"; // Pastel red slash pink
				}
				else {
					document.getElementById(validationOptions[i] + "Label").style.backgroundColor = "#FFFFFF"; // White
				}
			}
			// Do not submit if there is any validation error
			if(validation.length != 0) {
				return;
			}

			// If all looks good, then submit info
			$scope.card.save(null, {
				success: function(card) {
					// First, save the card
					var typeElement = document.getElementById("editType");
					card.set("type", type);
					card.set("name", name);
					card.set("phone", parseInt(phone.replace(/[ \(\)-]/g, "")) || undefined);
					card.set("email", email || undefined);
					card.set("lastCall", lastCall);
					card.set("interval", parseInt(interval) || undefined);
					card.set("unit", unit);
					// Then, close the modal
					card.save().then(function() {
						supersonic.ui.modal.hide();
					});	
				},
				error: function(card, error) {
					alert("Error in NewController: " + error.code + " " + error.message);
				}
			});
		}



	});

angular
	.module('card')
	.controller("IndexController", function ($scope, supersonic) {

		$scope.allFamilyCards = undefined;
		var sortByTimeRemaining = function(e1, e2) {
			var d1 = calculateDaysLeft(e1.get("lastCall"), e1.get("interval"), e1.get("unit"));
			var d2 = calculateDaysLeft(e2.get("lastCall"), e2.get("interval"), e2.get("unit"));
			if(d1 < d2) {
				return -1;
			}
			else if(d2 > d1) {
				return 1;
			}
			return 0;
		}

		var init = function() {
			// Save all the info into allFamilyCards
			var ContactsObject = Parse.Object.extend("ketchupData");
			var query = new Parse.Query(ContactsObject);
			query.descending("createdAt").find( {
				success: function (results) { // Find all values in database and stuff into results. Results will be in descending order by creation date.
					results.sort( sortByTimeRemaining ) // Sort by amount of time remaining
					$scope.allFamilyCards = results; // Stuff the results in our global, for future searching.
					GenerateList(results);
				},
				error: function (error) {
						alert("Error in IndexController: " + error.code + " " + error.message);
				}
			});
		};

		supersonic.ui.views.current.whenVisible( function() {
    		init();
		});

		function GenerateList(results) {
			var list = document.createElement("ul");

			for (var i = 0; i < results.length; i++) { // Go through all rows in database, but only append if it matches the URL id (friend, family, or coworker)
				// Append row as list element
				if(getURLParameter("type") == results[i].get("type")) {
					list.appendChild(CreateListElement(results[i].id, results[i].get("name"), results[i].get("lastCall"), results[i].get("interval"), results[i].get("unit")));
				}
			}
			// Once it's done, overwrite the page's contents.
			// Note how this is done at the end, to avoid getting a blank screen while the data loads.
			document.getElementById("list").innerHTML = list.innerHTML;
		}

		// <super-navigate location="card#view?id=ID">
		// 	<div class="item" href="#">
		//      <p>Test Name</p>
		//      <span class="badge badge-assertive">N</span>
		// 	</div>
		// </super-navigate>
		var CreateListElement = function(objectId, name, lastCall, interval, unit) {
			var navigate = document.createElement("super-navigate");
			navigate.setAttribute("location", "card#view?id=" + objectId);

			var listElement = document.createElement("div");
			listElement.setAttribute("class", "item");

			var daysLeft = calculateDaysLeft(lastCall, interval, unit);
			var badgeSpan = document.createElement("span");
			if(daysLeft <= 0) { // Red; overdue or due today
				badgeSpan.setAttribute("class", "badge badge-assertive");
				if(daysLeft == 0) {
					badgeSpan.innerHTML = "due today";
				}
				else {
					badgeSpan.innerHTML = "overdue";
				}
			}
			else { // Orange, Yellow, Green; not overdue
				if(daysLeft <= 3) { // Orange
					badgeSpan.setAttribute("class", "badge badge-orange");
				}
				else if(daysLeft <= 7) { // Yellow
					badgeSpan.setAttribute("class", "badge badge-energized");
				}
				else { // Green
					badgeSpan.setAttribute("class", "badge badge-balanced");
				}
				badgeSpan.innerHTML = "call in " + BadgeDaysToUnits(daysLeft);
			}

			var pName = document.createElement("p");
			pName.innerHTML = name || "";

			listElement.appendChild(badgeSpan);
			listElement.appendChild(pName);
			navigate.appendChild(listElement);

			return navigate;
		}

		function BadgeDaysToUnits(daysLeft) {
			var unit = ""

			if(daysLeft < 7) {
				unit = "day"
				if(daysLeft != 1) {
					unit += "s"
				}
				return daysLeft + " " + unit
			}
			else if(daysLeft < 31) {
				unit = "week"
				var weeksLeft = parseInt(daysLeft/7)
				if(weeksLeft != 1) {
					unit += "s"
				}
				return weeksLeft + " " + unit
			}
			else if(daysLeft < 366) {
				unit = "month"
				var monthsLeft = parseInt(daysLeft/30)
				if(monthsLeft != 1) {
					unit += "s"
				}
				return monthsLeft + " " + unit
			}
			else {
				unit = "year"
				var yearsLeft = parseInt(daysLeft/365)
				if(yearsLeft != 1) {
					unit += "s"
				}
				return yearsLeft + " " + unit
			}
		}
		
    });
angular
	.module('card')
	.controller('ViewController', function($scope, supersonic) {
		$scope.card;

		supersonic.ui.views.current.whenVisible( function() {
			var ContactsObject = Parse.Object.extend("ketchupData");
			var query = new Parse.Query(ContactsObject);
			query.get(getURLParameter("id"), {
				success: function(result) {
					$scope.card = result;
				},
				error: function(object, error) {
					alert("Error in ViewController (DeclareCard): " + error.code + " " + error.message);
				}
			});
		});

		$scope.remove = function(id) {
			var options = {
			  message: "Are you sure you want to delete this contact?",
			  buttonLabel: ["Yes.", "No."]
			};

			supersonic.ui.dialog.confirm("Hold on!", options).then(function(index) {
				if (index == 0) {
					$scope.card.destroy({
						success: function(myObject) {
							// The object was deleted from the Parse Cloud.
							supersonic.ui.layers.pop(); // Go back to previous page
						},
						error: function(myObject, error) {
							alert("Error in ViewController (remove): " + error.code + " " + error.message);
						}
					});
			  		
			  	}
			  	else {			
					supersonic.logger.log("Alert closed.");
				}
			});
		}


		$scope.OpenEdit = function(card_id) {
			// Open Edit
			supersonic.ui.modal.show("card#edit?id="+card_id);
		};

		$scope.FormatPhone = function(phoneNumber) {
			var str = phoneNumber.toString();
			if(str.length == 10) {
				return "(" + str.substring(0, 3) + ") " + str.substring(3, 6) + "-" + str.substring(6, 10);
			}
			return str;
		}

		$scope.UpdateLastContact = function() {
			$scope.card.save(null, {
				success: function(card) {
					card.set("lastCall", new Date());
					card.save()
				},
				error: function(card, error) {
					alert("Error in ViewController: " + error.code + " " + error.message);
				}
			});
		}

		var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		$scope.FormatDate = function(lastContact) {
			var weekDay = weekDays[lastContact.getDay()]
			var month = months[lastContact.getMonth()]
			var day = lastContact.getDate()
			var year = lastContact.getFullYear()
			var hours = lastContact.getHours()%12
			var minutes = lastContact.getMinutes()
			return weekDay + ", " + month + " " + day + ", " + year + " at " + hours + ":" + (minutes<10?"0"+minutes:minutes) + (hours>12?" PM":" AM")
		}

		$scope.CheckIfPlural = function(interval, unit) {
			if(interval == 1) {
				return unit.substring(0, unit.length - 1); // Remove last character, which happens to be an s
			}
			return unit
		}
		
	});
