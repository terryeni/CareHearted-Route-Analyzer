@extends('layouts.app')

<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.0/mapbox-gl-directions.js"></script>
<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.0/mapbox-gl-directions.css" type="text/css">

@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <mapbox-test
                    v-bind:access_token="'{{config('mapbox.access_token')}}'"
                    v-bind:start_point="'{{config('mapbox.start_point')}}'"
                ></mapbox-test>
            </div>
        </div>
    </div>
@endsection
