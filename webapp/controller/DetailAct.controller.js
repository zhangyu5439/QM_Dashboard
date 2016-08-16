sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"./BaseController",
	"sap/ui/core/routing/History",
	"QM_Dashboard/util/Formatter"
], function(JSONModel, BaseController, History, Formatter) {
	"use strict";

	return BaseController.extend("QM_Dashboard.controller.DetailAct", {

		onInit: function() {
			var oView = this.getView();

			sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function(oEvent) {
				// when detail navigation occurs, update the binding context
				if (oEvent.getParameter("name") === "activity") {

					var sProjectPath = "/" + oEvent.getParameter("arguments").projectPath;

					oView.bindElement({
						path: sProjectPath,
						model: "project"
					});

					// Check that the project specified actually was found
					/*				oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function() {
										var oData = oView.getModel().getData(sProjectPath);
										if (!oData) {
											sap.ui.core.UIComponent.getRouterFor(this).myNavToWithoutHash({
												currentView : oView,
												targetViewName : "QM_Dashboard.view.NotFound",
												targetViewType : "XML"
											});
										}
									}, this));*/

					// Make sure the master is here
					var oIconTabBar = oView.byId("idIconTabBar");
					oIconTabBar.getItems().forEach(function(oItem) {
						oItem.bindElement(Formatter.uppercaseFirstChar(oItem.getKey()));
					});

					// Which tab?
					var sTabKey = oEvent.getParameter("arguments").tab || "general";
					if (oIconTabBar.getSelectedKey() !== sTabKey) {
						oIconTabBar.setSelectedKey(sTabKey);
					}
				}
			}, this);
		},

		onDetailSelect: function(oEvent) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("project", {
				projectPath: oEvent.getSource().getBindingContext().getPath().slice(1),
				tab: oEvent.getParameter("selectedKey")
			}, true);
		},

		// Event handler for buttons 'Save' and 'Edit' that is attached declaratively
		onEditButtonPressed: function(oEvent) {
/*			if (this.getModel("appProperties").getProperty("/busy")) {
				return;
			}*/
			if (!this.getModel("appProperties").getProperty("/editMode")) {
				this.getModel("appProperties").setProperty("/editMode", true);
			}
		},

		// Event handler for opening the Share sheet containing the standard "AddBookmark" button.
		onShareButtonPressed: function(oEvent) {
			var oShareSheet = this.getView().byId("asShare");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oShareSheet);
			oShareSheet.openBy(oEvent.getSource());
		},

		onSendEmailPressed: function() {
/*			var oProject = this.getView().getBindingContext().getObject(),
				oResourceBundle = this.getModel("i18n").getResourceBundle(),
				sSubject = oResourceBundle.getText("xtit.emailSubject", [oProject.ProjectName]),
				sContent = oResourceBundle.getText("xtit.emailContent", [oProject.ProjectName, oProject.Type]);*/
			var	sSubject = "Title",
				sContent = "Content";
			sap.m.URLHelper.triggerEmail(null, sSubject, sContent);
		}
		
		/*		onInit: function() {
					// Initialize the attributes
					this.setModel(new JSONModel({
						itemListCount: 0
					}), "viewProperties"); 

					this.getRouter().getRoute("activity").attachPatternMatched(this.onCompMatched, this);
				},

				// This method is registered with the router in onInit. Therefore, it is called whenever the URL is changed.
				// Note that there are two possible reasons for such a change:
				// - The user has entered a URL manually (or using browser facilities, such as a favorite)
				// - Navigation to a route was triggered programmatically
				onCompMatched: function(oEvent) {
					var sPOId = decodeURIComponent(oEvent.getParameter("arguments").projectPath);
				//	this.getModel("appProperties").setProperty("/currProjectID", sPOId);
					this._bindView("/Projects('" + sPOId + "')");
				},

				// If PO has changed refresh context path for view and binding for table of PO items.
				_bindView: function(sPath) {
					var oAppModel = this.getModel("appProperties"),
						fnOnElementBindingCompleted = function(oEvent) {
							var oPurchaseOrder = this.getModel().getObject(oEvent.getSource().getPath());
							this.getEventBus().publish("nw.epm.refapps.ext.po.apv", "dataLoaded", {
								purchaseOrder: oPurchaseOrder
							});
							if (oPurchaseOrder === undefined) {
								return;
							}
							this.getModel("viewProperties").setProperty("/saveAsTileTitle", this.getResourceBundle().getText("xtit.saveAsTileTitle", [
								oPurchaseOrder.POId
							]));

							/**
							 * @ControllerHook Adaptation of purchase order details view
							 * This method is called after the data of the requested purchase order has been loaded to be shown on the detail view
							 * @callback nw.epm.refapps.ext.po.apv.controller.S3_PurchaseOrderDetails~extHookOnDataReceived
							 * @param {object} requested purchase order
							 * @return {void}
							 
							if (this.extHookOnDataReceived) {
								this.extHookOnDataReceived(oPurchaseOrder);
							}
						}.bind(this);

					this.getView().bindElement({
						events: {
							change: fnOnElementBindingCompleted,
							dataRequested: function() {
								oAppModel.setProperty("/busy", true);
							},
							dataReceived: function() {
								oAppModel.setProperty("/busy", false);
							}
						},
						path: sPath,
						parameters: {
							select: "POId,OrderedByName,SupplierName,GrossAmount,CurrencyCode,ChangedAt,DeliveryDateEarliest,LaterDelivDateExist,DeliveryAddress,ItemCount"
						}
					});
				},

				// Event handler for the table of PO items that is attached declaratively
				onUpdateFinished: function(oEvent) {
					this.getModel("viewProperties").setProperty("/itemListCount", oEvent.getParameter("total"));
				}*/

	});

});