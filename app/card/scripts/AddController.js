angular
	.module('card')
	.controller("AddController", function ($scope, supersonic) {

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
			var notes = document.getElementById("notes").value;

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
				phoneId: Parse.User.current().get("username"),
				type: type,
				name: name,
				phone: parseInt(phone.replace(/[ \(\)-]/g, "")) || null,
				email: email || null,
				lastCall: lastCall,
				interval: parseInt(interval) || null,
				unit: unit,
				notes: notes
			}, {
				success: function(card) {
					// The object was saved successfully
					supersonic.ui.layers.pop();
				},
				error: function(card, error) {
					alert("Error in NewController: " + error.code + " " + error.message);
					supersonic.ui.layers.pop();
				}
			});
		}

		$scope.Import = function() {
			navigator.contacts.pickContact( function(contact) {
				if(contact.name) { // If user did not press cancel
					var name = contact.name.formatted;
					var email = contact.emails? contact.emails[0].value : "";
					var phone = contact.phoneNumbers? contact.phoneNumbers[0].value.replace(/[ \(\)-]/g, "") : "";

					document.getElementById("name").value = name;
					document.getElementById("email").value = email;
					document.getElementById("phone").value = phone;
					document.getElementById("interval").value = "1";
				}
			}, function(err) {
				alert('Error at AddController.js: ' + err);
			});
		}

    });