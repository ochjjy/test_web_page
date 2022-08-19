
const _sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

var get_test_result = false;
var is_clear_test_result = false;

function readTextFile(file, cb_result)
{
    var rawFile = new XMLHttpRequest();
    //alert("file: " + file);
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                cb_result(allText);
            }
        }
    }
    rawFile.send(null);
}

function writeTextFile(file, strData, elementID, cb_result)
{
    var rawFile = new XMLHttpRequest();
    //alert("file: " + file);
    rawFile.open("POST", file, false);
    document.getElementById(elementID).value = "open file...";
    rawFile.onreadystatechange = function ()
    {
        document.getElementById(elementID).value = "check ready state...";
        if(rawFile.readyState === 4)
        {
            document.getElementById(elementID).value = "write file...";
            // if(rawFile.status === 200 || rawFile.status == 0)
            // {
            //     var allText = rawFile.responseText;
            //     cb_result(allText);
            // }
            rawFile.send(strData);
            cb_result(elementID);
        }
    }
    rawFile.send(null);
}


function read_data_loop()
{
    readTextFile("data.txt", function(data)
    {
        alert(data);
    });
}

function clear_test_result(elementID) {
    is_clear_test_result = true;
   // send data to url
   destUrl = "http://192.167.0.117:8887";
   alert("clear_test_result(), destUrl: " + destUrl);
   
   fetch(
       destUrl,
       {
           method: 'POST',
           body: JSON.stringify({
               "PROCESSING_LOG" : "Waiting for test result..."
           })
       }
   )     
   is_clear_test_result = false;  
   show_test_result(elementID);
}
    
function clear_text_area(elementID)
{    
    document.getElementById(elementID).value = "";
    const dataStr = {"PROCESSING_LOG":"Waiting for test result..."};
    writeTextFile('./test_log.txt', "", function(elementID){
        document.getElementById(elementID).value = "clear text area";
        show_test_result(elementID);
    });
}

function reload_page()
{
    get_test_result = false;
    alert("reload page");
    window.location.reload();
}

function get_current_time()
{
    var d = new Date();
    return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

function run_show_result_worker() {
    var worker = new Worker('./show_result_worker.js');
    worker.onmessage = function(e) {
        alert(e.data);
    }
    worker.postMessage("Hello World");
}

function show_test_result(elementID) {
    alert("show_test_result(), elementID: " + elementID);
    document.getElementById(elementID).value = "Start...";
    var timeout_count = 0;
    var read_text = "";
    
    document.getElementById(elementID).value = "start read for result..."+timeout_count;

    // wait for the file exists
    const waiting = async() => {
        while (true)
        {        
            // wait for result file
            // show input1 value in alert
            readTextFile('./test_log.txt', function(text){
                read_text = text;
                // document.getElementById(elementID).value = text;
            });

            // if read_text has "Waitig for test result...", then wait for the file exists
            if (read_text != "")
            {
                json = JSON.parse(read_text);
                if(json['PROCESSING_LOG'] == "Waiting for test result...") {
                    document.getElementById(elementID).value = "Waitig for test result..."+get_current_time();    
                }else{
                    read_text = JSON.stringify(json, null, 4);
                    document.getElementById(elementID).value = read_text;
                }
            }
            // else{
            //     get_test_result = false;
            // }

            // if (!get_test_result) {
            //     document.getElementById(elementID).value = "Waitig for test result..."+get_current_time();
            // }

            await _sleep(1000);
        }
    };
    waiting();
}
