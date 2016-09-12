sap.ui.define([
	"./BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function(BaseController, Filter, FilterOperator, JSONModel) {
	"use strict";

	return BaseController.extend("QM_Dashboard.controller.MasterComp", {

		onInit: function() {
			this.oUpdateFinishedDeferred = jQuery.Deferred();

			this.getView().byId("list").attachEventOnce("updateFinished", function() {
				this.oUpdateFinishedDeferred.resolve();
			}, this);

			sap.ui.core.UIComponent.getRouterFor(this).
			attachRouteMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {
			var oList = this.getView().byId("list");
			var sName = oEvent.getParameter("name");
			var oArguments = oEvent.getParameter("arguments");
			if (oArguments.projectPath) {
				var sProjectPath = "/projects('" + oArguments.projectPath + "')";
				var sProjectID = oArguments.projectPath;
				this.getModel("appProperties").setProperty("/currProjectID", sProjectID);

				//	var oModel = this.getModel("qmdModel");
				var oModel = new sap.ui.model.odata.ODataModel("/destinations/qmd/", false);
				var oJsonModel = new JSONModel();
				var sComponentPath = "/components?$filter=project_id eq '" + oArguments.projectPath + "'";
				oModel.read(sComponentPath, null, null, false, function(
					oData, oResponse) {
					console.log("Read successfully - oData ");
					oJsonModel.setData({
						components: oData.results
					});

				}, function() {
					console.log("Read failed");
				});

				this.getView().setModel(oJsonModel, "compModel");

				/*			this.getView().bindElement({
								path: sProjectPath,
								model: "my_components"
							});*/

				// Wait for the list to be loaded once
				jQuery.when(this.oUpdateFinishedDeferred).then(jQuery.proxy(function() {
					var aItems;

					/*				// On the empty hash select the first item
									if (sName === "component") {
										this.selectDetail();
									}*/

					/*				// Try to select the item in the list
									if (sName === "activity") {

										aItems = oList.getItems();
										for (var i = 0; i < aItems.length; i++) {
											if (aItems[i].getBindingContext("project").getPath() === "/" + oArguments.projectPath) {
												oList.setSelectedItem(aItems[i], true);
												break;
											}
										}
									}*/

				}, this));
			}
		},

		_filterComponent: function(sProjectID) {

			// build filter array
			var aFilter = [];
			if (sProjectID) {
				aFilter.push(new Filter("project_id", FilterOperator.EQ, sProjectID));
			}

			// filter binding
			var oList = this.getView().byId("list");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},

		//Select first item as default
		selectDetail: function() {
			if (!sap.ui.Device.system.phone) {
				var oList = this.getView().byId("list");
				var aItems = oList.getItems();
				if (aItems.length && !oList.getSelectedItem()) {
					oList.setSelectedItem(aItems[0], true);
					this.showDetail(aItems[0]);
				}
			}
		},

		onSearch: function() {
			// add filter for search
			var filters = [];
			var searchString = this.getView().byId("searchField").getValue();
			if (searchString && searchString.length > 0) {
				filters = [new sap.ui.model.Filter(
					"Name",
					sap.ui.model.FilterOperator.Contains,
					searchString)];
			}

			// update list binding
			this.getView().byId("list").getBinding("items").filter(filters);
		},

		onSelect: function(oEvent) {
			// Get the list item, either from the listItem parameter or from the event's
			// source itself (will depend on the device-dependent mode).
			var oListItem = oEvent.getParameter("listItem");
			this.showDetail(oListItem || oEvent.getSource());
		},

		showDetail: function(oItem) {
			// If we're on a phone, include nav in history; if not, don't.
			//	var bReplace = jQuery.device.is.phone ? false : true;
			var oContext = oItem.getBindingContext("compModel");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("actlist", {
				from: "component",
				compType: oContext.getProperty("comp_type"),
				phase: oContext.getProperty("phase"),
				progress: oContext.getProperty("progress")
			});
		}

	});

});