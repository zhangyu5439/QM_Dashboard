sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"QM_Dashboard/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";
	return Controller.extend("QM_Dashboard.controller.ProjectList", {
		formatter: formatter,
		onInit: function() {
			var oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");
		},
		
		onFilterProjects: function (oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("ProjectName", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("projectList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},
		
		
		onPress: function (oEvent) {
			var oItem = oEvent.getSource();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("component",
			{
				projectPath: oItem.getBindingContext("project").getProperty("ProjectID").substr(1)
			}
			);
		}

	});
});