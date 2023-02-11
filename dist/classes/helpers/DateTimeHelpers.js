"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateTimeHelpers {
    static MillisecondsToHumanReadable(ms) {
        const hours = ms / (1000 * 60 * 60);
        const absoluteHours = Math.floor(hours);
        const h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;
        //Get remainder from hours and convert to minutes
        const minutes = (hours - absoluteHours) * 60;
        const absoluteMinutes = Math.floor(minutes);
        const m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;
        //Get remainder from minutes and convert to seconds
        const seconds = (minutes - absoluteMinutes) * 60;
        const absoluteSeconds = Math.floor(seconds);
        const s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;
        const result = [];
        if (h > 0) {
            result.push(`${h}h`);
        }
        if (m > 0) {
            result.push(`${m}m`);
        }
        if (s > 0) {
            result.push(`${s}s`);
        }
        return result.join(' ');
    }
}
exports.default = DateTimeHelpers;
DateTimeHelpers.getTimeString = (date, format) => {
    if (format === 'hh:mm:ss') {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }
    else {
        const hours = date.getHours() > 0 ? `${date.getHours()}h ` : '';
        const minutes = date.getMinutes() > 0 ? `${date.getMinutes()}m ` : '';
        const seconds = date.getSeconds() > 0 ? `${date.getSeconds()}s ` : '';
        return `${hours}${minutes}${seconds}`;
    }
};
