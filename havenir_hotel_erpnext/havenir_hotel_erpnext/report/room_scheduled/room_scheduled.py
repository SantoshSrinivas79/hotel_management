# Copyright (c) 2013, Havenir and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
	columns, data = [], []
	result = frappe.db.sql("select * from `tabRoom Scheduled`", as_dict=1)
	columns = [{
		"fieldname": "rooms",
		"label": _("Room"),
		"fieldtype": "Link",
		"options":"Rooms"
	},{
		"fieldname": "date_scheduled",
		"label": _("Date Scheduled"),
		"fieldtype": "Datetime",
	},
	{
		"fieldname": "status",
		"label": _("Status"),
		"fieldtype": "data",
	}]

	for i in result:
		data.append([
			i.room,
			i.date_scheduled,
			i.status
		])
	return columns, data

