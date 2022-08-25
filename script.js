//current problems: 
//can't sort duplicate dates

//to-do list:
//make images for the left side
//implement a checkbox/dropdown feature with all the different countries
//find a way to merge the lists of different coutnries together
//add the links of images and article links into each box
//add a reverse chronological checkbox that puts events in reverse chronological order
//make the site prettier / more user friendly



async function getData(country, api) {
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
            const wikiImageData = await fetch ("https://en.wikipedia.org/w/api.php?origin=*&action=query&formatversion=2&prop=pageimages%7Cpageterms&format=json&titles=" + name.replaceAll(' ', "_"));
            const wikiImage = await wikiImageData.json();
            var imagesource = wikiImage["query"]["pages"][0];
            if (imagesource["thumbnail"] == undefined || wikiImage["query"]["pages"][0]["thumbnail"]["source"] == undefined) {
                var image = "Sorry, I couldn't find the image for this holiday on Wikipedia.";
            }
            else {
                var image = wikiImage["query"]["pages"][0]["thumbnail"]["source"];
            }
            console.log(image);

            //sets date to image, summary, and name
            imagedict[HolDate] = image;
            wikidict[HolDate] = summary;
            namedict[HolDate] = name;

            // const newsresponse = await fetch("https://newsapi.org/v2/everything?q=" + name + "&sortBy=relevancy&apiKey=bc0d363d94ee40ebb740ab08b88dbedf");
            // const newsdata = await newsresponse.json();
            // var newslink  = newsdata["articles"][0]["urlToImage"];

            // document.getElementById(unqid).src = String(newslink);
            //document.getElementById(unqid).classList.add("newspic");
            
            //console.log(newsdata);
            //console.log(newslink);
        }
    }
    //sorts holiday dates and finds repeated dates
    var repeatdict = {};
    var arraySorted = dateArray.sort(function(a,b){
        if (new Date(a) - new Date(b) == 0) {
            if (repeatdict[a]) {
                repeatdict[a] = (repeatdict[a] || 0) + 1;;
            }
            else {
                repeatdict[a] = 1;
            }
        }
        // if (new Date(a) - new Date(b) == 0) {
        //     console.log(a);
        //     if (parseInt(a.slice(-1)) >= 9) {
        //         var lastDigit = parseInt(a.slice(-1)) - 1;
        //     }
        //     else {
        //         var lastDigit = parseInt(a.slice(-1)) + 1;
        //     }
        //     console.log(lastDigit);
        //     var newA = a.slice(0, -1) + lastDigit.toString();

        //     console.log(newA);
        // }
        return new Date(a) - new Date(b);
    });
    
    var repeatKeys = Object.keys(repeatdict);

    //finds how many repeated dates there are
    for (let i = 0; i < repeatKeys.length; i++) {
        if (repeatdict[repeatKeys[i]] != 1) {
            var counter = 0;
            var add = 0
            while (counter < repeatdict[repeatKeys[i]]) {
                add = add + 1;
                counter = counter + add;
            }
            repeatdict[repeatKeys[i]] = add;
        }
    }
    
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

    //sorts dates of repeated dates that are missing in the main set
    var sortedMissing = {};
    var sortedKeys = repeatKeys.sort(function(a,b){
        return new Date(a) - new Date(b);
    });
    for (let i = 0; i < repeatKeys.length; i++) {
        sortedMissing[sortedKeys[i]] = repeatdict[sortedKeys[i]];
    }

    //displays the holidays with their respective information(name, date, summary, image)
    for (let i = 0; i < Object.keys(sortedWiki).length; i++) {
        
        //displays name
        var blockdiv = document.createElement("div");
        blockdiv.id = "block";
        document.getElementsByTagName('body')[0].appendChild(blockdiv);
        blockdiv.innerHTML = Object.keys(sortedWiki)[i] + " " + Object.values(sortedName)[i]+ " (" + country + ")";

        var container = document.createElement("div");
        container.id = "container";
        blockdiv.appendChild(container);

        //displays image
        if (Object.values(sortedImage)[i].includes("https") == true) {
            var firstinner = document.createElement("img");
            container.appendChild(firstinner);
            firstinner.classList.add("firstnews");
            firstinner.src = Object.values(sortedImage)[i];
        }
        else {
            var noimg = document.createElement("div");
            noimg.classList.add("noimage");
            container.appendChild(noimg);
            noimg.innerHTML = Object.values(sortedImage)[i];
        }

        //displays summary
        var secondinner = document.createElement("div");
        secondinner.id = "summary";
        container.appendChild(secondinner);
        secondinner.innerHTML = Object.values(sortedWiki)[i];
    }

    //displays the repeated holidays that are missing in the main set
    for (let i = 0; i < repeatKeys.length; i++) {
        var missingdiv = document.createElement("div");
        missingdiv.id = "missing";
        document.getElementsByTagName('body')[0].appendChild(missingdiv);
        if (sortedMissing[sortedKeys[i]] == 1) {
            missingdiv.innerHTML = "There is one other holiday on " + sortedKeys[i] + " that we couldn't display."
        }
        else {
            missingdiv.innerHTML = "There are " + sortedMissing[sortedKeys[i]] + " other holidays on " + sortedKeys[i] + " that we couldn't display." 
        } 
    }
}

//gets the holidays with their name and dates for a given country
function getAPI(countryname) {
    return "https://www.googleapis.com/calendar/v3/calendars/en."+ countryname +"%23holiday%40group.v.calendar.google.com/events?key=AIzaSyBOS4bvkIVhWtcCb6L2dz0Q1CeJsl8ZwU4";
}

getData("usa", getAPI("usa"));
//getData("uk", getAPI("uk"));


        