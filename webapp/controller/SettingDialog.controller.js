sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"QM_Dashboard/model/formatter"
], function(BaseController, JSONModel, formatter) {
	"use strict";
	return BaseController.extend("QM_Dashboard.controller.SettingDialog", {
		formatter: formatter,

		onInit: function() {

		},

		_getDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("QM_Dashboard.view.SettingDialog");
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		onOpenSettingDialog: function(oEvent) {
			this._getDialog().open();
		},
		
		onCloseDialog: function() {
			this._getDialog().close();
		}

	});
});