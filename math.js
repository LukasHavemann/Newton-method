//math.js by Lukas Havemann

function assert(cond, msg){
    if(!cond){
        console.log("Assertion failed: " + msg)
    }    
}

function diff(func, x){
    var delta = 1e-15
    assert(delta != NaN, "delta shoulden't be NaN")
    return (func(x+delta) - func(x-delta)) / ((x+delta) - (x-delta))
}

function test(cond, msg){
    if(cond)
        console.log("[SUCCESS] Test of " + msg + " was successfull")
    else
        console.log("[ERROR] Test of " + msg + " was not successfull")
}

function testModule(){
    console.log("Running unit tests...")
    test(diff(function(x){ return x*x}, 2.0) == 4.0, "function diff");
}

function readInput(){
    $("#function").val()
    parseInt($("#xval").val())
}

var getData = function(x1, x2) {
    var d       = [], 
        xAchse  = [];

    for (var i = 0; i <= 100; ++i) {
        var x = x1 + i * (x2 - x1) / 100;
        d.push([x, Math.sin(x * Math.sin(x))]);
    }

    return [
        { 
            label: "sin(x sin(x))", 
            data: d 
        }
    ];
}

var plotOptions = {
    legend:     { show: false }, 
    series:     {
        lines:  { show: true },
    },
    yaxis:      { ticks: 10 },
    selection:  { mode: "xy" },
    grid:       {
        backgroundColor: { 
            colors: ["#fff", "#eee"]
        },
        markings : [
            { color: '#000', lineWidth: 1, yaxis: { from: 0, to: 0 } }]
    }
};

var overviewOptions = {
    legend: { show: true, container: $("#overviewLegend") },
    series: {
        lines:  { show: true, lineWidth: 1 },
        shadowSize: 2
    },
    grid:   { color: "#666", backgroundColor: { colors: ["#fff", "#eee"] } },
    selection: { mode: "xy" }
}

var plot; 
function plotFunc(){
    var x1 = parseInt($("#xval1").val()),
        x2 = parseInt($("#xval2").val());

    var startData = getData(x1, x2);
    plot = $.plot($("#plot"), startData, plotOptions);

    // setup overview
    var overview = $.plot($("#overview"), startData, overviewOptions)
}

function startup(){
    $("h1").hide() //.fadeOut(6000);
}

function floor(value){
    return Math.floor(value * 100000000) /100000000;
}

$(document).ready(function() {
    testModule()
    startup()
    plotFunc(0, Math.PI * 3)

    $("#arrow").toggle(function(){
        $("#arrow").html(">");
        $("#settings").animate({"right" : "5px"});
    }, function(){
        $("#arrow").html("<");
        $("#settings").animate({"right" : "-340px"});
    });

    var xn = null;
    $("#itstep").click(function(){
        $(".tohide").slideUp(1000);
        var it  = parseInt($("#counter").html()) +1;
        $("#counter").html(it);
        eval("var func = function(x){ return " + $("#function").val() +"; }");

        if(xn === null){
            xn = parseInt($("#startval").val())
        }

        var fstr = diff(func, xn),
            f    = func(xn);
        
        var tmp = xn - (f / fstr);

        $("#steps").append("<tr><th class=\"small\">"+it+"</th><td>"+floor(xn)+"</td><td>"+
                            floor(tmp)+"</td><td>"+floor(f)+"</td><td>"+ 
                            floor(fstr) +"</td></tr>");
        
        getData = function(x1, x2) {
            var d   = []; 

            for (var i=0; i <= 100; i++) {
                var x = x1 + i * (x2 - x1) / 100;
                d.push([x, func(x)]);
            }

            return [
                { 
                    label: $("#function").val(), 
                    data: d 
                }
            ];
        }

        xn = tmp;
        plotFunc()
    });
    // now connect the two
    
    $("#plot").bind("plotselected", function (event, ranges) {
        // clamp the zooming to prevent eternal zoom
        if (ranges.xaxis.to - ranges.xaxis.from < 0.00001)
            ranges.xaxis.to = ranges.xaxis.from + 0.00001;
        if (ranges.yaxis.to - ranges.yaxis.from < 0.00001)
            ranges.yaxis.to = ranges.yaxis.from + 0.00001;
        
        // do the zooming
        plot = $.plot($("#plot"), getData(ranges.xaxis.from, ranges.xaxis.to),
                      $.extend(true, {}, plotOptions, {
                          xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
                          yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
                      }));
        
        // don't fire event on the overview to prevent eternal loop
//        overview.setSelection(ranges, true);
    });
    $("#overview").bind("plotselected", function (event, ranges) {
        plot.setSelection(ranges);
    });
});

