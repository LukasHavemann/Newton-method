//math.js by Lukas Havemann

//The Options for the big plot-view
var plotOptions = {
    legend:{ 
        show: false 
    }, 

    series:{
        lines:{ 
            show: true 
        },
        shadowSize: 0
    },

    yaxis:{ 
        ticks: 10 
    },

    selection:{ 
        mode: "xy" 
    },

    grid:{
        backgroundColor: { 
            colors: ["#fff", "#eee"]
        },

        markings : [
            {
                color: '#000', 
                lineWidth: 1, 
                yaxis:{ 
                    from: 0, 
                    to  : 0, 
                }
            },
            {
                color: '#000',
                lineWidth: 1,
                xaxis:{
                    from: 0,
                    to  : 0
                },

                //the range should be big enough ;-)
                yaxis:{
                    from:  1E100,
                    to  : -1E100
                }
            }
        ]
    }
};

//Options for the Overview plot
var overviewOptions = {
    legend:{
        show: true, 
        container: $("#overviewLegend") 
    },

    series:{
        lines:{
            show: true, 
            lineWidth: 1 
        },
        shadowSize: 2
    },

    grid:{
        color: "#666", 
        backgroundColor:{ 
            colors: ["#fff", "#eee"] 
        } 
    },

    selection:{ 
        mode: "xy" 
    }
}

function diff(func, x){
    var delta = 1e-15
    return (func(x+delta) - func(x-delta)) / ((x+delta) - (x-delta))
}

//cuts the value to a given precision
function cut(value, prec){
    var precision = prec || 100000000;
    return Math.floor(value * precision) / precision;
}

//Configure flot (Code from flot example)
var plot, overview; 
function setupPlot(){
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
        overview.setSelection(ranges, true);
    });
    
    $("#overview").bind("plotselected", function (event, ranges) {
        plot.setSelection(ranges);
    });
}

function plotFunc(){
    //getting the range
    var x1 = parseInt($("#xval1").val()),
        x2 = parseInt($("#xval2").val());

    if(x1 >= x2){
        alert("Falsche Range-Angabe!");
        return false;
    }

    var data    = getData(x1, x2);
    plot        = $.plot($("#plot"), data, plotOptions);
    overview    = $.plot($("#overview"), data, overviewOptions)
}

//generate the 100 P(x|f(x)) for a given range [x1; x2]
function applyFunction(x1, x2, f){
    var data = [];
    for (var i = 0, x; i <= 100; ++i) {
        x = x1 + i * (x2 - x1) / 100;
        data.push([x, f(x)]);
    }

    return data;
}

function updateView(xn, fstr, f, it, tmp){
    $(".tohide").slideUp(1000);
    $("#counter").html(it);

    $("#steps").append([
            '<tr><th class="small">', it,
            "</th><td>", cut(xn), "</td><td>", cut(tmp), 
            "</td><td>", cut(f),  "</td><td>", cut(fstr), 
            "</td></tr>"].join(''));
}

function substitute(string){
    replacements = {
        "SIN"   : "Math.sin",
        "COS"   : "Math.cos",
        "TAN"   : "Math.tan",
        "ASIN"  : "Math.asin",
        "ACOS"  : "Math.acos",
        "ATAN"  : "Math.atan",
        "POW"   : "Math.pow",
        "SQRT"  : "Math.sqrt",
        "ABS"   : "Math.abs",
        "LOG"   : "Math.log",
        "pi"    : "Math.PI",
        "e"     : "Math.E"
    }

    for(var key in replacements){
        for(var i = string.split(key).length-1; i >= 0; i--){
            string = string.replace(key, replacements[key]);
        }
    }

    return string;
}

//standard implementation will be overided while execution of the application
var getData = function(x1, x2) {
    return [
        { 
            label: "sin(x sin(x))", 
            color: "#F00",
            data : applyFunction(x1, x2, function(x) {
                return Math.sin(x * Math.sin(x));
            })  
        }
    ];
}

$(document).ready(function() {
    setupPlot()
    plotFunc()

    $("#arrow").toggle(function(){
        $("#arrow").html(">");
        $("#settings").animate({"right" : "5px"});
    }, function(){
        $("#arrow").html("<");
        $("#settings").animate({"right" : "-340px"});
    });

    var xn = null;
    var funcs = [];
    $("#itstep").click(function(){
        var it  = parseInt($("#counter").html()) +1;
        eval("var func = function(x){ return " + 
             substitute($("#function").val())  + "; }");

        if(xn === null){
            xn = parseInt($("#startval").val())
        }

        var fstr = diff(func, xn),
            f    = func(xn),
            tmp  = xn - (f / fstr);

        funcs.push({
            label : "Tangente " + it,
            func  : (function(xn){
                return function(x) {  
                    return fstr * (x - xn) + f
                }})(xn)
        })

        getData = function(x1, x2) {
            
            var tmp = [
                { 
                    label: $("#function").val(), 
                    data : applyFunction(x1, x2, func),
                    color: "#f00"
                }
            ];
            
            for(var j in funcs){
                tmp.push({
                    label : funcs.label,
                    data  : applyFunction(x1, x2, funcs[j].func),
                    color : "#999"
    
                })
            }
            return tmp;
        }

        updateView(xn, fstr, f, it, tmp)
        xn = tmp;
        plotFunc()
    });
});
