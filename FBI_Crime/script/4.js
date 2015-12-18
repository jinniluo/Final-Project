var width=800,
    height=500;

//var plot = d3.select("#plot")
//    .append("div")
//    .attr("class", "chart")
//    .style("width", width + "px")
//    .style("height", height + "px")
//    .append("svg")
//    .attr("width", width)
//    .attr("height", height);

var margin = {t:0,r:0,b:0,l:0};
//var width = document.getElementById('plot').clientWidth - margin.r - margin.l,
//    height = document.getElementById('plot').clientHeight - margin.t - margin.b;
//var width=1000,
//    height=600;

var plot = d3.select('#plot')
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');
//var canvas=d3.select('.canvas')
//
//var plot2=d3.selectAll('#plot-2')
//    .append('svg')
//    .attr('width',width)
//    .attr('height',height)
//    //.attr('transform',"translate")
//    .attr('class','canvas');

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([0, height]);


var partition = d3.layout.partition()
    .children(function(d){
        return d.values;})
    .value(function(d) { return d.number; });

var color = d3.scale.category20b();

queue()
    .defer(d3.csv,'data/Table2.csv',parse)
    .await(dataLoaded);
//dataLoaded
function dataLoaded(err,Table) {
    draw(Table);
}

function draw(Table) {

    var nestedData=d3.nest()
        .key(function(d){return d.states})
        .key(function(d){return d.town})
        .entries(Table)
        .sort(function(a,b){
            return a.value - b.value; //sort by top-level activities
        });



    console.log('nestedData', nestedData);
    var hierarchy = {
        key: "United States",
        //Key:'town',
        values: nestedData
    };

    console.log('hierarchy',hierarchy)
//draw the group and add its position values
    var group=plot.selectAll('g')
        .data(partition(hierarchy))
        .enter()
        .append("g")
        .attr('transform',function(d){ return "translate("  +x(d.y) + "," + y(d.x) + ")"})
        .on('click',click);

    var kx = width/hierarchy.dx,
        ky = height/1;

    group
        .append('rect')
        .attr()
        .attr("width", hierarchy.dy*kx)
        .attr("fill", function(d) { return color((d.children ? d : d.parent).key); })
        .attr('stroke',"lightgrey")
        .attr("height", function(d) { return d.dx*ky});

    //append the value
    group
        .append("text")
        .attr('class',"text1")
        .attr("dy",".35em")
        //.attr("transform", transform1)
        .attr('transform',function(d){return "translate(130," + d.dx * ky/2 + ")";})//control the original
        .text(function(d){
            return d.value
        })
        .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });

    //append key
     group
        .append("text")
        .attr('class','text2')
        .attr("dy",".35em")
        .attr("transform",function(d){return "translate(30," + d.dx * ky/2 + ")";} )
        .text(function(d) {
            return d.key;
        })
        .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });


    //append type
    group
        .append("text")
        .attr('class','text3')
        .attr("dy",".35em")
        //.attr("transform", transform1)
        .attr("transform",function(d){return "translate(30," + d.dx * ky/2 + ")";} )
        .text(function(d) {return d.type})
        .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });


    d3.select(window)
        .on("click", function() { click(hierarchy); });

    function click(d) {


        //if (!d.children) return;
        console.log(d3.select(this).data())

        kx = (d.y ? width - 40 : width) / (1 - d.y);
        ky = height / d.dx;
        x.domain([d.y, 1]).range([d.y ? 40 : 0, width]);
        y.domain([d.x, d.x + d.dx]);

        var t = group.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

        t.select("rect")
            .attr("width", d.dy * kx)
            .attr("height", function(d) { return d.dx * ky; });

        t.select("text")
            //.attr('class','text')
            .attr("transform", function(d){return "translate(130," + d.dx * ky/2 + ")";})
            .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });

        //t.select(".text2")
        //    //.attr('class','text2')
        //    .attr("transform", function(d){return "translate(100," + d.dx * ky/6 + ")";})
        //    .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });

        d3.event.stopPropagation();
    }

    //function transform1(d) {
    //    return "translate(100," + d.dx * ky/2 + ")";
    //}

    //function transform2(d) {
    //    return "translate(70," + d.dx * ky/2 + ")";
    //}

}


function parse(d){
    return {
        states: d['State'],
        town: d['Town'],
        number:+d.Crimes,
        type: d.Type

    };

}
