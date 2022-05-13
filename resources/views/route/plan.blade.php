@extends('layouts.app')

<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.0/mapbox-gl-directions.js"></script>
<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.0/mapbox-gl-directions.css" type="text/css">

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-2">
            </div>
            <div class="col-8">
                <route-planner
                    v-bind:access_token="'{{config('mapbox.access_token')}}'"
                    v-bind:start_point="'{{config('mapbox.start_point')}}'"
                ></route-planner>
            </div>
            <div class="col-2">
            </div>
        </div>
    </div>
@endsection
