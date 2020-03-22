import $ from 'jquery';

var server = 'http://10.0.0.177:3500';
$.get(server + '/api/serverURL', (result) => {
    if (result.server) {
        server = result.server;
    }
});

export default server;