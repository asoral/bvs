// Copyright (c) 2018, VHRS and contributors
// For license information, please see license.txt

frappe.ui.form.on("Verify Pan Verification", {
	after_save: function(frm) {
		if(frm.doc.status == "QC Completed"){
			frappe.confirm(
				'Do you want to attach the File?',
				function(){
					window.close();
				},
				function(){
					frappe.call({
						"method": "bvs.background_verification.doctype.applicant.applicant.get_checks_group",
						args:{
							"applicant": frm.doc.applicant_id,
							"checks_group": frm.doc.checks_group,
							"doctype": doctype.name,
							"check_status": frm.doc.status
						},
						callback: function(r){
							if(frm.doc.status == "QC Completed"){
								if(r.message.doctype){
									if(r.message.status != frm.doc.status) {
										frappe.set_route('Form',r.message.doctype,r.message.name);
									}
								} else if(r.message != "Completed"){
									frappe.set_route('Form',r.message,'New '+r.message,{"tat": frm.doc.tat,"applicant_name": frm.doc.applicant_name,"customer":frm.doc.customer,"checks_group":frm.doc.checks_group,"applicant_id":frm.doc.applicant_id});
								} else if(r.message == "Completed"){
									frappe.set_route('Form',"Applicant",frm.doc.applicant_id);
								}
							} else {
								if(r.message.doctype){
									if(r.message.status != frm.doc.status) {
										frappe.set_route('Form',r.message.doctype,r.message.name);
									}
								} else if(r.message != "Completed"){
									frappe.set_route('Form',r.message,'New '+r.message,{"tat": frm.doc.tat,"applicant_name": frm.doc.applicant_name,"customer":frm.doc.customer,"checks_group":frm.doc.checks_group,"applicant_id":frm.doc.applicant_id});
								} else if(r.message == "Completed"){
									frappe.set_route('Form',"Applicant",frm.doc.applicant_id);
								}
							}
						}
					})
				}
			)			
		}  
	},
	onload:function(frm){
		if(!frm.doc.in_date){
            frm.set_value("in_date",(frappe.datetime.nowdate()));
		}
		frappe.call({
			"method": "bvs.background_verification.doctype.verify_pan_verification.verify_pan_verification.get_check",
			args: {
				applicant_id: frm.doc.applicant_id
			},
			callback: function(r){
				$.each(r.message, function(i, d) {
					if(r.message){
						frm.set_value("pan_verification_id", d.name);
					}
				});
			}

		});
	},
	validate:function(frm){
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
		if(frm.doc.tat){
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
		if((frm.doc.result == "Positive")|| (frm.doc.result == "Negative") || (frm.doc.result == "Amber") || (frm.doc.result == "Insufficient")){
			frm.set_value("end_date",(frappe.datetime.nowdate()))
		}
		if(frm.doc.executive == frappe.session.user){
			if(frm.doc.allocated_for == "QC Pending"){
				frm.set_value("status","QC Completed")
				frm.set_value("allocated_for","QC Completed")
			}
			if(frm.doc.allocated_for == "Execution Pending"){
				frm.set_value("status","Execution Completed")		
				frappe.call({				
					"method": "bvs.background_verification.doctype.applicant.applicant.get_status",
					args: {
						"applicant":frm.doc.applicant_id,
						"checks_group": frm.doc.checks_group
					},
					callback: function(r){
						if(r.message){
							frappe.call({
								"method": "frappe.client.set_value",
								"args": {
								"doctype": "Applicant",
								"name": frm.doc.applicant_id,
								"fieldname": "status",
								"value": r.message
								}
							});
						}
					}
				})
			}
		}
		if(frm.doc.status == "Execution Completed"){
			if((frm.doc.result == "Positive") || (frm.doc.result == "Negative") || (frm.doc.result == "Amber")){
				frappe.set_route("List", "Verifier Dashboard");
		    }
		}
	},
	refresh: function(frm){
		if(frm.doc.allocated_for){
			$(cur_frm.fields_dict.allocated_for.input).css("backgroundColor","DeepPink");
		}
		if(frm.doc.applicant_id){
			frappe.call({
				"method":"frappe.client.get",
				args:{
					doctype: "Pan Verification",
					filters:{
						"name": frm.doc.pan_verification_id
					 }
				},
				callback: function(r){
				   if(r.message){
					frm.set_value('ver_pan_number', r.message.pan_number);
					frm.set_value('ver_first_name', r.message.first_name);
					frm.set_value('ver_last_name', r.message.last_name);
				   }
				}
			})
		}
	}

});
