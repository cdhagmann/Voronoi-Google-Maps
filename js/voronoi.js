d3.json('data/point.geojson', function (pointjson) {
    main(pointjson);
});

function main(pointjson) {

    var map = new google.maps.Map(document.getElementById('map_canvas'), {
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(43.073539, -89.38778),
    });


    var overlay = new google.maps.OverlayView();

    overlay.onAdd = function () {

        var layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "SvgOverlay");
        var svg = layer.append("svg");
        var svgoverlay = svg.append("g").attr("class", "AdminDivisions");


        overlay.draw = function () {
            var markerOverlay = this;
            var overlayProjection = markerOverlay.getProjection();

            var googleMapProjection = function (coordinates) {
                var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
                var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
                return [pixelCoordinates.x + 4000, pixelCoordinates.y + 4000];
            }

            var pointdata = pointjson.features;

            var positions = [];

            pointdata.forEach(function (d) {
                positions.push(googleMapProjection(d.geometry.coordinates)); //位置情報→ピクセル
            });

            var polygons = d3.geom.voronoi(positions);

            var pathAttr = {
                "d": function (d, i) {
                    return "M" + polygons[i].join("L") + "Z"
                },
                stroke: "blue",
                fill: "none"
            };

            svgoverlay.selectAll("path")
                .data(pointdata)
                .attr(pathAttr)
                .enter()
                .append("svg:path")
                .attr("class", "cell")
                .attr(pathAttr)

            var circleAttr = {
                "cx": function (d, i) {
                    return positions[i][0];
                },
                "cy": function (d, i) {
                    return positions[i][1];
                },
                "r": 5,
                fill: "red"
            }

            svgoverlay.selectAll("circle")
                .data(pointdata)
                .attr(circleAttr)
                .enter()
                .append("svg:circle")
                .attr(circleAttr)
        };
    };
    overlay.setMap(map);
}