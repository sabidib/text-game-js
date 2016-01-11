$(function() {

    var finishShowingLandingPage = function() {
    }


var setCookie = function (cname, cvalue) {
    localStorage.setItem(cname, JSON.stringify({"value":cvalue}));
}

var getCookie = function (cname) {
    return JSON.parse(localStorage.getItem(cname));
}



var params = function() {
    function urldecode(str) {
        return decodeURIComponent((str+'').replace(/\+/g, '%20'));
    }

    function transformToAssocArray( prmstr ) {
        var params = {};
        var prmarr = prmstr.split("&");
        for ( var i = 0; i < prmarr.length; i++) {
            var tmparr = prmarr[i].split("=");
            params[tmparr[0]] = urldecode(tmparr[1]);
        }
        return params;
    }

    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}();


    var labels = {
        "w": "wait",
        "t": "type",
        "n": "nonewline",
        "c": "clear",
        "s": "speed",
        "p": "pre",
        "l": "link",
        "a": "argument",
        "x": "csstype",
        "r" : "redcursor",
        "d" : "destination"
    }
    var defaultBlock = {
        "wait": 0,
        "type": 0,
        "nonewline": 1,
        "clear": 0,
        "speed": 200,
        "pre": 0,
        "link": "",
        "argument": "",
        "csstype" : "",
        "redcursor" : false,
        "destiniation" : ""
    }
    var arr = [];

        var multiplier = 1;
     var globalInputs = {};
     var addCursor = function(){
        $("#bootLog").append("<span class='cursor'>&nbsp;</span>");
     }
    var clearWindow = function(){
       $("#bootLog").html("");
       addCursor();
    }

    var greenCursorColor = "#0c0";
    var redCursorColor = "#F00";
    addCursor();

    var dialogObject = {};
    var chosen_option_objects = [];
    var addToText = function(text,verbatim){
        if(verbatim != undefined && verbatim == true && text == " "){
            text = text.replace(" ","&nbsp;")
            $(".cursor").before(text)    
        } else {
            $(".cursor").before(text)    
        }            
    }
    function displayAllText() {
        var startIndex = 0;
     

        var displayCurrentLine = function(index) {
            if (index >= arr.length) {
                finishShowingLandingPage();
                return;
            }
            var displayEndings = function() {
                if (currentLine.clear == 1) {
                    clearWindow();
                }
                if (currentLine.nonewline == 1) {
                    addToText("</br>");
                }
                $(".cursor").css("background",greenCursorColor)
                window.scrollTo(0, document.body.scrollHeight);
                setTimeout(function() {
                    displayCurrentLine(index + 1)
                }, currentLine.wait * multiplier);
            }

            var getAndReturnInput = function(key){
                var runningText = "";
                var curText = "";
                var detectionString = "keypress touchstart click";
                $(".cursor").before("<div id='tempString'></div>")
                var hasRun = false;
                 $(document).on("keydown",document,function(e){
                    if(e.keyCode == 8){ 
                        e.preventDefault();
                        curText = $("#tempString").html();
                        curText = curText.substring(0, curText.length - 1);
                        $("#tempString").html(curText); 
                    }
                 })
                 var onClickTouchOrEnter = function(e){
                    if(hasRun){
                        return false;
                    }
                    $("#tempString").focus();
                    var enterKeyPress = (e.type == "keypress" && e.which == 13);
                    var clicked = false;
                    var touched = false;
                    if(currentLine.redcursor){
                        clicked = (e.type == "click");
                        touched = (e.type == "touchstart");    
                    }                    
                    if( enterKeyPress || clicked || touched  ){
                        globalInputs[key] = $("#tempString").html();
                        $("#tempString").remove()
                        addToText(globalInputs[key]);
                        displayEndings();
                        hasRun = true;
                    } else if(!currentLine.redcursor && !clicked && !touched && e.type == "keypress"){
                        var character =  String.fromCharCode(e.which);
                        $("#tempString").append(character)   
                    }
                    return false;
                }
                $(document).on(detectionString,document,function(e){
                    onClickTouchOrEnter(e);
                    $(document).off(detectionString,document);
                })
                $(document).on(detectionString,"body",function(e){
                    onClickTouchOrEnter(e);
                    $(document).off(detectionString,"body");
                })
            }

            var getAndSetOptions = function(argument){
                var dialogOptions = dialogObject[argument];
                var detectionStringForOptions = "click touchstart"
                var html = "<div id='option-container'>";
                var option_ids = [];
                for (var i = 0; i < dialogOptions.length; i++) {
                    var option_id = "option_number_"+dialogOptions[i].option_number
                    option_ids.push(option_id.slice(0));
                    html += "<div class='option' data-line-index='"+index+"' data-option-number='"+dialogOptions[i].option_number+"' id='"+option_id+ "'><span class='option-text'>"+dialogOptions[i].string+"</span></div>"                    
                }
                html += "</div>";
                var  hasFired= false
                for(var i = 0;  i < option_ids.length; i++){
                    console.log("Setting","#"+option_ids[i])
                    $(document).on(detectionStringForOptions,"#"+option_ids[i],function(event){
                        if(parseInt($(event.currentTarget).attr("data-line-index")) != index){
                            return;
                        }
                        var obj = {};
                        obj[argument] = parseInt($(event.currentTarget).attr("data-option-number"));
                        chosen_option_objects.push(obj);
                        for(var j = 0;  j < option_ids.length; j++){
                            console.log("removing","#"+option_ids[j]);
                            $(document).off(detectionStringForOptions,"#"+option_ids[j]);
                        }
                        $(event.currentTarget).attr("style","background-color:green;")
                        displayEndings();
                    })   
                }
                addToText(html,true);
            }

            var currentLine = arr[index];
            console.log(currentLine);

            if(currentLine.redcursor){
                $(".cursor").css("background",redCursorColor);
            }

            var getResponse = function(argument,destination){
                var dialogOption = dialogObject[argument];
                var respondedVal = {};
                for (var i = chosen_option_objects.length - 1; i >= 0; i--) {
                    if(chosen_option_objects[i][destination] != undefined){
                        respondedVal =  chosen_option_objects[i][destination];
                        break;
                    }
                };

                for (var j = 0; j < dialogOption.length; j++) {
                    for(var k = 0; k < dialogOption[j]['response_number'].length;k++){
                        if(dialogOption[j]['response_number'][k] == respondedVal){
                            return dialogOption[j]['string']
                        }    
                    }                    
                };
                return "";                
            }

            var displayACharacter = function(indexA) {
                if (indexA >= currentLine.lineString.length) {

                    setTimeout(function() {
                        displayEndings();
                        //    if(currentLine.nonewline == 1){
                        //         addToText("</br>");   
                        //      } 
                        // displayCurrentLine(index+1)
                    }, currentLine.wait);
                    return;
                }
                // if(currentLine.lineString[indexA] == " "){
                    // currentLine.lineString[indexA] = "&nbsp;";
                // }
                if(currentLine.pre == 1){
                    addToText(currentLine.lineString[indexA],true)    
                } else {
                    addToText(currentLine.lineString[indexA],false)    
                }
                
                window.scrollTo(0, document.body.scrollHeight);
                setTimeout(function() {
                    displayACharacter(indexA + 1)
                }, currentLine.speed * multiplier);

            };
            if (currentLine.type == 2) {
                displayACharacter(0);
                return;
            } else if (currentLine.type == 4) {
                $.get(currentLine.link, function(text) {
                    addToText("<pre>" + text + "</pre>")
                    displayEndings();
                })
            } else if (currentLine.type == 5) {
                $("#bootLog").css(currentLine.csstype, currentLine.argument);
                displayEndings();
            } else if(currentLine.type == 6) {
                getAndReturnInput(currentLine.argument); 
                window.scrollTo(0, document.body.scrollHeight);  
                return;
            } else if(currentLine.type == 7) {
                getAndSetOptions(currentLine.argument);
                window.scrollTo(0, document.body.scrollHeight);
                return;    
            } else if(currentLine.type == 8){
                currentLine.lineString = getResponse(currentLine.argument,currentLine.destination);
                displayACharacter(0);
                return;    
            } else if(currentLine.type == 9){
                setCookie(currentLine.argument,currentLine.destination);
                displayEndings();
            } else if(currentLine.type == 20){
                $.ajax("/"+currentLine.lineString,{ 
                }).done(function(gameText){
                    if(currentLine.clear == 1){
                        clearWindow();    
                    }                    
                    parseAndExecute(gameText);
                    return;
                });
                return;
            } else {
                if(currentLine.pre == 1){
                    addToText(currentLine.lineString,true)    
                } else {
                    addToText(currentLine.lineString,false)    
                }
                displayEndings();
            }
        }
        displayCurrentLine(0);
    }

    var parseAndExecute = function(text) {
        var text = text.split("\n");
        arr = [];
        var regexp = /\$(.*)\$(.*)/;
        for (var i = 0; i < text.length; i++) {
            var line = text[i];
            console.log("Current Line...", line);
            var res = regexp.exec(line);
            if (res != null) {
                arr.push(JSON.parse(JSON.stringify(defaultBlock)))
                var lineArguments = res[1];
                console.log("Line Arugments", res[1]);
                var args = lineArguments.split(";");
                for (var j = 0; j < args.length; j++) {
                    var aSplit = /([a-z])(.*)/.exec(args[j])
                    if (labels[aSplit[1]] != undefined) {
                        var num = Number(aSplit[2])
                        if(isNaN(num)){
                            arr[arr.length - 1][labels[aSplit[1]]] = aSplit[2];
                        } else {
                            arr[arr.length - 1][labels[aSplit[1]]] = num;
                        }
                        
                    }
                };
                arr[arr.length - 1].lineString = res[2];
            } else {
                arr.push(JSON.parse(JSON.stringify(defaultBlock)))
                arr[arr.length - 1].lineString = line;
            }
        };
        displayAllText();
    }

    var playFromStart = function(){
        $.ajax("/text/intro.txt",{ 
        }).done(function(gameText){
             $.ajax("/text/dialog.txt").done(function(dialogText){
                dialogObject = JSON.parse(dialogText);
                parseAndExecute(gameText);
             })
        });
    }
    var res = getCookie("objective");
    if(params['playagain'] == "true"){
        res = undefined;
        setCookie("objective","false");
    }

    if(res == undefined || res['value'] == "false" ){
        playFromStart();
    } else if(res['value'] == "true"){
        addToText("You've already seen the entire game! If you want to play again, click <a href='?playagain=true'>HERE</a> <br>");
    }

});