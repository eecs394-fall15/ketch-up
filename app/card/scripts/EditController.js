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
			var notes = document.getElementById("editNotes").value;
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
					card.set("lastCall", lastCall);
					card.set("interval", parseInt(interval) || null);
					card.set("unit", unit);
					card.set("notes", notes);
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
