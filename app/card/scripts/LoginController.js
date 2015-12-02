angular
	.module('card')
	.controller("LoginController", function ($scope, supersonic) {

		supersonic.ui.views.current.whenVisible( function() {
    		var currentUser = Parse.User.current();
    		// If the user is already logged in, take them to their contact list
			if (currentUser) {
				supersonic.ui.initialView.dismiss();
			}
		});

		$scope.Login = function() {
			var phoneNumber = $( "#phoneNumber" ).val();
			var password = $( "#password" ).val();
			
			Parse.User.logIn(phoneNumber, password, {
				success: function(user) {
					// Dismiss login page after successful login.
					supersonic.ui.initialView.dismiss();
				},
				error: function(user, error) {
					alert(JSON.stringify(user))
					// The login failed. Alert user.
					var options = {
						message: "Your phone number and password combination were not found in our database. Please ensure you have entered the information correctly."
					};
					supersonic.ui.dialog.alert("Invalid Login Parameters", options);
				}
			});
		}

		$scope.Register = function() {
			supersonic.ui.layers.push(new supersonic.ui.View("card#register"));
		}

    });