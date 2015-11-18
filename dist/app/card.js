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
				phone: parseInt(phone.replace(/[ \(\)-]/g, "")) || null,
				email: email || null,
				lastCall: lastCall,
				interval: parseInt(interval) || null,
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
			var interval = parseInt(document.getElementById("editInterval").value).toString();
			var unit = unitElement.options[unitElement.selectedIndex].text.toLowerCase();
			var lastCall = $scope.card.get("interval") == interval && $scope.card.get("unit") == unit ?
				$scope.card.get("lastCall") : new Date(); // Update last call only if interval was changed

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
					card.set("phone", parseInt(phone.replace(/[ \(\)-]/g, "")) || null);
					card.set("email", email || null);
					alert(card.get("email"))
					card.set("lastCall", lastCall);
					card.set("interval", parseInt(interval) || null);
					card.set("unit", unit);
					// Then, close the modal
					card.save().then(function() {
						supersonic.ui.layers.pop();
					});	
				},
				error: function(card, error) {
					alert("Error in NewController: " + error.code + " " + error.message);
				}
			});
		}

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

		function findId(id) {
			return $scope.allFamilyCards.find(function(e) {
				return e.id == id
			})
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
			var list = document.getElementById("list");
			list.innerHTML = "";

			for (var i = 0; i < results.length; i++) { // Go through all rows in database, but only append if it matches the URL id (friend, family, or coworker)
				// Append row as list element
				if(getURLParameter("type") == results[i].get("type") || getURLParameter("type") == "all") {
					list.appendChild(CreateListElement(results[i].id, results[i].get("name"), results[i].get("lastCall"), results[i].get("interval"), results[i].get("unit")));
				}
			}
			// Once it's done, recompile angular module to allow the ng-clicks to work.
			var el = angular.element(list);
			$scope = el.scope();
			$injector = el.injector();
			$injector.invoke(function($compile){
				$compile(el)($scope)
			})
		}

		// <div>
		// 	<div class="item item-icon-right">
		// 		<p ng-click="ExpandMenu(ID)">Test Name</p>
		// 		<span class="badge badge-assertive" id="ID_badge" style="margin-right:20px">N</span>
		//		<i class="icon super-ios-email-outline" id="ID_email" style="display: none" ng-click="ComposeMail(ID)"></i>
		//		<i class="icon super-ios-chatbubble-outline" id="ID_text" style="display: none; margin-right: 40px" ng-click="TextNumber(ID)"></i>
		// 		<i class="icon super-ios-telephone-outline" id="ID_phone" ng-click="CallNumber(ID)"></i>
		// 	</div>
		// 	<div class="item" id="ID" style="display:none; border-top:none; padding:0">
		// 		<div class="button-bar">
		// 			<a class="button button-light" style="border-bottom:0" ng-click="Postpone(ID)">Postpone</a>
		// 			<a class="button button-light" style="border-bottom:0" ng-click="Reset(ID)">Caught Up</a>
		// 			<a class="button button-light" style="border-bottom:0" ng-click="Edit(ID)">Edit Contact</a>
		// 		</div>
		// 	</div>
		// </div>
		var CreateListElement = function(objectId, name, lastCall, interval, unit) {
			var mainDiv = document.createElement("div");

			// For <div class="item item-icon-right" href="#">
			var listDiv = document.createElement("div");
			listDiv.setAttribute("class", "item item-icon-right");

			var contactName = document.createElement("p");
			contactName.setAttribute("ng-click", "ExpandMenu('" + objectId + "')");
			contactName.style.fontSize = "19px";
			contactName.innerHTML = name || "";
			listDiv.appendChild(contactName);

			var daysLeft = calculateDaysLeft(lastCall, interval, unit);
			var badge = document.createElement("span");
			badge.id = objectId + "_badge"
			badge.style.marginRight = "20px";
			if(daysLeft <= 0) { // Red; overdue or due today
				badge.setAttribute("class", "badge badge-assertive");
				if(daysLeft == 0) {
					badge.innerHTML = "due today";
				}
				else {
					badge.innerHTML = "overdue";
				}
			}
			else { // Orange, Yellow, Green; not overdue
				if(daysLeft <= 3) { // Orange
					badge.setAttribute("class", "badge badge-orange");
				}
				else if(daysLeft <= 7) { // Yellow
					badge.setAttribute("class", "badge badge-energized");
				}
				else { // Green
					badge.setAttribute("class", "badge badge-balanced");
				}
				badge.innerHTML = BadgeDaysToUnits(daysLeft);
			}
			listDiv.appendChild(badge);

		//		<i class="icon super-ios-email-outline" id="ID_email" style="display: none" ng-click="ComposeMail(ID)"></i>
		//		<i class="icon super-ios-chatbubble-outline" id="ID_text" style="display: none; margin-right: 40px" ng-click="TextNumber(ID)"></i>
		// 		<i class="icon super-ios-telephone-outline" id="ID_phone" ng-click="CallNumber(ID)"></i>

			var emailIcon = document.createElement("i");
			emailIcon.setAttribute("class", "icon super-ios-email-outline");
			emailIcon.id = objectId + "_email";
			emailIcon.style.display = "none";
			emailIcon.setAttribute("ng-click", "ComposeMail('" + objectId + "')");
			listDiv.appendChild(emailIcon);

			var textIcon = document.createElement("i");
			textIcon.setAttribute("class", "icon super-ios-chatbubble-outline");
			textIcon.id = objectId + "_text";
			textIcon.style.display = "none";
			textIcon.style.marginRight = "40px";
			textIcon.setAttribute("ng-click", "TextNumber('" + objectId + "')");
			listDiv.appendChild(textIcon);

			var callIcon = document.createElement("i");
			callIcon.setAttribute("class", "icon super-ios-telephone-outline");
			callIcon.id = objectId + "_call";
			callIcon.setAttribute("ng-click", "CallNumber('" + objectId + "')")
			listDiv.appendChild(callIcon);

			// For <div class="item" id="ID" style="display:none; border-top:none; padding:0">
			var menuDiv = document.createElement("div");
			menuDiv.setAttribute("class", "item");
			menuDiv.id = objectId;
			menuDiv.style.display = "none";
			menuDiv.style.borderTop = "none";
			menuDiv.style.padding = "0";

			var buttonBar = document.createElement("div")
			buttonBar.setAttribute("class", "button-bar");
			menuDiv.appendChild(buttonBar);

			var CreateButton = function(functionName, innerHTML) {
				var button = document.createElement("a");
				button.setAttribute("class", "button button-light");
				button.style.borderBottom = "0";
				button.setAttribute("ng-click", functionName + "('" + objectId + "')");
				button.innerHTML = innerHTML;
				return button;
			}

			buttonBar.appendChild(CreateButton("Postpone", "Postpone"));
			buttonBar.appendChild(CreateButton("Reset", "Caught Up"));
			buttonBar.appendChild(CreateButton("Edit", "Edit Contact"));

			mainDiv.appendChild(listDiv);
			mainDiv.appendChild(menuDiv);

			return mainDiv
		}

		$scope.ExpandMenu = function(id) {
			var blockDisplaySetting = $( "#" + id ).css("display")
			if(blockDisplaySetting == "none") {
				$( "#" + id ).slideDown("medium");
				$( "#" + id + "_badge" ).fadeOut("medium");
				$( "#" + id + "_call" ).animate({
					marginRight: "80px"
				}, 500);
				$( "#" + id + "_text").fadeIn("slow");
				$( "#" + id + "_email").fadeIn("medium");
			}
			else {
				$( "#" + id ).slideUp("medium");
				$( "#" + id + "_badge" ).fadeIn("medium");
				$( "#" + id + "_call" ).animate({
					marginRight: ""
				}, 500);
				$( "#" + id + "_text").fadeOut("slow");
				$( "#" + id + "_email").fadeOut("medium");
			}
		}

		$scope.CallNumber = function(id) {
			var phoneNumber = findId(id).get("phone");
			if(phoneNumber) {
				window.location = "tel:" + phoneNumber;
				$scope.Reset(id);
			}
			else {
				supersonic.ui.dialog.alert("No Phone Number",
					{message: "This contact does not have a phone number associated with it."}
				);
			}
		}

		$scope.TextNumber = function(id) {
			var phoneNumber = findId(id).get("phone");
			if(phoneNumber) {
				window.location = "sms:" + phoneNumber;
				$scope.Reset(id);
			}
			else {
				supersonic.ui.dialog.alert("No Phone Number",
					{message: "This contact does not have a phone number associated with it."}
				);
			}
		}

		$scope.ComposeMail = function(id) {
			var email = findId(id).get("email");
			if(email) {
				window.location = "mailto:" + email;
				$scope.Reset(id);
			}
			else {
				supersonic.ui.dialog.alert("No Email",
					{message: "This contact does not have an email address associated with it."}
				);
			}
		}

		$scope.Postpone = function(id) {
			alert("Postpone not implemented yet.")
		}

		$scope.Reset = function(id) {
			findId(id).save(null, {
				success: function(card) {
					card.set("lastCall", new Date());
					card.save().then(function() {
						init()
					})
				},
				error: function(card, error) {
					alert("Error in ViewController: " + error.code + " " + error.message);
				}
			});
		}

		$scope.Edit = function(id) {
			supersonic.ui.layers.push(new supersonic.ui.View("card#edit?id=" + id));
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