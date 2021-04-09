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
    </tr>
    </thead>
    <tbody class="row_data">
    </tbody>
</table>
    <script>
    function add_to_room(room_number,room_name,capacity,extra_beds, room_type){
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
            cur_frm.refresh();
            

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
                                <tr >
                                <th scope="row">`+name[i].room_number+` </th>
                                <td>`+name[i].room_name+`</td>
                                <td>`+name[i].capacity+`</td>
                                <td>`+name[i].extra_beds+`</td>
                                <td>`+name[i].room_type+`</td>
                                <td><a onclick="add_to_room('`+name[i].room_number+`','`+name[i].room_name+`','`+name[i].capacity+`','`+name[i].extra_beds+`','`+name[i].room_type+`')"> Add to Room</a></td>
                            </tr>
                        `);
                        
                    }
                }
            })
        }
    });
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

frappe.ui.form.on('Hotel Room Reservation', {
	recalculate_rates: function(frm) {
		if (!frm.doc.from_date || !frm.doc.to_date
			|| !frm.doc.items.length){
			return;
		}
		frappe.call({
			"method": "erpnext.hotels.doctype.hotel_room_reservation.hotel_room_reservation.get_room_rate",
			"args": {"hotel_room_reservation": frm.doc}
		}).done((r)=> {
			for (var i = 0; i < r.message.items.length; i++) {
				frm.doc.items[i].rate = r.message.items[i].rate;
				frm.doc.items[i].amount = r.message.items[i].amount;
			}
			frappe.run_serially([
				()=> frm.set_value("net_total", r.message.net_total),
				()=> frm.refresh_field("items")
			]);
		});
    },
})

cur_frm.cscript.get_items = function(frm){
    cur_frm.clear_table("items");
    var rooms = cur_frm.doc.selected_room;
    for(var i=0; i<rooms.length; i++){
        console.log(rooms[i].room)
        frappe.call({
            method:"havenir_hotel_erpnext.public.script.hotel_room_reservation.get_item_per_room",
            args:{parent:rooms[i].room}
        }).done((r) =>{
            for(var e=0; e < r.message.length; e++)
            {
                console.log(r.message)
                var new_row = cur_frm.add_child("items");
                new_row.item =r.message[e].item;
                cur_frm.refresh();
            }
        })
    }
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