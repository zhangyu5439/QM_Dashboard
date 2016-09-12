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
			// Initialize the attributes
			this.setModel(new JSONModel({
				itemListCount: 0,
				sumSelStatus: "I",
				sumStatus: [{
					key: "N"
				}, {
					key: "I"
				}, {
					key: "P"
				}, {
					key: "D"
				}],
				status: [{
					key: "N"
				}, {
					key: "I"
				}, {
					key: "P"
				}, {
					key: "D"
				}]
			}), "viewProperties");

			sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function(oEvent) {
				// when detail navigation occurs, update the binding context
				if (oEvent.getParameter("name") === "activity") {

					//var sProjectPath = "/" + oEvent.getParameter("arguments").projectPath;

					var sProjectID = this.getModel("appProperties").getProperty("currProjectID");
					sProjectID = "0000000001";
					var sCompType = 'CDQ';
					var sActType = oEvent.getParameter("arguments").actType;

					var oModel = new sap.ui.model.odata.ODataModel("/destinations/qmd/", false);
					var oJsonModel = new JSONModel();
					var sComponentPath = "/activities";

					oModel.read(sComponentPath, null, ["$filter=project_id eq '" + sProjectID + "' and comp_type eq '" + sCompType +
						"' and act_type eq '" + sActType + "'"
					], false, function(
						oData, oResponse) {
						console.log("Read activity successfully - oData ");
						oJsonModel.setData({
							details: oData.results
						});

					}, function() {
						console.log("Read activity failed");
					});

					this.getView().setModel(oJsonModel, "detModel");

					var oJsonModel1 = new JSONModel();
					//Activity history
					oModel.read("/act_history", null, ["$filter=project_id eq '" + sProjectID + "' and comp_type eq '" + sCompType +
						"' and act_type eq '" + sActType + "'"
					], false, function(
						oData, oResponse) {
						console.log("Read log successfully - oData ");
						oJsonModel1.setData({
							logs: oData.results
						});

					}, function() {
						console.log("Read log failed");
					});

					this.getView().setModel(oJsonModel1, "histModel");

					var sProjectPath = "qmdModel>/projects('" + sProjectID + "')";
					oView.bindElement({
						path: sProjectPath
					});

					this.getModel("viewProperties").setProperty("/saveAsTileTitle", this.getResourceBundle().getText("xtit.saveAsTileTitle", ["ATC",
						"CMA", "Realization-Sprint2"
					]));

					//Feed Filter combobox
					var oJsonModel2 = this.getModel("viewProperties");
					oModel.read("/activities", null, ["$filter=project_id eq '" + sProjectID + "'"], false,
						function(
							oData, oResponse) {
							console.log("Read Phase successfully - oData ");
							oJsonModel2.setProperty("/filters", oData.results);

						},
						function() {
							console.log("Read Phase failed");
						});

					var oComboPhase = this.getView().byId("cbPhase");

					var aFilters = this._filterDuplicate(oJsonModel2.getProperty("/filters"));
					this.getModel("viewProperties").setProperty("/filters", aFilters);

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

		_filterDuplicate: function(aItems) {

			if (aItems.length === 0) {
				return;
			}
			var aItemsNew = [];

			for (var i = 0; i < aItems.length; i++) {
				if (aItemsNew.length === 0) {
					aItemsNew.push({
						"phase": "",
						"progress": "",
						"team": "All Teams"
					});
					aItemsNew.push({
						"phase": aItems[i].phase,
						"progress": aItems[i].progress,
						"team": aItems[i].team
					});
				} else {
					var bDupl = false;

					for (var j = 0; j < aItemsNew.length; j++) {

						if (aItems[i].progress === aItemsNew[j].progress && aItems[i].team === aItemsNew[j].team) {
							bDupl = true;
							break;
						}
					}
					if (!bDupl) {
						aItemsNew.push({
							"phase": aItemsNew[0].phase,
							"progress": aItems[i].progress,
							"team": aItems[i].team
						});
					}
				}

			}
			return aItemsNew;
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

		onCancelButtonPressed: function(oEvent) {
			/*			if (this.getModel("appProperties").getProperty("/busy")) {
							return;
						}*/
			if (this.getModel("appProperties").getProperty("/editMode")) {
				this.getModel("appProperties").setProperty("/editMode", false);
			}
		},

		onSaveButtonPressed: function(oEvent) {
			/*			if (this.getModel("appProperties").getProperty("/busy")) {
							return;
						}*/
			//var oModel = new sap.ui.model.odata.ODataModel("/destinations/qmd/", false);
			var oModel = this.getModel("qmdModel");
			//Get data from context  
			var oData = this.getModel("detModel");

			//Delete metadata & object  
			delete oData.__metadata;
			
			var oParams = {};
			oParams.fnError = function(mResponse) {
				console.log("error", mResponse);
			};
			oParams.fnSuccess = function(mResponse) {};
			oParams.bMerge = true;

			//oUpdate = oCurrentModel.getData();
			//Set headers  
			oModel.setHeaders({
				"content-type": "application/json;charset=utf-8"
			});
			oModel.update("/activities(project_id='0000000001',comp_type='CDQ',phase='Realization',progress='Part2 - Sprint4',act_type='ATC')",
				oData, oParams);
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
			var sSubject = "Title",
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