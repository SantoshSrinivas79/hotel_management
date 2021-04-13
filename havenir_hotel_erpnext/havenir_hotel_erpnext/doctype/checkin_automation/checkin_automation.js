// Copyright (c) 2021, Havenir and contributors
// For license information, please see license.txt

frappe.ui.form.on('Checkin Automation', {
	// refresh: function(frm) {

	// }
});

cur_frm.fields_dict['select_hotel_room_reservation'].get_query = function(doc){
	return {
		filters:[
			["status", "=","Booked"]
		]
	}
}