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
