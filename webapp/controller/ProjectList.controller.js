sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"QM_Dashboard/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";
	return BaseController.extend("QM_Dashboard.controller.ProjectList", {
		formatter: formatter,

		onInit: function() {
			var oViewModel = new JSONModel({
				currency: "EUR",
				busy: ""
			});
			this.getView().setModel(oViewModel, "view");
			

		},

		onFilterProjects: function(oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("name", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("projectList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},

		onPress: function(oEvent) {
			var oItem = oEvent.getSource();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("component", {
				projectId: oItem.getBindingContext("qmdModel").getProperty("project_id"),
				phase: oItem.getBindingContext("qmdModel").getProperty("curr_phase"),
				progress: oItem.getBindingContext("qmdModel").getProperty("curr_progress")
			});

		},

		onSelect: function(oEvent) {
			var oHeader = this.getView().byId("ohOverview");
			var oItem = oEvent.getSource();
			var sPath = oItem._aSelectedPaths[0];
			//var sPath = "/projects(" + sProjectId + ")";
			oHeader.bindElement({
				path: sPath,
				model: "qmdModel"
			});
		},

		_getDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("QM_Dashboard.view.SettingDialog", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		onOpenSettingDialog: function(oEvent) {
			this._getDialog().open();
		},

		onCloseDialog: function() {
			this._getDialog().close();
		},

		handleConfirm: function(oEvent) {
			var oFilterKeys = oEvent.getParameters().filterKeys;
			if (oFilterKeys.docPbi) {
				this.getModel("indexProperties").setProperty("/mChart/pbi", true);
			} else {
				this.getModel("indexProperties").setProperty("/mChart/pbi", false);
			}
			if (oFilterKeys.docPbiRev) {
				this.getModel("indexProperties").setProperty("/mChart/pbiRev", true);
			} else {
				this.getModel("indexProperties").setProperty("/mChart/pbiRev", false);
			}
			if (oFilterKeys.docHld) {
				this.getModel("indexProperties").setProperty("/mChart/hld", true);
			} else {
				this.getModel("indexProperties").setProperty("/mChart/hld", false);
			}
			if (oFilterKeys.docHldRev) {
				this.getModel("indexProperties").setProperty("/mChart/hldRev", true);
			} else {
				this.getModel("indexProperties").setProperty("/mChart/hldRev", false);
			}
			if (oFilterKeys.testMIT) {
				this.getModel("indexProperties").setProperty("/mChart/mMsg", true);
			} else {
				this.getModel("indexProperties").setProperty("/mChart/mMsg", false);
			}
			if (oFilterKeys.testCAT) {
				this.getModel("indexProperties").setProperty("/mChart/cMsg", true);
			} else {
				this.getModel("indexProperties").setProperty("/mChart/cMsg", false);
			}
		}

	});
});