import $ from 'jquery';

var server = 'http://cosgrovehockeyacademy.com:5460';
$.get(server + '/api/serverURL', (result) => {
    if (result.server) {
        server = result.server;
    }
});

export default server;