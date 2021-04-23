# -*- coding: utf-8 -*-
# Copyright (c) 2021, Havenir and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CheckinAutomation(Document):
	def on_cancel(self):
		frappe.db.sql("UPDATE `tabRoom Scheduled` set color='#ffb1b1', status='Booked' where parent =%s", self.select_hotel_room_reservation)
		frappe.db.sql("DELETE FROM `tabHotel Check In` where parent =%s", self.name)
		reservation = frappe.get_doc("Hotel Room Reservation", self.select_hotel_room_reservation)
		for d in reservation.selected_room:
			frappe.db.sql("UPDATE `tabRooms` set room_status='Available' where name =%s",d.room)

@frappe.whitelist()
def on_submit(self, method):
	print(self.select_hotel_room_reservation)
	reservation = frappe.get_doc("Hotel Room Reservation", self.select_hotel_room_reservation)
	guest = frappe.get_doc("Hotel Guests", reservation.guest_name)
	check_id = frappe.db.sql("select name from `tabHotel Check In` where reservation_id =%s", self.select_hotel_room_reservation, as_dict=1)
	print(check_id)
	if check_id != []:
		return frappe.throw("Reservation ID are already Check In")

	for d in reservation.selected_room:
		docs = frappe.get_doc({
			"doctype":"Hotel Check In",
			"guest_id":guest.name,
			"check_in":frappe.utils.now(),
			"company":reservation.company,
			"posting_date":frappe.utils.now(),
			"passport_no": guest.passport_no,
			"cnic":guest.cnic,
			"contact_no":guest.contact_no,
			"guest_name":guest.guest_name,
			"reservation_id": self.select_hotel_room_reservation,
			"parent":self.name,
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
		frappe.msgprint("Created Check In")
		frappe.db.sql("UPDATE `tabRoom Scheduled` set status ='Checked In', color='#a83333' WHERE parent = %s", (self.select_hotel_room_reservation))	