sap.ui.define([], function() {
 	"use strict";
 	return {
 		statusText: function(sStatus) {
 			var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
 			switch (sStatus) {
 				case "I":
 					return resourceBundle.getText("projectStatusI");
 				case "S":
 					return resourceBundle.getText("projectStatusS");
 				case "N":
 					return resourceBundle.getText("projectStatusN");
 				default:
 					return sStatus;
 			}
 		}
 	};
 });