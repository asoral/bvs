// Copyright (c) 2018, VHRS and contributors
// For license information, please see license.txt

frappe.ui.form.on("Verify Address Check3", {
    after_save: function (frm) {
        if (frm.doc.status == "QC Completed") {
            frappe.call({
                "method": "bvs.background_verification.doctype.applicant.applicant.get_checks_group",
                args: {
                    "applicant": frm.doc.applicant_id,
                    "checks_group": frm.doc.checks_group,
                    "doctype": doctype.name,
                    "check_status": frm.doc.status
                },
                callback: function (r) {
                    if (frm.doc.status == "QC Completed") {
                        if (r.message.doctype) {
                            if (r.message.status != frm.doc.status) {
                                frappe.set_route('Form', r.message.doctype, r.message.name);
                            }
                        } else if (r.message != "Completed") {
                            frappe.set_route('Form', r.message, 'New ' + r.message, { "tat": frm.doc.tat, "applicant_name": frm.doc.applicant_name, "customer": frm.doc.customer, "checks_group": frm.doc.checks_group, "applicant_id": frm.doc.applicant_id });
                        } else if (r.message == "Completed") {
                            frappe.set_route('Form', "Applicant", frm.doc.applicant_id);
                        }
                    } else {
                        if (r.message.doctype) {
                            if (r.message.status != frm.doc.status) {
                                frappe.set_route('Form', r.message.doctype, r.message.name);
                            }
                        } else if (r.message != "Completed") {
                            frappe.set_route('Form', r.message, 'New ' + r.message, { "tat": frm.doc.tat, "applicant_name": frm.doc.applicant_name, "customer": frm.doc.customer, "checks_group": frm.doc.checks_group, "applicant_id": frm.doc.applicant_id });
                        } else if (r.message == "Completed") {
                            frappe.set_route('Form', "Applicant", frm.doc.applicant_id);
                        }
                    }
                }
            })
        }
        if ((frm.doc.status == "Execution Completed") && ((frm.doc.result == "Positive") || (frm.doc.result == "Negative") || (frm.doc.result == "Amber") || (frm.doc.result == "Insufficient"))) {
            frappe.set_route("List", "Verify Address Check3");
        }
        if (frm.doc.tat) {
            frm.set_df_property('tat', 'read_only', 1);
        }
    },
    onload: function (frm) {
        frappe.call({
            "method": "bvs.background_verification.doctype.verify_address_check3.verify_address_check3.get_check",
            args: {
                applicant_id: frm.doc.applicant_id
            },
            callback: function (r) {
                $.each(r.message, function (i, d) {
                    if (r.message) {
                        frm.set_value("address_check3_id", d.name);
                    }
                });
            }

        });
    },
    validate: function (frm) {
        // if(!frm.doc.client_tat){
        // 	frappe.call({
        // 		"method": "bvs.background_verification.doctype.verify_employment_check1.verify_employment_check1.get_client_tat",
        // 		args: {
        // 			checks_group: frm.doc.checks_group
        // 		},
        // 		callback: function(r){
        // 			$.each(r.message, function(i, d) {
        // 				if(r.message){
        // 					frm.set_value("client_tat", r.message.tat1)							
        // 					if(frm.doc.client_tat){
        // 						frm.set_df_property('client_tat', 'read_only', 1);
        // 						var tomorrow = moment(frm.doc.in_date).add(frm.doc.client_tat, 'days');
        // 						frm.set_value("actual_end_date_for_client_tat", tomorrow);
        // 						if(frm.doc.actual_end_date_for_client_tat.get > frappe.datetime.nowdate()){
        // 							$(cur_frm.fields_dict.actual_end_date_for_client_tat.input).css("borderColor", "Magenta");
        // 						} else if(frm.doc.actual_end_date_for_client_tat.get = frappe.datetime.nowdate()){
        // 							$(cur_frm.fields_dict.actual_end_date_for_client_tat.input).css("borderColor", "Magenta");
        // 							frappe.msgprint("Today is Client TAT End Day")
        // 						}else{
        // 							$(cur_frm.fields_dict.actual_end_date_for_client_tat.input).css("borderColor", "Red");
        // 						}
        // 					}
        // 				}
        // 			});
        // 		}

        // 	});
        // }
        if (frm.doc.tat) {
            frm.set_df_property('tat', 'read_only', 1);
        }
        // if(frm.doc.checks_group){
        // 	var tomorrow = moment(frm.doc.in_date).add(frm.doc.tat, 'days');
        // 	frm.set_value("actual_end_date", tomorrow);
        // 	var diff = frm.doc.actual_end_date - frappe.datetime.nowdate();
        // 	if(frm.doc.actual_end_date.get > frappe.datetime.nowdate()){
        // 		$(cur_frm.fields_dict.actual_end_date.input).css("borderColor", "Blue");
        // 	} else if(frm.doc.actual_end_date.get = frappe.datetime.nowdate()){
        // 		$(cur_frm.fields_dict.actual_end_date.input).css("borderColor", "Blue");
        // 		frappe.msgprint("Today is TAT End Day")
        // 	}else{
        // 		$(cur_frm.fields_dict.actual_end_date.input).css("borderColor", "Red");
        // 	}
        // }
        if ((frm.doc.result == "Positive") || (frm.doc.result == "Negative") || (frm.doc.result == "Amber") || (frm.doc.result == "Insufficient")) {
            frm.set_value("end_date", (frappe.datetime.nowdate()))
        }
        if (frm.doc.executive == frappe.session.user) {
            if (frm.doc.allocated_for == "QC Pending") {
                frm.set_value("status", "QC Completed")
                frm.set_value("allocated_for", "QC Completed")
            }
            if (frm.doc.allocated_for == "Execution Pending" || frm.doc.status == "Execution Completed") {
                frm.set_value("status", "Execution Completed")
                frappe.call({
                    "method": "bvs.background_verification.doctype.applicant.applicant.update_status",
                    args: {
                        "applicant": frm.doc.applicant_id,
                        "checks_group": frm.doc.checks_group
                    },
                    callback: function (r) {
                        if (r.message == "OK") {
                            frappe.set_route("List", "Verify Address Check3");
                        }
                    }
                })
            }
        }
    },
    refresh: function (frm) {
        frm.set_df_property('applicant_id', 'read_only', 1);
        frm.set_df_property('applicant_name', 'read_only', 1);
        if (frm.doc.allocated_for) {
            $(cur_frm.fields_dict.allocated_for.input).css("backgroundColor", "DeepPink");
        }
        if (frm.doc.fields != "Updated") {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Address Check3",
                    filters: {
                        "name": frm.doc.address_check3_id
                    }
                },
                callback: function (r) {
                    if (r.message) {
                        frm.set_value('ver_address_line1', r.message.address_line1);
                        frm.set_value('ver_address_line2', r.message.address_line2);
                        frm.set_value('ver_address_line3', r.message.address_line3);
                        frm.set_value('ver_talukdistrict', r.message.talukdistrict);
                        frm.set_value('ver_city', r.message.city);
                        frm.set_value('ver_state', r.message.state);
                        frm.set_value('ver_country', r.message.country);
                        frm.set_value('ver_pincode', r.message.pincode);
                        frm.set_value("fields", "Updated");
                    }
                }
            })
        }
        if ((frm.doc.allocated_for == "QC Pending") || (frm.doc.status == "QC Completed")) {
            frm.set_df_property('ver_address_line1', 'read_only', 0);
            frm.set_df_property('ver_address_line2', 'read_only', 0);
            frm.set_df_property('ver_address_line3', 'read_only', 0);
            frm.set_df_property('ver_talukdistrict', 'read_only', 0);
            frm.set_df_property('ver_city', 'read_only', 0);
            frm.set_df_property('ver_state', 'read_only', 0);
            frm.set_df_property('ver_country', 'read_only', 0);
            frm.set_df_property('ver_pincode', 'read_only', 0);
        }
    }

});
