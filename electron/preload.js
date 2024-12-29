"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
// Expose geschützte Methoden, die IPC-Aufrufe erlauben
electron_1.contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: function (channel) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var validChannels = ['db-get', 'db-add', 'db-update', 'db-delete'];
            if (validChannels.includes(channel)) {
                return electron_1.ipcRenderer.invoke.apply(electron_1.ipcRenderer, __spreadArray([channel], args, false));
            }
            throw new Error("Unerlaubter IPC-Kanal: ".concat(channel));
        }
    }
});
