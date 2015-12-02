angular
	.module('card')
	.controller("RegisterController", function ($scope, supersonic) {

		$scope.CreateAndLogin = function() {
			var phoneNumber = $( "#phoneNumber" ).val();
			var password = $( "#password" ).val();
			var verify = $( "#verifyPassword" ).val();

			// Check if phoneNumber is of a valid format. Simply return if any errors are encountered.
			var phoneNumber = ParseAndValidateUser(phoneNumber);
			if(!phoneNumber) {
				return;
			}

			// Check if both password fields match. Return if they don't.
			if(password != verify) {
				supersonic.ui.dialog.alert("Password Mismatch", { message: "The password and verification don't match. Please check for spelling mistakes or typos and try again." });
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