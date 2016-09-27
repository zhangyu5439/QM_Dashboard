// Utility for formatting values

sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/Component"
], function(DateFormat, NumberFormat, Component) {
	"use strict";

	function fnGetBundle(oControl) {
		return (oControl.getModel("i18n") || sap.ui.component(Component.getOwnerIdFor(oControl)).getModel("i18n")).getResourceBundle();
	}

	var fnDateAgoFormatter = DateFormat.getDateInstance({
			style: "medium",
			strictParsing: true,
			relative: true
		}),
		fnAmountFormatter = NumberFormat.getCurrencyInstance(),
		fnDeliveryDateFormatter = DateFormat.getDateInstance({
			style: "medium"
		});

	var me = {
		daysAgo: function(dDate) {
			if (!dDate) {
				return "";
			}
			return fnDateAgoFormatter.format(dDate);
		},

		progressColor: function(iDays) {
			var sColor = "Good";

			if (iDays <= 3) {
				sColor = "Error";
			} else if (iDays <= 7) {
				sColor = "Critical";
			}
			return sColor;
		},

		tcColor: function(iCoverage) {
			var sColor = "Critical";

			if (iCoverage >= 90) {
				sColor = "Good";
			} else if (iCoverage <= 50) {
				sColor = "Error";
			}
			return sColor;
		},

		sizeText: function(sSize) {

			switch (sSize) {
				case "M":
					return "Medium";
				case "L":
					return "Large";
				case "S":
					return "Small";
				case "XL":
					return "X Large";
				case "XXL":
					return "XX Large";
				case "XXXL":
					return "XXX Large";
				default:
					return "";
			}
		},

		stateFormat: function(sStatus) {

			switch (sStatus) {
				case "I":
					return "Warning";
				case "D":
					return "Success";
				case "E":
					return "Error";
				case "P":
					return "Warning";
				default:
					return "None";
			}
		},

		mandatoryText: function(sFlag) {

			switch (sFlag) {
				case "X":
					return "Mandatory";
				case "":
					return "Optional";
				default:
					return "Optional";
			}
		},

		compText: function(sComp) {

			switch (sComp) {
				case "CDQ":
					return "Code Quality";
				case "DOC":
					return "Documentation";
				case "REV":
					return "Review";
				case "TEST":
					return "Testing";
				case "PERF":
					return "Performance";
				case "SOXIP":
					return "SOX/IP";
				default:
					return "";
			}
		},

		compIcon: function(sComp) {

			switch (sComp) {
				case "CDQ":
					return "sap-icon://quality-issue";
				case "DOC":
					return "sap-icon://documents";
				case "REV":
					return "sap-icon://inspection";
				case "TEST":
					return "sap-icon://lab";
				case "PERF":
					return "sap-icon://performance";
				case "SOXIP":
					return "sap-icon://permission";
				default:
					return "";
			}
		},

		actText: function(sAct) {

			switch (sAct) {
				case "ATC":
					return "ABAP Test Cockpit (ATC)";
				case "CI":
					return "Code Inspector";
				case "CDREV":
					return "Code Review";
				case "HLD":
					return "High Level Design";
				case "PBI":
					return "PBI";
				case "PREV":
					return "PBI Review";
				case "TCREV":
					return "Test Case Review";
				case "CT":
					return "Customer Case Testing";
				case "FIT":
					return "Internal Case Testing";
				default:
					return "";
			}
		},
		statusText: function(sStatus) {
			//var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			switch (sStatus) {
				case "E":
					return fnGetBundle(this).getText("projectStatusE");
				case "I":
					return fnGetBundle(this).getText("projectStatusI");
				case "S":
					return fnGetBundle(this).getText("projectStatusS");
				case "N":
					return fnGetBundle(this).getText("projectStatusN");
				case "P":
					return fnGetBundle(this).getText("projectStatusP");
				case "D":
					return fnGetBundle(this).getText("projectStatusD");
				default:
					return sStatus;
			}
		},

		amountWithCurrency: function(fAmount, sCurrency) {
			if (!fAmount || !sCurrency) {
				return "";
			}
			return fnGetBundle(this).getText("xfld.amount", [fnAmountFormatter.format(fAmount), sCurrency]);
		},

		amountWithOutCurrency: function(fAmount) {
			if (!fAmount) {
				return "";
			}
			return fnAmountFormatter.format(fAmount);
		},

		items: function(iItems) {
			if (isNaN(iItems)) {
				return "";
			}
			return (iItems === 1) ? fnGetBundle(this).getText("xfld.item") : fnGetBundle(this).getText("xfld.items", [iItems]);
		},

		deliveryDate: function(dDate) {
			if (!dDate) {
				return "";
			}
			return fnDeliveryDateFormatter.format(dDate);
		},

		orderedBy: function(sOrderedByName) {
			return sOrderedByName ? fnGetBundle(this).getText("xfld.orderedBy", [sOrderedByName]) : "";
		},

		deliveryDateAndLater: function(dDate, bLater) {
			if (!dDate) {
				return "";
			}
			var sDelDate = fnDeliveryDateFormatter.format(dDate);
			return bLater ? fnGetBundle(this).getText("xfld.andLater", [sDelDate]) : sDelDate;
		},

		appDataForTile: function(sTitle) {
			return {
				title: sTitle
			};
		},

		totalSum: function(aPurchaseOrders) {
			var i, fSum = 0;
			for (i = 0; i < aPurchaseOrders.length; i++) {
				fSum = fSum + parseFloat(aPurchaseOrders[i].GrossAmount, 10);
			}
			return me.amountWithOutCurrency(fSum);
		},

		currencyFromList: function(aPurchaseOrders) {
			return aPurchaseOrders.length ? aPurchaseOrders[0].CurrencyCode : "";
		},

		summaryTitle: function(aPurchaseOrders) {
			var iCount = aPurchaseOrders.length;
			return (iCount === 0) ? fnGetBundle(this).getText("xtit.summaryTitleWithoutCount") : fnGetBundle(this).getText("xtit.summaryTitle", [
				iCount
			]);
		},

		masterTitle: function(iCount) {
			return (iCount === 0) ? fnGetBundle(this).getText("xtit.masterTitleWithoutCount") : fnGetBundle(this).getText("xtit.masterTitle", [
				iCount
			]);
		},

		teamListTitle: function(iCount) {
			return (iCount === 0) ? fnGetBundle(this).getText("xtit.teamListTitleWithoutCount") : fnGetBundle(this).getText(
				"xtit.teamListTitle", [
					iCount
				]);
		},

		itemListTitle: function(iCount) {
			return (iCount === 0) ? fnGetBundle(this).getText("xtit.itemListTitleWithoutCount") : fnGetBundle(this).getText(
				"xtit.itemListTitle", [
					iCount
				]);
		},

		approvalTitle: function(aPurchaseOrders, bApprove) {
			var iCount = aPurchaseOrders.length;
			if (iCount > 1) {
				return fnGetBundle(this).getText(bApprove ? "xtit.massApprovalTitleForDialog" : "xtit.massRejectionTitleForDialog", [iCount]);
			} else {
				return fnGetBundle(this).getText(bApprove ? "xtit.approvalTitleForDialog" : "xtit.rejectionTitleForDialog");
			}
		},

		approvalText: function(aPurchaseOrders, bApprove) {
			if (aPurchaseOrders.length === 1) {
				return fnGetBundle(this).getText(bApprove ? "xfld.approvalTextWithSupplier" : "xfld.rejectionTextWithSupplier", [aPurchaseOrders[
					0].SupplierName]);
			} else {
				return fnGetBundle(this).getText(bApprove ? "xfld.approvalTextDifferentSuppliers" : "xfld.rejectionTextDifferentSuppliers");
			}
		}
	};
	return me;
});