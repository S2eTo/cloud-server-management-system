$('#connect').click( function () {
    client.connect()
});

$('#disconnect').click( function () {
    client.disconnect()
});

$('#set_options').click( function () {
    client.set_options($('#server_target').val(), $('#server_port').val())
});