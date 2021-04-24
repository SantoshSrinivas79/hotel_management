cur_frm.cscript.show_available_room = function(doc, cdt, cdn){
    
    if(cur_frm.doc.from_date > cur_frm.doc.to_date){
        cur_frm.clear_table('items');
        cur_frm.refresh();
        cur_frm.set_value("from_date","");
        cur_frm.set_value("to_date","");
        frappe.throw("Invalid! FromDate should not greater than ToDate");
    }
    let me = this;
    var table= `
    <table class="table">
    <thead>
    <tr>
        <th scope="col">Room</th>
        <th scope="col">Room Name</th>
        <th scope="col">Capacity</th>
        <th scope="col">Extra Bed</th>
        <th scope="col">Type</th>
        <th schope="col"> Package </th>
    </tr>
    </thead>
    <tbody class="row_data">
    </tbody>
</table>
    <script>
    function add_to_room(room_number,room_name,capacity,extra_beds, room_type, package){
            if($('#'+package).val() == "")
            {
                frappe.throw("Please Select Package");
            }
            console.log(package);
            console.log(room_number);
            console.log(room_name);
            console.log(capacity);
            console.log(extra_beds);
           
            var new_row = cur_frm.add_child("selected_room");
            new_row.room =room_number;
            new_row.room_name = room_name;
            new_row.capacity = capacity;
            new_row.extra_beds = extra_beds;
            new_row.room_type = room_type;
            var new_row = cur_frm.add_child("items");
            new_row.item =$('#'+package).val();
            new_row.room =room_number;
            cur_frm.refresh();
            cur_frm.trigger("recalculate_rates");
            $('#'+room_number).hide();
            

        }

        
    </script>`;
    me.dialog = new frappe.ui.Dialog({
        title: (me.title || me.subject || __("Rooms Available")),
        no_submit_on_enter: true,
        fields: [
            {label:__("Campign List"), fieldtype:"HTML",
                fieldname:"campaign_list"},
        ],
        primary_action_label: __('Refresh'),
        primary_action: function(frm) {
            cur_frm.clear_table("items");
            frappe.call({
                method:"havenir_hotel_erpnext.public.script.hotel_room_reservation.insert_room_scheduled",
                args:{from_date:cur_frm.doc.from_date, to_date:cur_frm.doc.to_date},
                callback:function(r) {
                    var name = r.message;
                    me.dialog.set_value("campaign_list",table);
                    $('.row_data').empty();
                    console.log(r.message)     
                    
                    for(var i=0; i<name.length; i++){
                        $('.row_data').append(`
                                <tr id="`+ name[i].room_number +`" >
                                <th scope="row">`+name[i].room_number+` </th>
                                <td>`+name[i].room_name+`</td>
                                <td>`+name[i].capacity+`</td>
                                <td>`+name[i].extra_beds+`</td>
                                <td>`+name[i].room_type+`</td>
                                <td id="select"> 
                                    <select id ='package`+i+`' class='input-with-feedback form-control bold'>
                                    </select>
                                </td>
                                <td><a onclick="add_to_room('`+name[i].room_number+`','`+name[i].room_name+`','`+name[i].capacity+`','`+name[i].extra_beds+`','`+name[i].room_type+`','`+'package'+i+`')"> Add to Room</a></td>
                            </tr>
                        `);
                        $('#package'+i).append("<option></option>");
                        for(var s=0; s< name[i].package.length; s++)
                        { 
                            console.log(name[i].package[s].item);
                            if(name[i].package[s].item != undefined)
                            {
                                $('#package'+i).append("<option>"+name[i].package[s].item+"</option>");
                            }
                        }
                    }
                }
            })
        }
    });
    $(".row_data").remove();
    me.dialog.show();
    me.dialog.$wrapper.find('.modal-dialog').css("width", "900px");
}

cur_frm.cscript.change_status = function(doc, cdt, cdn){
    let me = this;
    me.dialog = new frappe.ui.Dialog({
        title: (me.title || me.subject || __("Rooms Available")),
        no_submit_on_enter: true,
        fields: [
            {label:__("Change Status"), fieldtype:"Select",
                fieldname:"change_status", options:["Booked","Advance Paid","Invoiced","Paid","Completed","Cancelled"]},
        ],
        primary_action_label: __('Save'),
        primary_action: function(frm) {
          frappe.call({
              method:"havenir_hotel_erpnext.public.script.hotel_room_reservation.update_status_cancelled",
              args:{status:frm.change_status, parent:cur_frm.doc.name}
          })
          me.dialog.hide();
          frappe.msgprint("Successfully Updated, Do Refresh")
        }
    });
    me.dialog.show()
    
}
// var date_diff_indays = function(date1, date2) {
//     var dt1 = new Date(date1);
//     var dt2 = new Date(date2);
//     return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
// }

