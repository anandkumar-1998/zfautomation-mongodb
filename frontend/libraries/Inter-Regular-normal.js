﻿import { jsPDF } from "jspdf"
var callAddFont = function () {
    this.addFileToVFS('Inter-Regular-normal.ttf', font);
    this.addFont('Inter-Regular-normal.ttf', 'Inter-Regular', 400);
};
jsPDF.API.events.push(['addFonts', callAddFont])