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

		// Tue Nov 03 2015 11:18:07 GMT-0600 (CST)
		var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		$scope.FormatDate = function(lastContact) {
			return weekDays[lastContact.getDay()] + ", " +
				months[lastContact.getMonth()] + " " + lastContact.getDate() + ", " + lastContact.getFullYear() +
				" at " + lastContact.getHours()%12 + ":" + lastContact.getMinutes() + (lastContact.getHours()>12?" PM":" AM")
		}

		$scope.CheckIfPlural = function(interval, unit) {
			if(interval == 1) {
				return unit.substring(0, unit.length - 1); // Remove last character, which happens to be an s
			}
			return unit
		}
		
	});
