/*
to-do list:
//find a way to merge the lists of different countries together
//add the links of images and article links into each box
add a reverse chronological checkbox that puts events in reverse chronological order
*/



async function getData(country, api) {
    //creates a container for holidays
    var holidayContainer = document.createElement("div");
    document.getElementsByTagName('body')[0].appendChild(holidayContainer);
    holidayContainer.id = "holidayContainer";

    //fetches calendar names of given country
    const response = await fetch(api);
    const data = await response.json();

    //gets today's today
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1; 
    var year = today.getFullYear();
    today = month + '/' + day + '/' + year;

    //create empty dictionaries to match holiday date with description and name
    var wikidict = {};
    var namedict = {};
    var imagedict = {};
    var dateArray = [];
    rep = data["items"].length;

    //filters through holidays that are only in the future and gets descriptions and images for each holiday
    for (let i = 0; i < rep; i++) {
        //finds holiday date
        HolDate = data["items"][i]["start"]["date"];

        HolYear = HolDate.slice(0,4);
        HolYear = parseInt(HolYear);

        HolMonth = HolDate.slice(5, 7);
        HolMonth = parseInt(HolMonth);

        HolDay = HolDate.slice(8, 10);
        HolDay = parseInt(HolDay);
        
        //gets rid of unnecessary words in holiday name
        var name = data["items"][i]["summary"];
        if ((HolYear > year ||  (HolYear == year && HolMonth > month) || (HolYear == year && HolMonth == month && HolDay > day)) && name.includes("substitute") == false) {
            dateArray.push(HolDate);
            if (name.includes("First Day of ") == true) {
                name = name.replace("First Day of ", "");
            }
            if (name.includes("ends") == true) {
                name = name.replace("ends", "");
            }
            if (name.includes("starts") == true) {
                name = name.replace("starts", "");
            }
            if (name.includes("Day") == true && (name.includes("Christmas") == true || name.includes("Thanksgiving") == true)) {
                name = name.replace("Day", "");
            }
            if (name.includes(")") == true) {
                name = name.replace(/\s*\(.*?\)\s*/g, "")
            }
            //const wikilink = await fetch ("https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=" + name.replaceAll(' ', "_") + "&limit=1&namespace=0&format=json");
            //const wikidata = await wikilink.json();
            
            //gets summary of holiday
            const wikisumdata = await fetch ("https://en.wikipedia.org/api/rest_v1/page/summary/" + name.replaceAll(' ', "_"));
            const wikisum = await wikisumdata.json();
            var summary = wikisum["extract"];
            if (summary == undefined) {
                summary = "Sorry, I couldn't find information about this holiday on Wikipedia.";
            }

            //gets image of holiday
            const wikiImageData = await fetch ("https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&formatversion=2&prop=pageimages|pageterms&piprop=original&titles=" + name.replaceAll(' ', "_"));
            const wikiImage = await wikiImageData.json();
            var imagesource = wikiImage["query"]["pages"][0];
            if (imagesource["original"] == undefined || wikiImage["query"]["pages"][0]["original"]["source"] == undefined) {
                var image = "Sorry, I couldn't find the image for this holiday on Wikipedia.";
            }
            else {
                var image = wikiImage["query"]["pages"][0]["original"]["source"];
            }
            //sets date to image, summary, and name

            repeatadd(HolDate, wikidict, summary);
            repeatadd(HolDate, imagedict, image);
            repeatadd(HolDate, namedict, name);

            // const newsresponse = await fetch("https://newsapi.org/v2/everything?q=" + name + "&sortBy=relevancy&apiKey=bc0d363d94ee40ebb740ab08b88dbedf");
            // const newsdata = await newsresponse.json();
            // var newslink  = newsdata["articles"][0]["urlToImage"];

            // document.getElementById(unqid).src = String(newslink);
            //document.getElementById(unqid).classList.add("newspic");
            
            //console.log(newsdata);
            //console.log(newslink);
        }
    }

    //sorts date
    console.log(wikidict);
    var arraySorted = dateArray.sort(function(a,b){
        return new Date(a) - new Date(b);
    });
    
    //sets sorted dates to respective name, summary, and image
    var sortedWiki = {};
    var sortedName = {};
    var sortedImage = {};
    for (let i = 0; i < arraySorted.length; i++) {
        sortedWiki[arraySorted[i]] = wikidict[arraySorted[i]];
        sortedName[arraySorted[i]] = namedict[arraySorted[i]];
        sortedImage[arraySorted[i]] = imagedict[arraySorted[i]];
    }
    console.log(sortedImage);

    var winter = new Date("2000-11-01 00:00");
    var spring = new Date("2000-03-01 00:00");
    var summer = new Date("2000-06-01 00:00");
    var fall = new Date("2000-09-01 00:00");
    //displays the holidays with their respective information(name, date, summary, image)
    for (let i = 0; i < Object.keys(sortedWiki).length; i++) {
        
        //displays name
        for (let j = 0; j < sortedWiki[Object.keys(sortedWiki)[i]].length; j++) {
            var backgrounddiv = document.createElement("div");
            backgrounddiv.id = "news" + i;
            backgrounddiv.classList.add("backgroundcolor");
            var blockdiv = document.createElement("div");
            blockdiv.classList.add("newsblock");
            backgrounddiv.appendChild(blockdiv);
            holidayContainer.appendChild(backgrounddiv);
            blockdiv.innerHTML = Object.keys(sortedWiki)[i] + " " + Object.values(sortedName)[i][j]+ " (" + country + ")";

            //finds the holiday season for background purposes
            var holidayCompare = Object.keys(sortedWiki)[i];
            holidayCompare = "2000-" + holidayCompare.slice(5,10) + " 00:00";
            holidayCompare = new Date(holidayCompare);


            if (holidayCompare.getTime() < spring.getTime()) {
                var holidayseason = "winter";
            }
            else if (holidayCompare.getTime() >= spring.getTime() && holidayCompare.getTime() < summer.getTime()) {
                var holidayseason = "spring";
            }
            else if (holidayCompare.getTime() >= summer.getTime() && holidayCompare.getTime() < fall.getTime()) {
                var holidayseason = "summer";
            }
            else if (holidayCompare.getTime() >= fall.getTime()) {
                var holidayseason = "fall";
            }
            

            //sets background color according to season
            if (holidayseason == "winter") {
                if ((i != 0) && (j == 0) && (new Date("2000-" + Object.keys(sortedWiki)[(i - 1)].slice(5,10) + " 00:00") > spring)) {
                    backgrounddiv.style.backgroundImage = "linear-gradient(to bottom, #CE8545, lightblue)";
                }
                else {
                    backgrounddiv.style.backgroundColor = "lightblue";
                }
            }
            else if (holidayseason == "spring") {
                if ((i != 0) && (j == 0) && (new Date("2000-" + Object.keys(sortedWiki)[i - 1].slice(5,10) + " 00:00") < spring)) {
                    backgrounddiv.style.backgroundImage = "linear-gradient(to bottom, lightblue, lightgreen)";
                }
                else {
                    backgrounddiv.style.backgroundColor = "lightgreen";
                }
            }
            else if (holidayseason == "summer") {
                if ((i != 0) && (j == 0) && (new Date("2000-" + Object.keys(sortedWiki)[i - 1].slice(5,10) + " 00:00") < summer)) {
                    backgrounddiv.style.backgroundImage = "linear-gradient(to bottom, lightgreen, #F85D39)";
                }
                else {
                    backgrounddiv.style.backgroundColor = "#F85D39";
                }
            }
            else if (holidayseason == "fall") {
                if ((i != 0) && (j == 0) && (new Date("2000-" + Object.keys(sortedWiki)[i - 1].slice(5,10) + "  00:00") < fall)) {
                    backgrounddiv.style.backgroundImage = "linear-gradient(to bottom, #F85D39, #CE8545)";
                }
                else {
                    backgrounddiv.style.backgroundColor = "#CE8545";
                }

            }

            var container = document.createElement("div");
            container.id = "container";
            blockdiv.appendChild(container);

            //displays image
            if (Object.values(sortedImage)[i][j].includes("https") == true) {
                var firstinner = document.createElement("img");
                container.appendChild(firstinner);
                firstinner.classList.add("firstnews");
                firstinner.src = Object.values(sortedImage)[i][j];
            }
            else {
                var noimg = document.createElement("div");
                noimg.classList.add("noimage");
                container.appendChild(noimg);
                noimg.innerHTML = Object.values(sortedImage)[i][j];
            }

            //displays summary
            var secondinner = document.createElement("div");
            secondinner.id = "summary";
            container.appendChild(secondinner);
            secondinner.innerHTML = Object.values(sortedWiki)[i][j];
        }
    }
    waittime.remove();
}

//gets the holidays with their name and dates for a given country
function getAPI(countryname) {
    return "https://www.googleapis.com/calendar/v3/calendars/en."+ countryname +"%23holiday%40group.v.calendar.google.com/events?key=AIzaSyBOS4bvkIVhWtcCb6L2dz0Q1CeJsl8ZwU4";
}

//adds holiday information to specific dictionary and accounts for the information in repeats
function repeatadd(date, dictname, output) {
    if (date in dictname) {
        dictname[date].push(output);
    }
    else {
        dictname[date] = [output];
    }
}

function displaydata() {
    if (document.getElementById("holidayContainer") != null) {
        holidayContainer.remove();
    }
    if (document.getElementById("waittime") == null) {
        var wait = document.createElement("div");
        wait.id = "waittime";
        bigContainer.appendChild(wait);

        var waittext = document.createElement("p");
        waittext.id = "waittext";
        waittext.innerHTML = "Please wait up to 10 seconds for the holidays to display."
        wait.appendChild(waittext);
    }

    getData(document.getElementById("selectedCountry").value, getAPI(document.getElementById("selectedCountry").value));
}



        