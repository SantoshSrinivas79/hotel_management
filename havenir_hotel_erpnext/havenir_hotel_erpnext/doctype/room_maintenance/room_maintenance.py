# -*- coding: utf-8 -*-
# Copyright (c) 2021, Havenir and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import date_diff, add_days, flt

class RoomMaintenance(Document):
	def on_submit(self):
		for i in range(date_diff(self.end_date, self.start_date) + 1):
			day = add_days(self.start_date, i)
			frappe.get_doc({
				"doctype":"Room Scheduled",
				"employee":self.employee,
				"room":self.room,
				"date_scheduled":day,
				"status":"House Keep",
				"parent":self.name
			}).save()
	def on_cancel(self):
		return frappe.db.sql("UPDATE `tabRoom Scheduled` set status='Canceled' where parent = %s", self.name)