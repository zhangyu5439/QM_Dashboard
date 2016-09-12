sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
], function(BaseController, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("QM_Dashboard.controller.MasterAct", {

		onInit: function() {

			this.oUpdateFinishedDeferred = jQuery.Deferred();

			this.getView().byId("list").attachEventOnce("updateFinished", function() {
				this.oUpdateFinishedDeferred.resolve();
			}, this);

			sap.ui.core.UIComponent.getRouterFor(this).
			attachRouteMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function(oEvent) {

			if (oEvent.getParameter("name") === "actlist") {
				var oList = this.getView().byId("list");
			    var sName = oEvent.getParameter("name");
				var oArguments = oEvent.getParameter("arguments");
				if (oArguments.compType) {
					var sCompType = oArguments.compType;
					var sPhase = oArguments.phase;
					var sProgress = oArguments.progress;
					var sProjectID = this.getModel("appProperties").getProperty("currProjectID");
					sProjectID = "0000000001";

					// build filter array
					var aFilter = new Array();
					this.getModel("appProperties").setProperty("/selComp/compType", sCompType);
					this.getModel("appProperties").setProperty("/selComp/phase", sPhase);
					this.getModel("appProperties").setProperty("/selComp/progress", sProgress);

					aFilter.push(new Filter("project_id", FilterOperator.EQ, sProjectID));
					aFilter.push(new Filter("comp_type", FilterOperator.EQ, sCompType));
					//aFilter.push(new Filter("phase", FilterOperator.EQ, sPhase));
					//aFilter.push(new Filter("progress", FilterOperator.EQ, sProgress));

					var oModel = new sap.ui.model.odata.ODataModel("/destinations/qmd/", false);
					var oJsonModel = new JSONModel();
					var sComponentPath = "/activities";

					oModel.read(sComponentPath, null, ["$filter=project_id eq '" + sProjectID + "' and comp_type eq '" + sCompType + "'"], false,
						function(
							oData, oResponse) {
							console.log("Read successfully - oData ");
							oJsonModel.setData({
								activities: oData.results
							});

						},
						function() {
							console.log("Read failed");
						});

					this.getView().setModel(oJsonModel, "actModel");

					//	this.getView().bindElement({
					//path: sProjectPath
					//	});

					// Wait for the list to be loaded once
					jQuery.when(this.oUpdateFinishedDeferred).then(jQuery.proxy(function() {
						var aItems;

						// On the empty hash select the first item
						if (sName === "actlist") {
							//this.selectDetail();
						}

						// Try to select the item in the list
						if (sName === "activity") {

							aItems = oList.getItems();
							for (var i = 0; i < aItems.length; i++) {
								if (aItems[i].getBindingContext("project").getPath() === "/" + oArguments.projectPath) {
									oList.setSelectedItem(aItems[i], true);
									break;
								}
							}
						}

					}, this));
				}
			}
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

		/*		onSearch: function() {
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
				},*/

		onSelect: function(oEvent) {
			// Get the list item, either from the listItem parameter or from the event's
			// source itself (will depend on the device-dependent mode).
			var oListItem = oEvent.getParameter("listItem");
			this.showDetail(oListItem || oEvent.getSource());
		},

		showDetail: function(oItem) {
			// If we're on a phone, include nav in history; if not, don't.
			//	var bReplace = jQuery.device.is.phone ? false : true;
			var oContext = oItem.getBindingContext("actModel");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("activity", {
				from: "actlist",
				actType: oContext.getProperty("act_type")
			});
		}

	});

});