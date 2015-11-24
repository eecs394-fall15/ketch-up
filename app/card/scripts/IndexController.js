angular
	.module('card')
	.controller("IndexController", function ($scope, supersonic) {
		$scope.allFamilyCards = undefined;

		var sortByTimeRemaining = function(e1, e2) {
			var d1 = calculateDaysLeft(e1.get("lastCall"), e1.get("interval"), e1.get("unit"));
			var d2 = calculateDaysLeft(e2.get("lastCall"), e2.get("interval"), e2.get("unit"));
			if(d1 < d2) {
				return -1;
			}
			else if(d1 > d2) {
				return 1;
			}
			return 0;
		}

		function findId(id) {
			return $scope.allFamilyCards.find(function(e) {
				return e.id == id
			})
		}

		var init = function() {
			// Save all the info into allFamilyCards
			var ContactsObject = Parse.Object.extend("ketchupData");
			var query = new Parse.Query(ContactsObject);
			query.descending("createdAt").find( {
				success: function (results) { // Find all values in database and stuff into results. Results will be in descending order by creation date.
					results.sort( sortByTimeRemaining ) // Sort by amount of time remaining
					$scope.allFamilyCards = results; // Stuff the results in our global, for future searching.
					GenerateList(results);
				},
				error: function (error) {
						alert("Error in IndexController: " + error.code + " " + error.message);
				}
			});
		};

		supersonic.ui.views.current.whenVisible( function() {
    		init();
		});

		function GenerateList(results) {
			var list = document.getElementById("list");
			list.innerHTML = "";

			for (var i = 0; i < results.length; i++) { // Go through all rows in database, but only append if it matches the URL id (friend, family, or coworker)
				// Append row as list element
				if(getURLParameter("type") == results[i].get("type") || getURLParameter("type") == "all") {
					list.appendChild(CreateListElement(results[i].id, results[i].get("name"), results[i].get("lastCall"), results[i].get("interval"), results[i].get("unit")));
				}
			}
			// Once it's done, recompile angular module to allow the ng-clicks to work.
			var el = angular.element(list);
			$scope = el.scope();
			$injector = el.injector();
			$injector.invoke(function($compile){
				$compile(el)($scope)
			})
		}

		// <div>
		// 	<div class="item item-icon-right">
		// 		<p ng-click="ExpandMenu(ID)">Test Name</p>
		// 		<span class="badge badge-assertive" id="ID_badge" style="margin-right:20px" ng-click="ExpandMenu(ID)">N</span>
		//		<i class="icon super-ios-email-outline" id="ID_email" style="display: none" ng-click="ComposeMail(ID)"></i>
		//		<i class="icon super-ios-chatbubble-outline" id="ID_text" style="display: none; margin-right: 40px" ng-click="TextNumber(ID)"></i>
		// 		<i class="icon super-ios-telephone-outline" id="ID_phone" ng-click="CallNumber(ID)"></i>
		// 	</div>
		// 	<div class="item" id="ID" style="display:none; border-top:none; padding:0">
		// 		<div class="button-bar">
		// 			<a class="button button-light" style="border-bottom:0" ng-click="Postpone(ID)">Postpone</a>
		// 			<a class="button button-light" style="border-bottom:0" ng-click="Reset(ID)">Caught Up</a>
		// 			<a class="button button-light" style="border-bottom:0" ng-click="Edit(ID)">Edit Contact</a>
		// 		</div>
		// 	</div>
		// </div>
		var CreateListElement = function(objectId, name, lastCall, interval, unit) {
			var mainDiv = document.createElement("div");

			// For <div class="item item-icon-right" href="#">
			var listDiv = document.createElement("div");
			listDiv.setAttribute("class", "item item-icon-right");

			var contactName = document.createElement("p");
			contactName.setAttribute("ng-click", "ExpandMenu('" + objectId + "')");
			contactName.style.fontSize = "19px";
			contactName.innerHTML = name || "";
			if(contactName.innerHTML.length > 19) {
				contactName.innerHTML = contactName.innerHTML.substring(0, 19) + "..";
			}
			listDiv.appendChild(contactName);

			var daysLeft = calculateDaysLeft(lastCall, interval, unit);
			var badge = document.createElement("span");
			badge.id = objectId + "_badge"
			badge.style.marginRight = "20px";
			badge.setAttribute("ng-click", "ExpandMenu('" + objectId + "')");
			if(daysLeft <= 0) { // Red; overdue or due today
				badge.setAttribute("class", "badge badge-assertive");
				if(daysLeft == 0) {
					badge.innerHTML = "due today";
				}
				else {
					badge.innerHTML = "overdue";
				}
			}
			else { // Orange, Yellow, Green; not overdue
				if(daysLeft <= 3) { // Orange
					badge.setAttribute("class", "badge badge-orange");
				}
				else if(daysLeft <= 7) { // Yellow
					badge.setAttribute("class", "badge badge-energized");
				}
				else { // Green
					badge.setAttribute("class", "badge badge-balanced");
				}
				badge.innerHTML = BadgeDaysToUnits(daysLeft);
			}
			listDiv.appendChild(badge);

		//		<i class="icon super-ios-email-outline" id="ID_email" style="display: none" ng-click="ComposeMail(ID)"></i>
		//		<i class="icon super-ios-chatbubble-outline" id="ID_text" style="display: none; margin-right: 40px" ng-click="TextNumber(ID)"></i>
		// 		<i class="icon super-ios-telephone-outline" id="ID_phone" ng-click="CallNumber(ID)"></i>

			var emailIcon = document.createElement("i");
			emailIcon.setAttribute("class", "icon super-ios-email-outline");
			emailIcon.id = objectId + "_email";
			emailIcon.style.display = "none";
			emailIcon.setAttribute("ng-click", "ComposeMail('" + objectId + "')");
			listDiv.appendChild(emailIcon);

			var textIcon = document.createElement("i");
			textIcon.setAttribute("class", "icon super-ios-chatbubble-outline");
			textIcon.id = objectId + "_text";
			textIcon.style.display = "none";
			textIcon.style.marginRight = "40px";
			textIcon.setAttribute("ng-click", "TextNumber('" + objectId + "')");
			listDiv.appendChild(textIcon);

			var callIcon = document.createElement("i");
			callIcon.setAttribute("class", "icon super-ios-telephone-outline");
			callIcon.id = objectId + "_call";
			callIcon.setAttribute("ng-click", "CallNumber('" + objectId + "')")
			listDiv.appendChild(callIcon);

			// For <div class="item" id="ID" style="display:none; border-top:none; padding:0">
			var menuDiv = document.createElement("div");
			menuDiv.setAttribute("class", "item");
			menuDiv.id = objectId;
			menuDiv.style.display = "none";
			menuDiv.style.borderTop = "none";
			menuDiv.style.padding = "0";

			var buttonBar = document.createElement("div")
			buttonBar.setAttribute("class", "button-bar");
			menuDiv.appendChild(buttonBar);

			var CreateButton = function(functionName, innerHTML) {
				var button = document.createElement("a");
				button.setAttribute("class", "button button-light");
				button.style.borderBottom = "0";
				button.setAttribute("ng-click", functionName + "('" + objectId + "')");
				button.innerHTML = innerHTML;
				return button;
			}

			buttonBar.appendChild(CreateButton("Postpone", "Postpone"));
			buttonBar.appendChild(CreateButton("Reset", "Caught Up"));
			buttonBar.appendChild(CreateButton("Edit", "Edit Contact"));

			mainDiv.appendChild(listDiv);
			mainDiv.appendChild(menuDiv);

			return mainDiv
		}

		$scope.ExpandMenu = function(id) {
			var blockDisplaySetting = $( "#" + id ).css("display")
			if(blockDisplaySetting == "none") {
				$( "#" + id ).slideDown("medium");
				$( "#" + id + "_badge" ).fadeOut("medium");
				$( "#" + id + "_call" ).animate({
					marginRight: "80px"
				}, 500);
				$( "#" + id + "_text").fadeIn("slow");
				$( "#" + id + "_email").fadeIn("medium");
			}
			else {
				$( "#" + id ).slideUp("medium");
				$( "#" + id + "_badge" ).fadeIn("medium");
				$( "#" + id + "_call" ).animate({
					marginRight: ""
				}, 500);
				$( "#" + id + "_text").fadeOut("slow");
				$( "#" + id + "_email").fadeOut("medium");
			}
		}

		$scope.CallNumber = function(id) {
			var phoneNumber = findId(id).get("phone");
			if(phoneNumber) {
				supersonic.app.openURL("tel:" + phoneNumber);
				$scope.Reset(id);
			}
			else {
				supersonic.ui.dialog.alert("No Phone Number",
					{message: "This contact does not have a phone number associated with it."}
				);
			}
		}

		$scope.TextNumber = function(id) {
			var phoneNumber = findId(id).get("phone");
			if(phoneNumber) {
				supersonic.app.openURL("sms:" + phoneNumber);
				$scope.Reset(id);
			}
			else {
				supersonic.ui.dialog.alert("No Phone Number",
					{message: "This contact does not have a phone number associated with it."}
				);
			}
		}

		$scope.ComposeMail = function(id) {
			var email = findId(id).get("email");
			if(email) {
				supersonic.app.openURL("mailto:" + email);
				$scope.Reset(id);
			}
			else {
				supersonic.ui.dialog.alert("No Email",
					{message: "This contact does not have an email address associated with it."}
				);
			}
		}



		$scope.Postpone = function(id) {

			var options = {
			  message: "This postpones your reminder",
			  buttonLabels: ["1 Day", "1 Week", "Cancel"]
			};

			supersonic.ui.dialog.confirm("Postpone by...", options).then(function(index) {

				if (index == 2) {
					supersonic.logger.log("Canceled");
				}
				else {

					findId(id).save(null, {
						success: function(card) {

							var lastDate = card.get("lastCall");
							var nd = new Date();

						// Plus one
						nd.setTime(lastDate.getTime()+ ((index==0?1:7)*24*60*60*1000));
						supersonic.logger.log("lastDate = " + lastDate);

						// Saving the date
						card.set("lastCall", nd);
						card.save().then(function() {
							init()
						})
					},
					error: function(card, error) {
						alert("Error in ViewController: " + error.code + " " + error.message);
					}
				});

				}
			});
		}




		$scope.Reset = function(id) {
			findId(id).save(null, {
				success: function(card) {
					card.set("lastCall", new Date());
					card.save().then(function() {
						init()
					})
				},
				error: function(card, error) {
					alert("Error in ViewController: " + error.code + " " + error.message);
				}
			});
		}

		$scope.Edit = function(id) {
			supersonic.ui.layers.push(new supersonic.ui.View("card#edit?id=" + id));
		}

		function BadgeDaysToUnits(daysLeft) {
			var unit = ""

			if(daysLeft < 7) {
				unit = "day"
				if(daysLeft != 1) {
					unit += "s"
				}
				return daysLeft + " " + unit
			}
			else if(daysLeft < 31) {
				unit = "week"
				var weeksLeft = parseInt(daysLeft/7)
				if(weeksLeft != 1) {
					unit += "s"
				}
				return weeksLeft + " " + unit
			}
			else if(daysLeft < 366) {
				unit = "month"
				var monthsLeft = parseInt(daysLeft/30)
				if(monthsLeft != 1) {
					unit += "s"
				}
				return monthsLeft + " " + unit
			}
			else {
				unit = "year"
				var yearsLeft = parseInt(daysLeft/365)
				if(yearsLeft != 1) {
					unit += "s"
				}
				return yearsLeft + " " + unit
			}
		}

    });