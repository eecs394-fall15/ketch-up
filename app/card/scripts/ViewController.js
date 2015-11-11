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
