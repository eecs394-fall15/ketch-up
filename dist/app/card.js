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
angular
	.module('card')
	.controller("AddController", function ($scope, supersonic) {

		$scope.cancel = function () {
			supersonic.ui.modal.hide();
		};

		$scope.SaveTapped = function () {

			// Save input in variables
			var typeElement = document.getElementById("type");
			var type = typeElement.options[typeElement.selectedIndex].text.toLowerCase();
			var name = document.getElementById("name").value;
			var phone = document.getElementById("phone").value;
			var email = document.getElementById("email").value;
			var lastCall = new Date();
			var intervalDays = document.getElementById("intervalDays").value;

			// Perform form validation and mark each incorrect input with a pastel red color
			var validation = formValidation(name, phone, email, intervalDays, type);
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
				intervalDays: parseInt(intervalDays) || undefined
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
				},
				error: function(object, error) {
					alert("Error in EditController: " + error.code + " " + error.message);
				}
			});
		})

		$scope.save = function() {

			// Save input in variables
			var typeElement = document.getElementById("editType");
			var type = typeElement.options[typeElement.selectedIndex].text.toLowerCase();
			var name = document.getElementById("editName").value;
			var phone = parseInt(document.getElementById("editPhone").value).toString();
			var email = document.getElementById("editEmail").value;
			var lastCall = new Date();
			var intervalDays = parseInt(document.getElementById("editIntervalDays").value).toString();

			// Perform form validation and mark each incorrect input with a pastel red color
			var validation = formValidation(name, phone, email, intervalDays, type);
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
					card.set("intervalDays", parseInt(intervalDays) || undefined);
					// Then, close the modal
					card.save().then(function() {
						supersonic.ui.modal.hide();
					});

					
				}
			});
		}



	});

angular
	.module('card')
	.controller("IndexController", function ($scope, supersonic) {

		$scope.allFamilyCards = undefined;

		var init = function() {

			// Save all the info into allFamilyCards
			var ContactsObject = Parse.Object.extend("ketchupData");
			var query = new Parse.Query(ContactsObject);
			query.descending("createdAt").find( {
				success: function (results) { // Find all values in database and stuff into results. Results will be in descending order by creation date.
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
					list.appendChild(CreateListElement(results[i].id, results[i].get("name"), results[i].get("lastCall"), results[i].get("intervalDays")));
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
		var CreateListElement = function(objectId, name, lastCall, intervalDays) {
			var navigate = document.createElement("super-navigate");
			navigate.setAttribute("location", "card#view?id=" + objectId);

			var listElement = document.createElement("div");
			listElement.setAttribute("class", "item");

			var badgeSpan = document.createElement("span");
			badgeSpan.setAttribute("class", "badge badge-assertive");
			badgeSpan.innerHTML = calculateDaysLeft(lastCall, intervalDays);

			var pName = document.createElement("p");
			pName.innerHTML = name || "";

			listElement.appendChild(badgeSpan);
			listElement.appendChild(pName);
			navigate.appendChild(listElement);

			return navigate;
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

		$scope.OpenEdit = function(card_id) {
			// Open Edit
			supersonic.ui.modal.show("card#edit?id="+card_id);

		};
		
	});
