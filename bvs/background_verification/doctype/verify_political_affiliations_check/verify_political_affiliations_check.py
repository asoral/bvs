# -*- coding: utf-8 -*-
# Copyright (c) 2019, VHRS and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document


class VerifyPoliticalAffiliationsCheck(Document):
    pass


@frappe.whitelist()
def get_check(applicant_id):
    civil_check_id = frappe.get_list(
        "Political Affiliations Check", filters={"applicant_id": applicant_id}, fields=("name"))
    # frappe.errprint(employment_check1_id)
    return civil_check_id
