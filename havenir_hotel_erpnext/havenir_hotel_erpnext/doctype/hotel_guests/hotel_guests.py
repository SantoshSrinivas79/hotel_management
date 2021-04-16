# -*- coding: utf-8 -*-
# Copyright (c) 2020, Havenir and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class HotelGuests(Document):
	 def validate(self):
		 customer = frappe.db.sql("SELECT * FROM `tabCustomer` WHERE customer_name  =%s",self.guest_name, as_dict=1)
		 if customer == []:
			 doc = frappe.get_doc({
					'doctype':'Customer',
					'customer_name':self.guest_name,
					'customer_type':'Individual',
					'customer_group':'All Customer Groups',
					'territory':'All Territories'
				}).save()
			 frappe.msgprint("Created Customer named:"+self.guest_name)
