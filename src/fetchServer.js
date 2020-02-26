import $ from 'jquery';

var server = 'http://localhost:3500';
$.get(server + '/api/serverURL', (result) => {
    if (result.server) {
        server = result.server;
    }
});

export default server;