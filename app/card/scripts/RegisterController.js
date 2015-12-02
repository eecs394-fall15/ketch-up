angular
	.module('card')
	.controller("RegisterController", function ($scope, supersonic) {

		$scope.CreateAndLogin = function() {
			var phoneNumber = $( "#phoneNumber" ).val();
			var password = $( "#password" ).val();

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