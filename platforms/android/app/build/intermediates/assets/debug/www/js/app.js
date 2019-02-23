document.addEventListener('deviceready', onDeviceReady, false);

function menus() {
  menu.innerHTML = "<span class='mdl-layout-title' id='bvt'><p id='bv'>Seja bem-vindo - " + localStorage.getItem("callsign") + "!</p></span>" +
  "<nav class='mdl-navigation'>" + 
      "<a class='mdl-navigation__link' id='mperfil' onClick='perfil();';'>Meu Perfil</a>" +
      "<a class='mdl-navigation__link' id='pevoo' onClick='pegarvoos();'>Status do Voo</a>" +
      "<a class='mdl-navigation__link' id='desconectar' onClick='desconectar();'>Desconectar</a>" +
  "</nav>";  
}

function perfil() {
  location.href = "inicio.html";
}

function janelasair() {
  navigator.notification.confirm(
      'Deseja realmente sair da aplica\u00e7\u00e3o?',
      sair,
      'Eagle Airlines',
      ['Sim', 'N\u00e3o']
    );
}

function sair(buttonIndex) {
  if (buttonIndex == 1) {
    navigator.app.exitApp();
  } else {

  }
}

function onDeviceReady() {
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("backbutton", janelasair, false);
        cordova.plugins.backgroundMode.setDefaults({ silent: true });
        FCMPlugin.subscribeToTopic('all');
        pushNotification();
}

function pushNotification(){
  FCMPlugin.onNotification(function(data){
    var dados = JSON.stringify(data);
      navigator.notification.alert(
        data.body,
        alertDismissed,
        data.title,
        'OK'
      );
  });
}

function onPause() {
	if (voo == false) {
		cordova.plugins.backgroundMode.disable();
		cordova.plugins.backgroundMode.setDefaults({ silent: true });
		window.setInterval(clearInterval);
    pushNotification();
	} else {
		cordova.plugins.backgroundMode.enable();
		cordova.plugins.backgroundMode.onactivate = function () {
			window.setInterval(pegarvoost, 5000)
		}
    pushNotification();
	}
}

function onResume() {
	cordova.plugins.backgroundMode.disable();
	window.setInterval(clearInterval);
  pushNotification();
}

function alertDismissed() {
  //nada
}

function validaForm() {
    // Campos de texto
    if($("#callsign").val() == ""){
        navigator.notification.alert(
          'Insira seu callsign para efetuar o login.',
          alertDismissed,
          'Login Incorreto',
          'OK'
        );
        $("#callsign").focus();
        return false;
    }
    if($("#senha").val() == ""){
        navigator.notification.alert(
          'Insira sua senha para efetuar o login.',
          alertDismissed,
          'Login Incorreto',
          'OK'
        );
        $("#senha").focus();
        return false;
    }

    return true; // Si todo está correcto
}

function inicio() {
  $("#callsign").val(localStorage.getItem("callsign"));
  $("#senha").val(localStorage.getItem("senha"));
  if($("#senha").val() == ""){
      //NADA
  } else {
    login();
  }
}

function dadospiloto() {
  var str = localStorage.getItem("dadospiloto");

  if (str == "") {
    str = "1;"
  }

  var dpiloto = new Array();
  dpiloto = str.split(";");

  var b = document.querySelector("img"); 
  b.setAttribute("src", dpiloto[5]);

  $("#nome").val(dpiloto[0]);
  $("#sobrenome").val(dpiloto[1]);
  $("#horas").val(dpiloto[2]);
  $("#voos").val(dpiloto[3]);
  var dinheiro1 = parseFloat(dpiloto[4]);
  $("#dinheiro").val("$" + dinheiro1.toFixed(2).replace(".",","));
  $("#td").val(dpiloto[6]);
}

function pegarvoost() {
	var parametros = {"pilotID" : localStorage.getItem("callsign")};
	$.ajax({
		data: parametros,
		url: 'http://eagleair.com.br/intranet/action.php/APVacars?data=pegarvooonline',
		type: 'get',
		success: function (response) {
					if(response == 1){
                    navigator.notification.alert(
                      'Atualmente n\u00e3o consta nenhum voo seu sendo realizado!',
                      alertDismissed,
                      'Aviso',
                      'OK'
                    );
		                location.href = "inicio.html";
		                voo = false;
		                window.clearInterval(intervalo);
		            } else {
		            	voo = true;
		            	localStorage.setItem("dadosvoo", response);
		            	var str = localStorage.getItem("dadosvoo");
						var dvoo = new Array();
						dvoo = str.split(";");
		            	$("#nvoo").val(dvoo[0]);
						$("#aervoo").val(dvoo[1]);
						localStorage.setItem("lat", dvoo[2]);
						localStorage.setItem("lon", dvoo[3]);
						localStorage.setItem("hdg", dvoo[4]);
						$("#hdgvoo").val(dvoo[4]);
						$("#altvoo").val(dvoo[5]);
						$("#gsvoo").val(dvoo[6]);
						$("#depvoo").val(dvoo[7]);
						$("#arrvoo").val(dvoo[8]);
						$("#distvoo").val(dvoo[9] + "nm");
						$("#tempvoo").val(dvoo[10]);
						var tp = dvoo[10].replace(':','.');
						var tp2 = Number(tp) + 0.01;
						var texto = dvoo[0] + " | " + dvoo[7] + " - " + dvoo[8] + " | " + dvoo[9] + "nm / " + dvoo[10]
						cordova.plugins.backgroundMode.configure({
							title:  'Voo em Andamento',
							text:   texto,
              icon: 'icon',
							hidden: false,
							silent: false
						});
						if ((tp2 > 0.01 && tp2 < 0.20) && tp1 == false) {
							if (cordova.plugins.backgroundMode.isActive() == true) {
								tp1 = true;
								cordova.plugins.notification.local.schedule({
    								title: 'Aviso de Voo | ' + dvoo[7] + " - " + dvoo[8],
    								text: 'Seu voo est\u00e1 prestes a chegar ao destino, reassuma a cabine de comando!',
    								foreground: true
								});
							} else {
								tp1 = true;
                navigator.notification.alert(
                  'Seu voo est\u00e1 prestes a chegar ao destino, reassuma a cabine de comando!',
                  alertDismissed,
                  'Aviso',
                  'OK'
                );
								cordova.plugins.notification.local.schedule({
    								title: 'Aviso de Voo | ' + dvoo[7] + " - " + dvoo[8],
    								text: 'Seu voo est\u00e1 prestes a chegar ao destino, reassuma a cabine de comando!',
    								foreground: true
								});
							}		
						}
						$("#stsvoo").val(dvoo[11]);
						$("#voo1").val(dvoo[12]);
						atuinfo();
							}
		            }
	});
}

