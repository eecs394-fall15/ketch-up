angular.module('common', [
  // Declare here all AngularJS dependencies that are shared by all modules.
  'supersonic',
  'parse-angular',
  'parse-angular.enhance'
  ]).run( function() {
	Parse.initialize("Nz3eFHamqLSy9TDFupG0jmPCJ6ywLoXwsmcgQjH0", "jQM6VnLUno63VjRgolsqOa5LjYXjMxZi6qMSKzfn");
});
