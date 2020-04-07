import monthNames from "./months";

export function time(date) {
    var hours = date.getUTCHours();
    var mins = date.getUTCMinutes();
    var endStamp = (hours >= 12) ? ' PM' : ' AM';

    var timeString = (hours > 12) ? (hours -= 12) : hours;
    timeString += ':' + ((mins === 0) ? '00' : mins) + endStamp;

    return timeString;
}

export function date(date) {
    // DD/MM/YYYY
    var day = date.getUTCDate();
    var month = date.getUTCMonth();
    var year = date.getUTCFullYear();

    if (day < 10) { day = '0' + day; }
    if (month < 10) { month = '0' + month; }
    
    return day + '/' + month + '/' + year;
}

export function shortDate(date) {
    // Month DD
    var day = date.getUTCDate();
    var month = monthNames[date.getUTCMonth()];

    if (day === 1) {
        day = day + 'st';
    } else if (day === 2) {
        day = day + 'nd';
    } else if (day === 3) {
        day = day + 'rd';
    } else {
        day = day + 'th';
    }
    
    return month + ' ' + day;
}