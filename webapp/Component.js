sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"QM_Dashboard/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function(UIComponent, Device, models, JSONMoel, ResourceMoel) {
	"use strict";

	return UIComponent.extend("QM_Dashboard.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// set i18n model

        // set device model - for responsiveness that is not part of the controls
        // (some is implicit, this is for the explicit part)
        var odeviceModel = new sap.ui.model.json.JSONModel({
            isTouch : sap.ui.Device.support.touch,
            isNoTouch : !sap.ui.Device.support.touch,
            isPhone : sap.ui.Device.system.phone,
            isNoPhone : !sap.ui.Device.system.phone,
            listMode : sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
            listItemType : sap.ui.Device.system.phone ? "Active" : "Inactive"
        });
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			//this.setModel(odeviceModel, "device");

			// create the views based on the url/hash
			this.getRouter().initialize();

		},
		
		createContent: function() {
			var oViewData = {
				component: this
			};
			return sap.ui.view({
				viewName: "QM_Dashboard.view.Index",
				type: sap.ui.core.mvc.ViewType.XML,
				viewData: oViewData
			});
		}
	});

});