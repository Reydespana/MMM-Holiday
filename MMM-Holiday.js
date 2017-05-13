/* Magic Mirror
 * Module: MMM-Holiday
 *
 * By Cowboysdude
 *
 */
Module.register("MMM-Holiday", {

    // Module config defaults.
    defaults: {
        fadeSpeed: 2200,
        updateInterval: 60 * 60 * 1000, // 60 minutes
        animationSpeed: 6000,
        initialLoadDelay: 5250,
        retryDelay: 2500,
        useHeader: false,
        header: "",
        MaxWidth: "40%",
        countryCode: "usa"
    },

    getStyles: function() {
        return ["MMM-Holiday.css", "font-awesome.css"];
    },

    // Define required scripts. - The standard
    getScripts: function() {
        return ["moment.js"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        // Set locale.
        this.url = this.getHolidayUrl();
        this.today = "";
        this.scheduleUpdate();
    },

    processHoliday: function(data) {
        this.today = data.Today;
        this.holiday = data;
        this.loaded = true;
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getHoliday();
        }, this.config.updateInterval);
        this.getHoliday(this.config.initialLoadDelay);

    },

    getHolidayUrl: function() {
        var url = null;
        var holidayYear = moment().format('YYYY');
        var countryCode = this.config.countryCode.toLowerCase();
        url = "http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=" + holidayYear + "&country=" + countryCode + "&region=";
        return url;
    },

    getHoliday: function() {
        this.sendSocketNotification('GET_HOLIDAY', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "HOLIDAY_RESULT") {
            this.processHoliday(payload);
            this.updateDom(this.config.fadeSpeed);
            this.updateDom(this.config.initialLoadDelay);
        }
    },



    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "small";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Finding your Holidays...<img src='modules/MMM-Holiday/img/lg.gif' width=29px height=29px>";
            wrapper.classList.add("dimmed", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        for (var i = 0; i < this.holiday.length; i++) {
            var holiday = this.holiday[i];

            var today = new Date();
            var dd = today.getDate();
            var dayPlus = today.getDate() + 14;
            var mm = today.getMonth() + 1; //January is 0!
            var nMonth = today.getMonth() + 3;
            var yyyy = today.getFullYear();

            var today = mm + '/' + dd + '/' + yyyy;
            var month = mm;

            var CompareDay = holiday.date.day;
            var CompareMonth = holiday.date.month;


            var allDate = holiday.date.month + "/" + holiday.date.day + "/" + holiday.date.year;

            var DateDiff = {

                inDays: function(d1, d2) {
                    var t2 = d2.getTime();
                    var t1 = d1.getTime();

                    return parseInt((t2 - t1) / (24 * 3600 * 1000));
                },
            }

            var d1 = new Date(today);
            var d2 = new Date(allDate);

            //console.log("<br />Number of <b>days</b> to holiday "+allDate+": "+DateDiff.inDays(d1, d2));

            var HolidayTable = document.createElement("table");
            var HolidayColumn = document.createElement("tr");
            HolidayTable.className = "small";

            var symbolWrapper = document.createElement("td");

            if (CompareMonth >= month && CompareMonth <= nMonth) {
                if (DateDiff.inDays(d1, d2) > 0 && DateDiff.inDays(d1, d2) < 70) {
                    symbolWrapper.className = "symbol";
                    var symbol = document.createElement("span");
                    symbol.className = "fa fa-calendar-o";
                    symbolWrapper.appendChild(symbol);
                    HolidayTable.appendChild(symbolWrapper);

                    var holidayDate = document.createElement("td");
                    if (allDate === today){
					holidayDate.classList.add("xsmall", "bright", "today");
                    holidayDate.innerHTML = allDate + " ~ " + holiday.localName + " -> Today ";	
					} else {
					holidayDate.classList.add("xsmall", "bright", "now");
                    holidayDate.innerHTML = allDate + " ~ " + holiday.localName + " In " + DateDiff.inDays(d1, d2) + " days";	
					}
                    

                    HolidayTable.appendChild(holidayDate);
                    wrapper.appendChild(HolidayTable);
                }
            }
        }
        return wrapper;
    },

});