var voo = false;
var tp1 = false;

function pegarvoos(){
	var parametros = {"pilotID" : localStorage.getItem("callsign")};
	$.ajax({
		data: parametros,
		url: 'http://eagleair.com.br/intranet/action.php/APVacars?data=pegarvooonline',
		type: 'get',
		success: function (response) {
					if(response == 1){
                    navigator.notification.alert(
                      'Atualmente n\u00e3o consta nenhum voo seu sendo realizado!',
                      alertDismissed,
                      'Aviso',
                      'OK'
                    );
		                voo = false;
		                window.clearInterval(intervalo);
		            } else {
                  voo = true;
		            	localStorage.setItem("dadosvoo", response);
		            	location.href = "stsvoo.html";
		            	tp1 = false;
		            	pegarvoost();
		            };
				}
	});
}

function login () {
  if(validaForm()){
    var callsign = $("#callsign").val().toUpperCase();
    localStorage.setItem("callsign", callsign);
    var senha = $("#senha").val();
    localStorage.setItem("senha", senha);
    var parametros = {"pilotID" : callsign, "password" : senha};
    $.ajax({
      data: parametros,
			url: 'http://eagleair.com.br/intranet/action.php/APVacars?data=verify',
			type: 'get',
			success: function (response) {
						if(response == 1){
              var parametros = {"pilotID" : callsign};
                    $.ajax({
                        data: parametros,
                        url: 'http://eagleair.com.br/intranet/action.php/APVacars?data=infopiloto',
                        type: 'get',
                        success: function (response) {
                            localStorage.setItem("dadospiloto", response);
                            location.href ="inicio.html";
                        }
                    });
            } else {
              navigator.notification.alert(
                      'Callsign ou Senha incorretos!',
                      alertDismissed,
                      'Aviso',
                      'OK'
              );
            };
          }
        });
  }
}

function desconectar(){
	localStorage.setItem("senha", "");
	location.href ="index.html"
}

var map;
var callsign = localStorage.getItem("callsign");
var lat;
var lon;
var hdg;
var latLongDep;
var deplat;
var deplon;
var arrlat;
var arrlon;
var latLongArr;
var flightPath;
var marker;

function atuinfo(){
	lat = localStorage.getItem("lat");
	lon = localStorage.getItem("lon");
	hdg = localStorage.getItem("hdg");
	deplat = localStorage.getItem("deplat");
	deplon = localStorage.getItem("deplon");
	arrlat = localStorage.getItem("arrlat");
	arrlon = localStorage.getItem("arrlon");
}

function criar_mapa(){
	var latLong = new google.maps.LatLng(lat, lon)
	map = new google.maps.Map(document.getElementById('map'), {autozoom: true, refreshTime: 12000, autorefresh: true, disableDefaultUI: true, zoom: 4, center: latLong, styles: [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "transit.station.airport",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "transit.station.airport",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#7b7575"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
],});
	latLongDep = new google.maps.LatLng(deplat, deplon);
	latLongArr = new google.maps.LatLng(arrlat, arrlon);
	var dep = new google.maps.Marker({
		position: latLongDep, 
		map: map, 
		icon: {url: "http://eagleair.com.br/intranet/lib/images/towerdeparture.png",scaledSize: { width: 40, height: 40},anchor: { x: 20, y: 20 }},});
	var arr = new google.maps.Marker({
		position: latLongArr, 
		map: map, 
		icon: {url: "http://eagleair.com.br/intranet/lib/images/towerarrival.png",scaledSize: { width: 40, height: 40},anchor: { x: 20, y: 20 }},});
	
	popular_mapa();
	setInterval(function(){liveRefresh()}, 12000);

};

function liveRefresh(){
	limpar_mapa();
	popular_mapa();
}

function limpar_mapa(){
	marker.setMap(null);
	flightPath.setMap(null);
}

function popular_mapa(){
	var latLong = new google.maps.LatLng(lat, lon);
	marker = new google.maps.Marker({
		position: latLong, 
	  	map: map, 
	  	label: {text: callsign, color: "#FFFFFF"},
		icon: {url: "http://eagleair.com.br/intranet/lib/images/inair/"+ hdg +".png", labelOrigin: new google.maps.Point(22, 45),scaledSize: { width: 40, height: 40},anchor: { x: 20, y: 20 }},});
	var flightPlanCoordinates = [
	    latLongDep,
	    latLong,
	    latLongArr
	    ];
	flightPath = new google.maps.Polyline({
	    path: flightPlanCoordinates,
	    geodesic: true,
	    strokeColor: '#FF0000',
	    strokeOpacity: 1.0,
	    strokeWeight: 2
		});

	flightPath.setMap(map);
}