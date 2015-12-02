angular
	.module('card')
	.controller("RegisterController", function ($scope, supersonic) {

		$scope.ParseAndValidateUser = function(phoneNumber) {
			var re = /^(?:\+ *[0-9]{1,3} *)?(?:(?:\([0-9]{3}\))|(?:[0-9]{3}))[ -]*[0-9]{3}[ -]*[0-9]+$/;
			if(!re.test(phoneNumber)) {
				supersonic.ui.dialog.alert("Invalid phone number.", { message: "Please enter only the digits and a leading + if needed." });
				return false;
			}

			// Remove all spaces, parentheses, dashes, asterisks, and pound symbols. This will leave the leading + if it exists
			phoneNumber = phoneNumber.replace(/[ \(\)\-\*#]/g, "");

			// If it doesn't start with a +, assume it's a US number, so make sure it has 10 digits
			if(phoneNumber[0] != "+") {
				if(phoneNumber.length != 10) {
					supersonic.ui.dialog.alert("Invalid phone number.", { message: "Make sure the number either has 10 digits, or includes the country code (e.g. +5212345678)" });
					return false;
				}

				// If it doesn't start with a + and it's a valid US number, simply prepend a + to the result for saving
				phoneNumber = "+1" + phoneNumber;
			}

			return phoneNumber;
		}

		$scope.CreateAndLogin = function() {
			var phoneNumber = $( "#phoneNumber" ).val();
			var password = $( "#password" ).val();

			// Check if phoneNumber is of a valid format. Simply return if any errors are encountered.
			var phoneNumber = $scope.ParseAndValidateUser(phoneNumber);
			if(!phoneNumber) {
				return;
			}

			var user = new Parse.User();
			user.set("username", phoneNumber);
			user.set("password", password);

			user.signUp(null, {
				success: function(user) {
					// Hooray! Let them use the app now.
					supersonic.ui.initialView.dismiss();
				},
				error: function(user, error) {
					// Show the error message somewhere and let the user try again.
					supersonic.ui.dialog.alert("Invalid Registration Parameters", { message: error.message });
				}

			});
			
		}

    });