frappe.ui.form.on('Hotel Room Reservation', {
	recalculate_rates: function(frm) {     
		if (!frm.doc.from_date || !frm.doc.to_date
			|| !frm.doc.items.length){
			return;
        }
        // var qty = date_diff_indays(cur_frm.doc.from_date, cur_frm.doc.to_date);
		frappe.call({
			"method": "erpnext.hotels.doctype.hotel_room_reservation.hotel_room_reservation.get_room_rate",
			"args": {"hotel_room_reservation": frm.doc}
		}).done((r)=> {
			for (var i = 0; i < r.message.items.length; i++) {
                frm.doc.items[i].qty = 1;
                frm.doc.items[i].rate = r.message.items[i].rate;
				frm.doc.items[i].amount = r.message.items[i].amount;
			}
			frappe.run_serially([
				()=> frm.set_value("net_total", r.message.net_total),
				()=> frm.refresh_field("items")
			]);
        });
    },
    validate: function(frm){
        cur_frm.trigger("recalculate_rates");
        var temp_extrabed=0;
        var total_extrabed=0;
        var temp_capacity=0;
        var total_capacity=0;
        for(var i=0; i < cur_frm.doc.selected_room.length; i++){
            temp_extrabed = cur_frm.doc.selected_room[i].extra_beds
            total_extrabed = temp_extrabed+ total_extrabed  ;
            console.log(total_extrabed)
            temp_capacity = cur_frm.doc.selected_room[i].capacity
            total_capacity = temp_capacity+ total_capacity;
            console.log(total_capacity)

           
        }
        cur_frm.set_value("total_extra_beds",total_extrabed);
        cur_frm.set_value("total_capacity",total_capacity);
        cur_frm.set_value("total_room",cur_frm.doc.selected_room.length);
        
    },
    refresh: function(frm){
        if(frm.doc.docstatus == 1){
            $("[data-label='Create%20Invoice']").hide();
            frm.add_custom_button(__('Create Automation Check In'), ()=> {
              frappe.model.with_doc("Hotel Settings", "Hotel Settings", ()=>{
                frappe.model.with_doctype("Checkin Automation", ()=>{
                  let hotel_settings = frappe.get_doc("Hotel Settings", "Hotel Settings");
                  let invoice = frappe.model.get_new_doc("Checkin Automation");
                   invoice.select_hotel_room_reservation = cur_frm.doc.name
                  frappe.set_route("Form", invoice.doctype, invoice.name);
                });
              });
            });

            frm.add_custom_button(__('Create Advance Payment'), ()=> {
                
                    let doc = frappe.model.get_new_doc('Payment Entry');
                    doc.posting_date =frappe.datetime.nowdate();
                    doc.party_type='Customer';
                    doc.party=cur_frm.doc.customer;
                    doc.mode_of_payment='Cash';
                    doc.party_name=cur_frm.doc.customer;
                    doc.paid_amount=frm.amount;
                    doc.reservation_id=cur_frm.doc.name;
                    doc.advance_payment=1;
                    doc.payment_type='Receive';
                    doc.company = cur_frm.doc.company;
                    frappe.set_route('Form', doc.doctype, doc.name)
            });
          }
          
    },
    onload:function(frm){
        if(cur_frm.doc.__unsaved == 1)
        {
            var current = frappe.datetime.get_today();
            
            frappe.call({
            method: "havenir_hotel_erpnext.public.script.hotel_room_reservation.hotel_settings",
            args: {},
            callback: function(r) {
                    var data = r.message;
                    console.log(data);
                    cur_frm.set_value("from_date",current+" "+ data[0])
                    cur_frm.set_value("to_date",frappe.datetime.add_days(current, 1)+" "+ data[1])
            
                }
            });
        }

        frappe.call({
            method:'havenir_hotel_erpnext.public.script.hotel_room_reservation.get_payment_list',
            args:{name: cur_frm.doc.name},
            callback: function(r){
                var data = r.message;
                console.log(data)
                cur_frm.clear_table('advance_payment_list')
                for(var i=0; i< data.length; i++){
                    var new_row = cur_frm.add_child("advance_payment_list");
                    new_row.payment_entry =data[i].name;
                }
                cur_frm.refresh();
            }
        });
    }
});



cur_frm.cscript.get_items = function(frm){
    cur_frm.trigger("recalculate_rates");
}

cur_frm.cscript.from_date = function(frm){
    if(cur_frm.doc.from_date > cur_frm.doc.to_date){
        cur_frm.clear_table('items');
        cur_frm.refresh();
        cur_frm.set_value("from_date","");
        cur_frm.set_value("to_date","");
        frappe.throw("Invalid! FromDate should not greater than ToDate");
    }
    
}

cur_frm.cscript.to_date = function(frm){
    if(cur_frm.doc.from_date > cur_frm.doc.to_date){
        cur_frm.clear_table('items');
        cur_frm.refresh();
        cur_frm.set_value("from_date","");
        cur_frm.set_value("to_date","");
        frappe.throw("Invalid! FromDate should not greater than ToDate");

    }
    
}

cur_frm.cscript.guest_name = function(frm){
    frappe.call({
		method: 'frappe.client.get_value',
		args: {
			'doctype': 'Hotel Guests',
			'filters': { 'name': cur_frm.doc.guest_name},
			'fieldname': [
				'guest_name'
			]
		},
		callback: function (r) {
            console.log(r.message);
            cur_frm.set_value('customer', r.message.guest_name)
        }
    });
}