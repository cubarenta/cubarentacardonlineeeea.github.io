(function ($) {
	// Globals
	var uriPathName = window.location.pathname.split('/');
	var cookieGtagViewItem = Utilities.getCookie('gtag_view_item');
	var cookieGtagViewItemList = Utilities.getCookie('gtag_view_item_list');
	var cookieGtagPurchase = Utilities.getCookie('gtag_purchase');

	if (uriPathName[2] != 'cars') {
		Utilities.rentalPrice();
	}

	//Trigger rental price calculation
	$("#car_office_pick_up, #car_office_drop_off, #member_birthday").on("change", function () {
		// Globals
		Utilities.rentalPrice();
	});

	//Add an input mask to birthday field and trigger rental price function if apply
	$("#member_birthday").inputmask({
		alias: "datetime",
		inputFormat: "dd/mm/yyyy",
		"oncomplete": function () {
			Utilities.rentalPrice();
		},
		"oncleared": function () {
			Utilities.rentalPrice();
		}
	});

	//Verify whether reservation conditions checkbox is checked or not
	$("#car_rent_condition").on("click", function () {
		if ($(this).prop('checked') === true) {
			$(this).closest('form').find('button[type="submit"]').prop('disabled', false);
		}
		else {
			$(this).closest('form').find('button[type="submit"]').prop('disabled', true);
		}
	});

	//Implement Google Tag ViewItem event
	if (cookieGtagViewItem != null && uriPathName[2] != 'cars' && typeof gtag === 'function') {
		let jsonGtagViewItem = JSON.parse(decodeURIComponent(cookieGtagViewItem));
		gtag("event", "view_item", {
			currency: jsonGtagViewItem.currency,
			value: jsonGtagViewItem.value,
			items: [{
				item_id: jsonGtagViewItem.item_id,
				item_name: jsonGtagViewItem.item_name,
				affiliation: jsonGtagViewItem.affiliation,
				item_brand: jsonGtagViewItem.item_brand,
				item_category: jsonGtagViewItem.item_category,
				item_category2: jsonGtagViewItem.item_category2,
				quantity: 1
			}]
		});
	}

	//Implement Google Tag ViewItem event
	if (cookieGtagViewItemList != null && typeof gtag === 'function') {
		let jsonGtagViewItems = JSON.parse(decodeURIComponent(cookieGtagViewItemList));
		gtag("event", "view_item_list", {
			item_list_name: "Cars",
			items: jsonGtagViewItems
		});
	}

	//Implement Google Tag Purchase event
	if (cookieGtagPurchase != null && uriPathName[2] != 'cars' && typeof gtag === 'function') {
		let jsonGtagPurchase = JSON.parse(decodeURIComponent(cookieGtagPurchase));
		gtag("event", "purchase", {
			transaction_id: jsonGtagPurchase.transaction_id,
			value: jsonGtagPurchase.value,
			currency: jsonGtagPurchase.currency,
			items: [
				{
					item_id: jsonGtagPurchase.item_id,
					item_name: jsonGtagPurchase.item_name,
					affiliation: jsonGtagPurchase.affiliation,
					item_brand: jsonGtagPurchase.item_brand,
					item_category: jsonGtagPurchase.item_category,
					item_category2: jsonGtagPurchase.item_category2,
					quantity: 1
				}]
		});
	}
})(jQuery);