@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <mapbox-test
                    v-bind:access_token="'{{config('mapbox.access_token')}}'"
                    v-bind:start_point="'{{config('mapbox.start_point')}}'"
                ></mapbox-test>
                {{config('mapbox.access_token')}}
            </div>
        </div>
    </div>
@endsection
