# Ketchup
### Stay on time and in touch!

## Synopsis
Ketchup is a hybrid app that helps people keep in touch with their friends and family. App users are sent reminders to catch up with contacts in the app. Every contact is assigned an interval of time, for example ‘every 2 weeks’ or ‘every 15 days’, for getting caught up with. Further, users can import contact details directly from their phone’s contact list, assign notes for each contact within the app, and contact (call, text & email) contacts directly from the app.

## Motivation
Ketchup is a joint project by EECS 395 (Software Projects Management and Development) and MPD 405 (Software Product Design and Development).

The app was created with the intention of helping people stay connected. Since we often end up not getting in touch with friends and family for longer than we would like, this app aims to send users reminders to catch up. To build a user testable prototype as quickly and easily as possible, we chose a hybrid app that runs on appGyver. A motivation for maintaining the code is so that in the future, the app can be converted to a native application. Further, this allows for future developers to improve and iterate on the existing app.

## Installation for Developers
In order to install this repository for development, install [AppyGyver’s Supersonic](http://www.appgyver.io/supersonic/) using their instructions. Download the AppyGyver Scanner app (Android, IOS) to and run `steroids connect` from the Terminal to create a QR code for the development Scanner download.

## Installation for Users
You can also check out a Cloud-deployed version of the app [here](https://share.appgyver.com/?id=91204&hash=b43c27cf21e26a153cc8b7be7846138cde09251bf1c8fbb0fd1423b33c3c0421).

## Parse Integration

This project uses Parse.com as a backend for storing user information. To create your own database, simply to to [Parse.com](https://www.parse.com/) and create a new user account and app named "ketchup". In it, create a new custom class called "ketchupData". This class will store all the contacts created by the users, and the built-in User class will store all the created user accounts.

To set up a custom Parse database to use with your app, you will need to use the application keys. You can find these by clicking on Settings on the top bar in your Parse.com app, and then clicking on the Keys button on the left sidebar. To add the keys to your Steroids project, go to the `/app/common/index.js` directory and make sure the contents of the file are:
```
angular.module('common', [
  // Declare here all AngularJS dependencies that are shared by all modules.
  'supersonic',
  'parse-angular',
  'parse-angular.enhance'
  ]).run( function() {
	Parse.initialize(ApplicationId, JavascriptKey);
});
```
where ApplicationId and JavascriptKey are the keys found on the Keys page.

## Text Notifications

Ketch Up text notifications are dependent on an external text notification server that uses Twilio to send SMS messages. The repository for the text notification server can be viewed [here] (https://github.com/bomanimc/ketchup-server). 

The text notification server is dependent on API keys from Twilio, as well as keys for scraping the Parse database, so make sure to add those in before running. API keys for Twilio can be obtained by creating a trial account. Remember that with a Twilio trial account, each number that you intend to receive text messages must be verified through the [Twilio verification page](https://www.twilio.com/user/account/phone-numbers/verified)

To set up the server to send notifications at regular intervals, change the code to utilize the Cron-style scheduling function. Learn more at the [repository for the text notifications server] (https://github.com/bomanimc/ketchup-server). 

## Contributors
**Developers**: Federico Paredes, Bomani McClendon, Aleka Cheung, Akshat Kunal Thirani
**MPD**: Judy Lee, Judy Yan, Pete Keyzer, Sid Jain, Caitlin O'Gara, David Schaller 

## Problems?
Please submit any questions via Github issues!

