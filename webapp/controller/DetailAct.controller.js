sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"./BaseController",
	"sap/ui/core/routing/History",
	"QM_Dashboard/util/Formatter",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(JSONModel, BaseController, History, Formatter, MessageToast, Dialog, Button, Text) {
	"use strict";

	return BaseController.extend("QM_Dashboard.controller.DetailAct", {

		onInit: function() {
			var oView = this.getView();
			// Initialize the attributes
			this.setModel(new JSONModel({
				itemListCount: 0,
				itemListCount1: 0,
				sumSelStatus: "I",
				sumStatus: [{
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
					var sCompType = this.getModel("appProperties").getProperty("/selComp/compType");
					var sPhase = this.getModel("appProperties").getProperty("/selComp/phase");
					var sProgress = this.getModel("appProperties").getProperty("/selComp/progress");
					sProjectID = "0000000001";
					sCompType = 'CDQ';
					var sActType = oEvent.getParameter("arguments").actType;
					var oModel = new sap.ui.model.odata.ODataModel("/destinations/qmd/", false);
					var oJsonModel = new JSONModel();
					var sComponentPath = "/team_activities";

					oModel.read(sComponentPath, null, ["$filter=project_id eq '" + sProjectID + "' and comp_type eq '" + sCompType +
						"' and phase eq '" + sPhase + "' and progress eq '" + sProgress + "' and act_type eq '" + sActType + "'"
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

					//Timeline
					var oJsonModel1 = new JSONModel();
					var sTimelinePath = "/timeline";

					oModel.read(sTimelinePath, null, ["$filter=project_id eq '" + sProjectID + "'"], false, function(
						oData, oResponse) {
						console.log("Read timeline successfully - oData ");
						oJsonModel1.setData({
							timeline: oData.results
						});

					}, function() {
						console.log("Read timeline failed");
					});

					this.getView().setModel(oJsonModel1, "tlModel");

					//Activity Status
					var oJsonModel2 = new JSONModel();
					var sActivityPath = "/activities";

					oModel.read(sActivityPath, null, ["$filter=project_id eq '" + sProjectID + "' and comp_type eq '" + sCompType +
						"' and phase eq '" + sPhase + "' and progress eq '" + sProgress + "' and act_type eq '" + sActType + "'"
					], false, function(
						oData, oResponse) {
						console.log("Read activity successfully - oData ");
						oJsonModel2.setData({
							status: oData.results
						});

					}, function() {
						console.log("Read activity failed");
					});

					this.getView().setModel(oJsonModel2, "actModel");

					//Team Info
					var oJsonModel3 = new JSONModel();
					var sTeamPath = "/teams";

					oModel.read(sTeamPath, null, ["$filter=project_id eq '" + sProjectID + "'"], false, function(
						oData, oResponse) {
						console.log("Read team successfully - oData ");
						oJsonModel3.setData({
							teams: oData.results
						});

					}, function() {
						console.log("Read team failed");
					});

					this.getView().setModel(oJsonModel3, "teamModel");

					//Project Info
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

					//var aFilters = this._filterDuplicate(oJsonModel2.getProperty("/filters"));
					//this.getModel("viewProperties").setProperty("/filters", aFilters);

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

		onApprovalButtonPressed: function(oEvent) {
			/*			if (this.getModel("appProperties").getProperty("/busy")) {
							return;
						}*/
			this.setStatusOK();

			var dialog = new Dialog({
				title: 'Warning',
				type: 'Message',
				state: 'Warning',
				content: new Text({
					text: 'Are you sure to set OK for overall status?'
				}),
				beginButton: new Button({
					text: 'Yes',
					press: function() {
						dialog.close();
						MessageToast.show("Project Status is set to OK");
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
			/*			if (this.getModel("appProperties").getProperty("/editMode")) {
							this.getModel("appProperties").setProperty("/editMode", false);
						}*/
		},

		onSaveButtonPressed: function(oEvent) {
			/*			if (this.getModel("appProperties").getProperty("/busy")) {
							return;
						}*/
			//var oModel = new sap.ui.model.odata.ODataModel("/destinations/qmd/", false);
			var oModel = this.getModel("qmdModel");
			//Get data from context  
			var oContext = this.getModel("detModel").getContext("/details/0"),
				sProjectId = oContext.getProperty("project_id"),
				sCompType = oContext.getProperty("comp_type"),
				sPhase = oContext.getProperty("phase"),
				sProgress = oContext.getProperty("progress"),
				sActType = oContext.getProperty("act_type"),
				sTeam = oContext.getProperty("team"),
				sStatus = oContext.getProperty("status");

			var requestObj = {

				requestUri: "",
				method: "",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/json;odata=minimalmetadata",
					"DataServiceVersion": "2.0",
					"MaxDataServiceVersion": "2.0",
					"Accept": "application/json;odata=minimalmetadata",
					"X-CSRF-Token": "header_xcsrf_token"
				}

			};

			var newData = {
				//	"odata.type": "md.services.qmd.team_activitiesType",
				//	"due_data": oContext.getProperty("due_date"),
				"status": sStatus,
				"link": oContext.getProperty("link"),
				"comment": oContext.getProperty("comment")

			};

			var url =
				"/destinations/qmd/team_activities(project_id='" + sProjectId + "',comp_type='" + sCompType + "',phase='" + sPhase +
				"',progress='" +
				sProgress + "',act_type='" + sActType + "',team='" + sTeam + "')";
			var method = "PUT";

			requestObj.requestUri = url;
			requestObj.method = method;
			requestObj.data = newData;

			OData.request(requestObj, function() {
				this.getModel("detModel").refresh(true);
			});

			//Update activity status
			var requestObj2 = {

				requestUri: "",
				method: "",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/json;odata=minimalmetadata",
					"DataServiceVersion": "2.0",
					"MaxDataServiceVersion": "2.0",
					"Accept": "application/json;odata=minimalmetadata",
					"X-CSRF-Token": "header_xcsrf_token"
				}

			};

			//Get data from context  
			oContext = this.getModel("actModel").getContext("/status/0");
			//var oTabSum = this.getView().byId("tabSummary");
			var due_date = new Date(oContext.getProperty("due_date")),
				//status = oContext.getProperty("status"),
				wiki = oContext.getProperty("wiki"),
				desc = oContext.getProperty("description"),
				qmStatus = oContext.getProperty("qm_status");

			var newData2 = {

				"due_date": due_date,
				"status": sStatus,
				"wiki": wiki,
				"description": desc,
				"qm_status": qmStatus

			};

			url =
				"/destinations/qmd/activities(project_id='" + sProjectId + "',comp_type='" + sCompType + "',phase='" + sPhase +
				"',progress='" +
				sProgress + "',act_type='" + sActType + "')";

			requestObj2.method = method;
			requestObj2.requestUri = url;
			requestObj2.data = newData2;

			OData.request(requestObj2, function() {
				sap.ui.getCore().getModel("actModel").refresh(true);
			});
			this.getView().byId("tabSummary").getModel("actModel").refresh(true);
			//Show message
			MessageToast.show("Save Successfully");
		},

		setStatusOK: function(oEvent) {
			/*			if (this.getModel("appProperties").getProperty("/busy")) {
							return;
						}*/
			//var oModel = new sap.ui.model.odata.ODataModel("/destinations/qmd/", false);
			//var oModel = this.getModel("qmdModel");
			//Get data from context  
			var oContext = this.getModel("detModel").getContext("/details/0"),
				sProjectId = oContext.getProperty("project_id");

			var requestObj = {

				requestUri: "",
				method: "",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/json;odata=minimalmetadata",
					"DataServiceVersion": "2.0",
					"MaxDataServiceVersion": "2.0",
					"Accept": "application/json;odata=minimalmetadata",
					"X-CSRF-Token": "header_xcsrf_token"
				}

			};

			var newData = {
				//	"odata.type": "md.services.qmd.team_activitiesType",
				//	"due_data": oContext.getProperty("due_date"),

				"phase": "Realization",
				"progress": "Sprint4",
				//"valid_from": "20160606",
				//"valid_to": "20160701",
				"status": "D"

			};

			var url =
				"/destinations/qmd/timeline(project_id='" + sProjectId + "',item_id=4)";
			var method = "PUT";

			requestObj.requestUri = url;
			requestObj.method = method;
			requestObj.data = newData;

			OData.request(requestObj, function() {
				sap.ui.getCore().getModel("tlModel").refresh();
			});

		},

		// Event handler for opening the Share sheet containing the standard "AddBookmark" button.
		onShareButtonPressed: function(oEvent) {
			var oShareSheet = this.getView().byId("asShare");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oShareSheet);
			oShareSheet.openBy(oEvent.getSource());
		},

		onSelChg: function(oEvent) {
			var oTable = this.getView().byId("tabItems");
			var sName = oEvent.getParameters().selectedItem.getBindingContext("teamModel").getProperty("name");
			var oBinding = oTable.getBinding("items");
			// apply filters
			if (sName === "All") {
				oBinding.aFilters = null;
				oTable.getModel("detModel").refresh(true);
			} else {
				var aFilters = [];

				var sPath = "team";
				var vOperator = sap.ui.model.FilterOperator.EQ;
				var vValue1 = sName;
				var vValue2 = "";
				var oFilter = new sap.ui.model.Filter(sPath, vOperator, vValue1, vValue2);
				aFilters.push(oFilter);

				oBinding.filter(aFilters);
			}

		},

		onItemPress: function(oEvent) {

			var oContext = oEvent.getParameter("listItem").getBindingContext("detModel");
			var sProjectId = oContext.getProperty("project_id");
			var sPhase = oContext.getProperty("phase");
			var sProgress = oContext.getProperty("progress");
			var sCompType = oContext.getProperty("comp_type");
			var sActType = oContext.getProperty("act_type");
			var sTeam = oEvent.getParameter("listItem").getBindingContext("detModel").getProperty("team");

			var oJsonModel1 = new JSONModel();
			var aSorter = [];
			aSorter.push(new sap.ui.model.Sorter("date", "desc"));
			var oModel = new sap.ui.model.odata.ODataModel("/destinations/qmd/", false);
			//Activity history
			oModel.read("/act_history", null, ["$filter=project_id eq '" + sProjectId + "' and comp_type eq '" + sCompType +
				"' and phase eq '" + sPhase + "' and progress eq '" + sProgress + "' and act_type eq '" + sActType + "' and team eq '" + sTeam +
				"'"
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
		},

		onSendEmailPressed: function() {
			/*			var oProject = this.getView().getBindingContext().getObject(),
							oResourceBundle = this.getModel("i18n").getResourceBundle(),
							sSubject = oResourceBundle.getText("xtit.emailSubject", [oProject.ProjectName]),
							sContent = oResourceBundle.getText("xtit.emailContent", [oProject.ProjectName, oProject.Type]);*/
			var sSubject = "Title",
				sContent = "Content";
			sap.m.URLHelper.triggerEmail(null, sSubject, sContent);
		},

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
				},*/

		// Event handler for the table of  items that is attached declaratively
		onUpdateFinished: function(oEvent) {
			this.getModel("viewProperties").setProperty("/itemListCount", oEvent.getParameter("total"));
		},
		onUpdateFinished1: function(oEvent) {
			this.getModel("viewProperties").setProperty("/itemListCount1", oEvent.getParameter("total"));
		}

	});

});