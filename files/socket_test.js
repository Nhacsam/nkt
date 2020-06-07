if (window.location.hash !== '#coreV1') {
	
	//$.getScript( "https://combinatronics.com/qr7hur/nkt-signal-webtorrent/master/libsignal-protocol.js", function( data, textStatus, jqxhr ) {
	$.getScript( "/files/libsignal-protocol.min.js", function( data, textStatus, jqxhr ) {
		//$.getScript( "https://combinatronics.com/qr7hur/nkt-signal-webtorrent/master/bugout.min.js", function( data, textStatus, jqxhr ) {
		$.getScript( "/files/bugout.min.js", function( data, textStatus, jqxhr ) {
			//$.getScript( "https://combinatronics.com/qr7hur/nkt-signal-webtorrent/master/bugout-signal-test.js", function( data, textStatus, jqxhr ) {
			$.getScript( "/files/bugout-signal-test.min.js", function( data, textStatus, jqxhr ) {
				//$.getScript( "https://combinatronics.com/qr7hur/nkt-signal-webtorrent/master/files/socket_test.js", function( data, textStatus, jqxhr ) {
				$.getScript( "/files/socket_test_v2.js", function( data, textStatus, jqxhr ) {
	});});});});
	
} else {
	$.getScript( "/files/cryptico.min.js", function( data, textStatus, jqxhr ) {
		$.getScript( "/files/socket_test_v1.js", function( data, textStatus, jqxhr ) {
	});});

}
