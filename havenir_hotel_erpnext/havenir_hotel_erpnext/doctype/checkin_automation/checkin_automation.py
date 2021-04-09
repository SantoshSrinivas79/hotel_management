# -*- coding: utf-8 -*-
# Copyright (c) 2021, Havenir and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CheckinAutomation(Document):
	pass

@frappe.whitelist()
def on_submit(self, method):
	print(self.select_hotel_room_reservation)
	reservation = frappe.get_doc("Hotel Room Reservation", self.select_hotel_room_reservation)
	guest = frappe.get_doc("Hotel Guests", reservation.guest_name)
	for d in reservation.selected_room:
		frappe.get_doc({
			"doctype":"Hotel Check In",
			"guest_id":guest.name,
			"check_in":frappe.utils.now(),
			"company":"Hotel" or None,
			"posting_date":frappe.utils.now(),
			"passport_no": guest.passport_no,
			"cnic":guest.cnic,
			"contact_no":guest.contact_no,
			"guest_name":guest.guest_name,
			"rooms":[{
				"room_no":d.room,
				"room_type":d.room_type,
				"price":0,
				"male":d.male,
				"female":d.female,
				"children":d.children,
				"extra_bed_issued":d.extra_beds,
			}]
		}).submit()