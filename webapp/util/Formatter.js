sap.ui.define([], function() {
	"use strict";
	return {

		uppercaseFirstChar: function(lowerCaseString) {
			return lowerCaseString.charAt(0).toUpperCase() + lowerCaseString.slice(1);
		},

		discontinuedStatusState: function(sDate) {
			return sDate ? "Error" : "None";
		},

		discontinuedStatusValue: function(sDate) {
			return sDate ? "Discontinued" : "";
		},

		currencyValue: function(currencyValue) {
			return parseFloat(currencyValue).toFixed(2);
		}

	};
});