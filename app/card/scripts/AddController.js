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