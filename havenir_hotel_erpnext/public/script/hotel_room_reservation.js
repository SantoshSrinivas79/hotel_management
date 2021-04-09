cur_frm.cscript.show_available_room = function(doc, cdt, cdn){
    let me = this;
    var table= `
    <table class="table">
    <thead>
    <tr>
        <th scope="col">Room</th>
        <th scope="col">Room Name</th>
        <th scope="col">Capacity</th>
        <th scope="col">Extra Bed</th>
    </tr>
    </thead>
    <tbody class="row_data">
    </tbody>
</table>
    <script>
    function add_to_room(room_number,room_name,capacity,extra_beds){
            console.log(room_number);
            console.log(room_name);
            console.log(capacity);
            console.log(extra_beds);
           
            var new_row = cur_frm.add_child("selected_room");
            new_row.room =room_number;
            new_row.room_name = room_name;
            new_row.capacity = capacity;
            new_row.extra_beds = extra_beds;
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
                                <td><a onclick="add_to_room('`+name[i].room_number+`','`+name[i].room_name+`','`+name[i].capacity+`','`+name[i].extra_beds+`')"> Add to Room</a></td>
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

function test_m()
{
    console.log("hello")
}