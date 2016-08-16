sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller,JSONModel) {
	"use strict";

	return Controller.extend("QM_Dashboard.controller.Split", {
		
		onInit: function() {
			//this.getView().addStyleClass(designMode.getCompactCozyClass());

			// The app model enables the views used in this application to access
			// common application information in declarative view definition
			var oAppModel = new JSONModel({
				appControl: this.getAppControl(),
				currProjectID: "",
				//selected****: [],
				editMode: false,
				emptyPageText: "",
				busy: true
			});
			oAppModel.setDefaultBindingMode("OneWay");
			this.getAppControl().setModel(oAppModel, "appProperties");
		},
		
		getAppControl: function() {
			return this.byId("splitApp");
		}		
	});

});