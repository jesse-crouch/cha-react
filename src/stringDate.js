function time(date) {
    var _date = date.toUTCString();
    const colPos = _date.indexOf(':');

    var hours = Number.parseInt(_date.substr(colPos-2,2));
    var mins = Number.parseInt(_date.substr(colPos+1,2));
    var endStamp = (hours > 12) ? ' PM' : ' AM';

    var timeString = (hours > 12) ? (hours -= 12) : hours;
    timeString += ':' + ((mins === 0) ? '00' : mins) + endStamp;

    return timeString;
}

export default time;