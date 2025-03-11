(function ($) {
	// Globals
	"use strict";
	btnLoader();
	const uriPathName = window.location.pathname;
	const uriSegments = window.location.pathname.split('/');
	const locale = $("#datetime_picker_locale").val();
	const firstRentalDate = $("#first_rental_date").val();
	const endRentalDate = $("#end_rental_date").val();
	const lastRentalDate = $("#last_rental_date").val();
	const listDisableDatesPickUp = $("#disable_rental_dates_pick_up").val();
	const disabledDatesPickUp = listDisableDatesPickUp == undefined ? [] : listDisableDatesPickUp.split(',');
	const listDisableDatesDropOff = $("#disable_rental_dates_drop_off").val();
	const disabledDatesDropOff = listDisableDatesDropOff == undefined ? [] : listDisableDatesDropOff.split(',');
	const startDate = $("#search_start_date").val();
	const endDate = $("#search_end_date").val();
	
	rentalDate('.date-picker-start', locale, firstRentalDate, lastRentalDate, disabledDatesPickUp);
	rentalDate('.date-picker-end', locale, endRentalDate, null, disabledDatesDropOff);
	rentalTime('select.time-picker');
	if (uriSegments[2] == 'car-details') {
		rentalFunding();
	}
	searchLocation();
	addRemoveContainer();

	// Spinner
	var spinner = function () {
		setTimeout(function () {
			if ($('#spinner').length > 0) {
				$('#spinner').removeClass('show');
			}
		}, 1);
	};
	spinner();

	// Initiate the wowjs
	new WOW().init();

	// Sticky Navbar
	$(window).scroll(function () {
		if ($(this).scrollTop() > 300) {
			$('.sticky-top').addClass('shadow-sm').css('top', '0px');
		} else {
			$('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
		}
	});

	// Back to top button
	$(window).scroll(function () {
		if ($(this).scrollTop() > 300) {
			$('.back-to-top').fadeIn('slow');
		} else {
			$('.back-to-top').fadeOut('slow');
		}
	});
	$('.back-to-top').click(function () {
		$('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
		return false;
	});

	// Testimonials carousel
	$(".testimonial-carousel").owlCarousel({
		autoplay: true,
		smartSpeed: 1000,
		items: 1,
		dots: true,
		loop: true,
	});

	// Set drop off place equals to pick up place
	$(".place-pick-up").on("change", function () {
		// Globals
		let pickUpVal = $(this).val();
		$(".place-drop-off").val(pickUpVal).selectpicker('destroy').selectpicker('render');
	});

	//Disable submit button to avoid multiple requests
	$("#form-rental").on("submit", function () {
		// Globals
		$(this).find('button:submit').prop('disabled', true);
	});

	//Setup date range picker for Stays area
	$("#stay_date_in_out").flatpickr({
		mode: "range",
		minDate: "today",
		locale: locale,
		altInput: true,
		altFormat: "M j, Y",
		defaultDate: [startDate, endDate],
		onClose: function (selectedDates, dateStr, instance) {
			var datesSelected = dateStr.split(" → ");
			$("#search_start_date").val(datesSelected[0]);
			$("#search_end_date").val(datesSelected[1]);
		}
	});

	//Show/hide hint message for age selector
	$("select.guest_child_age").on('change', function () {
		// Globals
		let currentValue = $(this).val();
		guestData();

		if (currentValue != '') {
			$(this).closest('.child-age-container').find('.text-hint-age').addClass('d-none');
		} else {				
			$(this).closest('.child-age-container').find('.text-hint-age').removeClass('d-none');
		}
	});

	//Increase quantity in corresponding input
	$(document).on('click', '.plus', function () {
		var selectedInput = $(this).prev('.quantity-input');
		var maxVal = Number(selectedInput.attr('max'));
		if (selectedInput.val() < maxVal) {
			selectedInput[0].stepUp(1);

			//Display corresponding age selector if input affected is a children field
			if (selectedInput.hasClass('guest_child')) {
				childAgeSelector(selectedInput.closest('.room-container').find('.child-age-container'), selectedInput.val());
			}

			//Update guest data when changing adults and/or children number
			if ($(this).parent().hasClass('person-container')) {
				guestData();
			}
		}
	});

	//Decrease quantity in corresponding input
	$(document).on('click', '.minus', function () {
		var selectedInput = $(this).next('.quantity-input');
		var minVal = Number(selectedInput.attr('min'));
		if (selectedInput.val() > minVal) {
			selectedInput[0].stepDown(1);

			//Display corresponding age selector if input affected is a children field
			if (selectedInput.hasClass('guest_child')) {
				childAgeSelector(selectedInput.closest('.room-container').find('.child-age-container'), selectedInput.val());
			}

			//Update guest data when changing adults and/or children number
			if ($(this).parent().hasClass('person-container')) {
				guestData();
			}
		}
	});

	//Run events after ajax finishes
	$(document).ajaxComplete(function () {
		btnLoader();

		$("div.picker").on("mouseenter", function () {
			$("td.selectable").on("click", function (evt) {
				evt.stopImmediatePropagation();
				if (uriPathName != '/') {
					Utilities.rentalPrice();
				}
			});
		});
	});
})(jQuery);

//Show toast message window if proceed
var toastMsg = document.getElementById('msg-toast');
if (toastMsg != null) {
	var toast = new bootstrap.Toast(toastMsg);
	toast.show();
}

//Enable tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

//Enable popovers
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

//Display a loading icon on buttons
function btnLoader() {
	$(".btn-loader").on("click", function () {
		$(this).children('span').removeClass('d-none');
	});
}

//Enable funding checkbox, if apply
function rentalFunding() {
	//Globals
	let now = new Date($("#date_now").val());
	let fundingDaysLimit = Number($("#funding_days_limit").val());
	let carRentStart = new Date($("#car_rent_start").val());
	let fundingDateLimit = now.setDate(now.getDate() + fundingDaysLimit);

	if (fundingDateLimit < carRentStart.setDate(carRentStart.getDate())) {
		$("#car_rent_funding").prop('disabled', false);
	}
	else {
		$("#car_rent_funding").prop('disabled', true).prop('checked', false);
	}
}

//Initialize date picker
function rentalDate(selector, locale, startRentalDate, endRentalDate = null, disabledDates = []) {
	//Globals
	const defaultDate = $(selector).val() != '' ? $(selector).val() : startRentalDate;
	const timeSelector = $(selector).closest('.dt-container').find('select.time-picker');
	const dateTimeInput = $(selector).closest('.dt-container').find('.datetime-input');

	$(selector).flatpickr({
		defaultDate: defaultDate,
		minDate: startRentalDate,
		maxDate: endRentalDate,
		disable: disabledDates,
		locale: locale,
		altInput: true,
		altFormat: "M j, Y",
		dateFormat: "Y-m-d",
		onChange: function (selectedDates, dateStr, instance) {
			// Build date time string
			dateTimeInput.val(`${dateStr}T${timeSelector.val()}:00`);

			// Calculate min date for rental end date picker
			if (instance.element.id == 'car_rent_start_date') {
				getMinEndDate();

				if (uriSegments[2] == 'car-details') {
					rentalFunding();
				}
			}

			Utilities.rentalPrice();
		}
	});

	// Set corresponding date time value to output field
	const dateValue = $(selector).val();
	const timeSrt = timeSelector.val() || '12:00';
	dateTimeInput.val(`${dateValue}T${timeSrt}:00`);
}

//Setup rental time dropdown
function rentalTime(selector, defaultDate = null) {
	$(selector).each(function () {
		//Globals
		let selectedDate = '12:00';
		const dateSelector = $(this).closest('.dt-container').find('.date-picker[type="hidden"]');
		const dateTimeInput = $(this).closest('.dt-container').find('.datetime-input');

		// Define default selected date
		if (defaultDate != null) {
			selectedDate = defaultDate;
		} else if ($(this).val() != '') {
			selectedDate = $(this).val();
		}

		$(this).val(selectedDate).selectpicker('destroy').selectpicker('render');

		// Build date time string
		dateTimeInput.val(`${dateSelector.val()}T${selectedDate}:00`);

		// Set corresponding date time value to output field
		$(this).on('change', function () {
			// Build date time string
			dateTimeInput.val(`${dateSelector.val()}T${$(this).val()}:00`);

			// Calculate min date for rental end date picker
			if ($(this).attr('id') == 'car_rent_start_time') {
				rentalTime('select.time-picker-end', $(this).val());
			}

			Utilities.rentalPrice();
		});
	});
}

//Calculate min date for rental end date picker
function getMinEndDate() {
	const locale = $("#datetime_picker_locale").val();
	const uriMinDays = $("#uri_min_days").val();
	const carRentStart = $("#car_rent_start_date").closest('.dt-container').find('.datetime-input').val();
	const timePickerStart = $("select.time-picker-start").val();
	const listDisableDatesDropOff = $("#disable_rental_dates_drop_off").val();
	const disabledDatesDropOff = listDisableDatesDropOff == undefined ? [] : listDisableDatesDropOff.split(',');
	$("#date-end-container").addClass('d-none');
	$("#date-end-loader").removeClass('d-none');
	$(".date-picker-end").val('');

	$.ajax({
		url: uriMinDays,
		data: {
			start_rental_date: carRentStart
		},
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	})
		.done(function (data) {
			$("#date-end-loader").addClass('d-none');
			$("#date-end-container").removeClass('d-none');
			rentalTime('select.time-picker-end', timePickerStart);
			rentalDate('.date-picker-end', locale, data, null, disabledDatesDropOff);
		});
}

//Search location
function searchLocation() {
	//Globals
	var xhr;

	//Trigger the callback on keyup event
	$("#stay_location").on("keyup", function () {
		//Globals
		let dataListElements = '';
		const locationReference = $(this).val();
		const dataListContainer = $("#dropdown-location").find('.dropdown-menu');
		const dropdownHeading = $("#dropdown-location").find('.dropdown-heading');
		const searchLoader = $("#stay-location-loader");
		const uriSearch = $("#uri_search_location").val();
		dataListContainer.find('li:not(:first-child)').remove();
		$("#search_location_type").val(null);
		$("#search_location_id").val(null);

		//Abort any pending request
		if (xhr != null) {
			xhr.abort();
		}

		//Search if the length of the name provided is >= 3 characters
		if (locationReference.length >= 3) {
			searchLoader.removeClass('d-none');
			dropdownHeading.addClass('d-none');

			xhr = $.ajax({
				url: uriSearch,
				headers: {
					'X-Requested-With': 'XMLHttpRequest'
				},
				data: {
					srf: locationReference
				},
				dataType: 'json'
			})
				.done(function (jsonData) {
					//Globals
					searchLoader.addClass('d-none');

					//Check result and build the elements list
					if (jsonData.length > 0) {
						for (let i = 0; i < jsonData.length; i++) {
							switch (jsonData[i].location_type) {
								case 2:
									dataListElements += `<li><a href="javascript:void(0)" class="dropdown-item text-wrap py-2" data-location-type="${jsonData[i].location_type}" data-location-id="${jsonData[i].location_id}" data-location-uri="${jsonData[i].location_uri}" data-accommodation-name="${jsonData[i].accommodation_name}" data-zone-name="${jsonData[i].zone_name}" data-destination-name="${jsonData[i].destination_name}" data-country-name="${jsonData[i].country_name}"><div class="d-flex align-content-center flex-row"><div class="align-self-center h4 mb-0 me-2"><i class="bi bi-geo-alt"></i></div><div class="align-self-center lh-sm"><span class="fw-bold">${truncate(jsonData[i].zone_name, 36)}</span><br><small class="text-muted">${jsonData[i].destination_name}, ${jsonData[i].country_name}</small></div></div></a></li>\n`
									break;
								case 3:
									dataListElements += `<li><a href="javascript:void(0)" class="dropdown-item text-wrap py-2" data-location-type="${jsonData[i].location_type}" data-location-id="${jsonData[i].location_id}" data-location-uri="${jsonData[i].location_uri}" data-accommodation-name="${jsonData[i].accommodation_name}" data-zone-name="${jsonData[i].zone_name}" data-destination-name="${jsonData[i].destination_name}" data-country-name="${jsonData[i].country_name}"><div class="d-flex align-content-center flex-row"><div class="align-self-center h4 mb-0 me-2"><i class="bi bi-building"></i></div><div class="align-self-center lh-sm"><span class="fw-bold">${truncate(jsonData[i].accommodation_name, 36)}</span><br><small class="text-muted">${jsonData[i].destination_name}, ${jsonData[i].country_name}</small></div></div></a></li>\n`
									break;
								default:
									dataListElements += `<li><a href="javascript:void(0)" class="dropdown-item text-wrap py-2" data-location-type="${jsonData[i].location_type}" data-location-id="${jsonData[i].location_id}" data-location-uri="${jsonData[i].location_uri}" data-accommodation-name="${jsonData[i].accommodation_name}" data-zone-name="${jsonData[i].zone_name}" data-destination-name="${jsonData[i].destination_name}" data-country-name="${jsonData[i].country_name}"><div class="d-flex align-content-center flex-row"><div class="align-self-center h4 mb-0 me-2"><i class="bi bi-geo-alt"></i></div><div class="align-self-center lh-sm"><span class="fw-bold">${truncate(jsonData[i].destination_name, 36)}</span><br><small class="text-muted">${jsonData[i].country_name}</small></div></div></a></li>\n`
									break;
							}
						}

						dataListContainer.append(dataListElements);

						//Proceed to autocomplete fields on click elements event
						dataListContainer.find('a').on("click", function () {
							//Globals
							let locationType = $(this).attr('data-location-type');
							let locationId = $(this).attr('data-location-id');
							let locationUri = $(this).attr('data-location-uri');
							let accommodationName = $(this).attr('data-accommodation-name');
							let zoneName = $(this).attr('data-zone-name');
							let destinationName = $(this).attr('data-destination-name');
							let countryName = $(this).attr('data-country-name');
							let locationValue = '';

							// Build location input value
							switch (locationType) {
								case '2':
									locationValue = zoneName + ', ' + destinationName + ', ' + countryName;
									break;
								case '3':
									locationValue = accommodationName + ', ' + zoneName + ', ' + destinationName + ', ' + countryName;
									break;
								default:
									locationValue = destinationName + ', ' + countryName;
									break;
							}

							$(this).closest('.dropdown').find('input').val(locationValue);
							$("#destination").val(locationUri);
							$("#search_location_type").val(locationType);
							$("#search_location_id").val(locationId);
						});
					}
					else {
						dropdownHeading.removeClass('d-none');
					}
				});
		}
		else {
			searchLoader.addClass('d-none');
			dropdownHeading.removeClass('d-none');
		}
	});
}

//Truncate string
function truncate(str, n) {
	if (str.length > n) {
		return str.slice(0, n) + "...";
	} else {
		return str;
	}
}

//Calculate and display corresponding guest data
function guestData() {
	//Globals
	let roomText = $("#text_locale_room").val();
	let personText = $("#text_locale_person").val();
	let totalRoom = $(".room-container").not('.d-none').length;
	let adultCount = 0, childCount = 0, roomCount = 0;
	let adultsList = [], childrenList = [];

	$(".room-container").not('.d-none').each(function () {
		roomCount++;
		adultCount += Number($(this).find('.guest_adult').val());
		childCount += Number($(this).find('.guest_child').val());
		adultsList.push(Number($(this).find('.guest_adult').val()));
		$(this).find('.child-age-container').not('.d-none').find('select.guest_child_age').each(function () {
			childrenList.push(roomCount + "_" + $(this).val());
		});
	});

	$("#search_room").val(totalRoom);
	$("#stay_guest").val(totalRoom + " " + roomText + " - " + (adultCount + childCount) + " " + personText);
	$("#search_adult").val(adultsList.toString());
	$("#search_child").val(childrenList.toString());
}

//Display corresponding child age selectors
function childAgeSelector(childAgeContainer, totalChild) {
	//Globals
	childAgeContainer.each(function (index) {
		if (Number(totalChild) >= index + 1) {
			$(this).find('select').prop('disabled', false).selectpicker('destroy').selectpicker('render');
			$(this).removeClass('d-none');
		} else {
			$(this).addClass('d-none');
		}
	});
}

//Show/Hide container from a group
function addRemoveContainer() {
	//Show container
	$("#btn-container-add").on("click", function (evt) {
		//Globals
		evt.stopImmediatePropagation();
		let containerCount = Number($("#container_counter").val());
		let containerSelector = $(this).attr('data-target');
		let containerTotal = $(".container-wrap").length;
		$("#btn-container-remove").removeClass('d-none');

		if (containerCount < containerTotal) {
			let containerIndex = containerCount + 1;
			$(containerSelector + containerIndex).removeClass('d-none').find('input, select').prop('disabled', false);
			$(containerSelector + containerIndex).find('select').selectpicker('destroy').selectpicker('render');
			$("#container_counter").val(containerIndex);
		}
		if (containerTotal <= containerCount + 1) {
			$(this).addClass('d-none');
		}

		guestData();
	});

	//Hide container and reset form elements values
	$("#btn-container-remove").on("click", function (evt) {
		//Globals
		evt.stopImmediatePropagation();
		let containerCount = Number($("#container_counter").val());
		let containerSelector = $(this).attr('data-target');
		$("#btn-container-add").removeClass('d-none');

		if (containerCount > 1) {
			$(containerSelector + containerCount).addClass('d-none').find('input, select').prop('disabled', true);
			$(containerSelector + containerCount).find('input, select').not('.keep-value').val(null);
			$(containerSelector + containerCount).find('.subcontainer-wrap').addClass('d-none');
			$("#container_counter").val(containerCount - 1);

			//Reset numeric inputs to a predefined value if apply
			$(containerSelector + containerCount).find('input[type="number"]').each(function () {
				let numericDefaultValue = $(this).attr('min');

				if ($(this).hasClass('keep-value') == false) {
					$(this).val(numericDefaultValue);
				}
			});
		}
		if (containerCount - 1 == 1) {
			$(this).addClass('d-none');
		}

		guestData();
	});
}

//Hide GCM banner
function hideBanner() {
	document.getElementById('cookie-consent-banner').style.display = 'none';
}

//Trigger and save action selected
if (localStorage.getItem('consentMode') === null) {
	document.getElementById('btn-accept-all').addEventListener('click', function () {
		setConsent({
			necessary: true,
			preferences: true,
			marketing: true
		});
		hideBanner();
	});
	document.getElementById('btn-accept-some').addEventListener('click', function () {
		setConsent({
			necessary: true,
			preferences: document.getElementById('consent-preferences').checked,
			marketing: document.getElementById('consent-marketing').checked
		});
		hideBanner();
	});
	document.getElementById('btn-reject-all').addEventListener('click', function () {
		setConsent({
			necessary: false,
			preferences: false,
			marketing: false
		});
		hideBanner();
	});
	document.getElementById('cookie-consent-banner').style.display = 'block';
}
else {
	hideBanner();
}

//Save GCM values
function setConsent(consent) {
	const consentMode = {
		'functionality_storage': consent.necessary ? 'granted' : 'denied',
		'security_storage': consent.necessary ? 'granted' : 'denied',
		'ad_storage': consent.marketing ? 'granted' : 'denied',
		'analytics_storage': 'granted',
		'ad_user_data': consent.preferences ? 'granted' : 'denied',
		'ad_personalization': consent.marketing ? 'granted' : 'denied'
	};
	gtag('consent', 'update', consentMode);
	localStorage.setItem('consentMode', JSON.stringify(consentMode));
}

//Definition of utilities methods to be used across the system
let Utilities = function () {
	return {
		//Function to get rental price according to selected criteria
		rentalPrice: function () {
			//Globals
			$("#rental-pricing, #rental-tax-drop-off, #rental-price-error, .rental-age-fee, .rental-discount, .full-tank-price, .office-price").hide();
			$("dt.rental-age-fee, #rental-price, #rental-days, #partial-price, dt.rental-discount, dt.full-tank-price, dt.office-price").empty();
			$("#car_rent_price").val(null);
			$("#loader-car-rent-price").removeClass('d-none');

			//Trigger AJAX
			setTimeout(() => {
				//Globals
				let carModelId = $("#car_model_id").val();
				let carRentStart = $("#car_rent_start").val();
				let carRentEnd = $("#car_rent_end").val();
				let officePickUp = $("#car_office_pick_up").val();
				let officeDropOff = $("#car_office_drop_off").val();
				let clientBirthday = $("#member_birthday").val();

				if (carModelId != '' && carRentEnd != '') {
					$.ajax({
						url: 'cars/rental_price?cmo=' + carModelId + '&crs=' + carRentStart + '&cre=' + carRentEnd + '&opu=' + officePickUp + '&odo=' + officeDropOff + '&cbd=' + clientBirthday,
						dataType: "json",
						headers: {
							'X-Requested-With': 'XMLHttpRequest'
						}
					})
						.done(function (data) {
							$("#loader-car-rent-price").addClass('d-none');
							if (data == null || data.rental_price_value == 0) {
								$("#rental-price-error").show();
								$("#car_rent_condition").prop('disabled', true);
								$("#btn-rental").prop('disabled', true);
							}
							else {
								if (data.age_price_value > 0) {
									$("dt.rental-age-fee").text(data.age_price);
									$(".rental-age-fee").show();
								}
								if (data.full_tank_price_value > 0) {
									$("dt.full-tank-price").text(data.full_tank_price);
									$(".full-tank-price").show();
								}
								if (data.office_price_pick_up_value > 0) {
									$("dt.office-price").text(data.office_price_pick_up);
									$(".office-price").show();
								}
								if (data.office_price_pick_up_value == 0 && data.office_price_drop_off_value > 0) {
									$("#rental-tax-drop-off").show();
								}
								if (data.discount_type > 0) {
									$("dt.rental-discount").text(`-${data.rental_discount}`);
									$(".rental-discount").show();
								}
								$("#rental-price").text(data.rental_price);
								$("#partial-price").text(data.partial_price);
								$("#rental-days").text(data.rental_days);
								$("#car_rent_price").val(data.rental_price_value);
								$("#rental-pricing").show();
								$("#car_rent_condition").prop('disabled', false);
							}
						})
						.fail(function () {
							$("#loader-car-rent-price").addClass('d-none');
							$("#rental-price-error").show();
							$("#car_rent_condition").prop('disabled', true);
						});
				}
			}, 500);
		},
		//Function to read a cookie
		getCookie: function (cName) {
			let name = cName + "=";
			let ca = document.cookie.split(';');
			for (let i = 0; i < ca.length; i++) {
				let c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length, c.length);
				}
			}
			return null;
		}
	};
}();