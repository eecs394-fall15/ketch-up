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
			else if(d2 > d1) {
				return 1;
			}
			return 0;
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
			var list = document.createElement("ul");

			for (var i = 0; i < results.length; i++) { // Go through all rows in database, but only append if it matches the URL id (friend, family, or coworker)
				// Append row as list element
				if(getURLParameter("type") == results[i].get("type")) {
					list.appendChild(CreateListElement(results[i].id, results[i].get("name"), results[i].get("lastCall"), results[i].get("interval"), results[i].get("unit")));
				}
			}
			// Once it's done, overwrite the page's contents.
			// Note how this is done at the end, to avoid getting a blank screen while the data loads.
			document.getElementById("list").innerHTML = list.innerHTML;
		}

		// <super-navigate location="card#view?id=ID">
		// 	<div class="item" href="#">
		//      <p>Test Name</p>
		//      <span class="badge badge-assertive">N</span>
		// 	</div>
		// </super-navigate>
		var CreateListElement = function(objectId, name, lastCall, interval, unit) {
			var navigate = document.createElement("super-navigate");
			navigate.setAttribute("location", "card#view?id=" + objectId);

			var listElement = document.createElement("div");
			listElement.setAttribute("class", "item");

			var daysLeft = calculateDaysLeft(lastCall, interval, unit);
			var badgeSpan = document.createElement("span");
			if(daysLeft <= 0) { // Red; overdue or due today
				badgeSpan.setAttribute("class", "badge badge-assertive");
				if(daysLeft == 0) {
					badgeSpan.innerHTML = "due today";
				}
				else {
					badgeSpan.innerHTML = "overdue";
				}
			}
			else { // Orange, Yellow, Green; not overdue
				if(daysLeft <= 3) { // Orange
					badgeSpan.setAttribute("class", "badge badge-orange");
				}
				else if(daysLeft <= 7) { // Yellow
					badgeSpan.setAttribute("class", "badge badge-energized");
				}
				else { // Green
					badgeSpan.setAttribute("class", "badge badge-balanced");
				}
				badgeSpan.innerHTML = "call in " + BadgeDaysToUnits(daysLeft);
			}

			var pName = document.createElement("p");
			pName.innerHTML = name || "";

			listElement.appendChild(badgeSpan);
			listElement.appendChild(pName);
			navigate.appendChild(listElement);

			return navigate;
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