<?php


return [

    'access_token' => env('mapbox_access_token', '12345678'),
    'start_point' => env('mapbox_start_point','')
    ];

//The forward geocoding query type allows you to look up a single location by name and returns its geographic coordinates.
//https://api.mapbox.com/geocoding/v5/{endpoint}/{search_text}.json
https://api.mapbox.com/geocoding/v5/mapbox.places/{search_text}.json
//The Mapbox Geocoding API does two things: forward geocoding and reverse geocoding.
//Forward geocoding converts location text into geographic coordinates, turning 2 Lincoln Memorial Circle NW into -77.050,38.889.
