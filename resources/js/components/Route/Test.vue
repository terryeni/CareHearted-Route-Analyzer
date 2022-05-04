<template>
    <div class="container">
        <div class="well">
            <div class="col-3 mb-2">
                <label for="StartingPoint" class="form-label">Starting Point PostCode</label>
                <div class="row">
                    <input id="StartingPoint" type="text" class="form-control" aria-describedby="startPostcode" v-model="start"/>
                </div>
                <div id="startPostcode" class="form-text">
                    This is the postcode you will start from
                </div>                
                <div class="row my-3">
                    <button class="btn btn-primary" @click="setPosition">Set starting point</button>
                </div>

            </div>
            <div class="row my-3">
                <label for="destinationsList" class="form-label">Destination Postcodes</label>
                <div class="col align-content-center">
                    <button v-show="destinations.length < 10" @click="addInput" type="button"
                            id="add-destination-button" class="btn btn-outline-secondary">
                        <!--<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>-->
                        Add another destination
                        <span class="visually-hidden">Button</span>
                    </button>
                </div>
            </div>
            <div class="row">
                <div v-for="(destination, i, n ) in destinations" :key="'destination-'+i" class="row col-6">
                    <div class="col-8 pt-1">
                        <label for="tripDestination" class="form-label">Destination {{ n }}</label>
                        <input id="tripDestination" class="form-control" type="text" v-model="destination.location"/>
                    </div>
                    <div class="col-4 mt-auto">
                        <button v-show="destinations.length > 1" @click="removeInput(i)" type="button" class="btn btn-outline-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                            <span class="visually-hidden">Button</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="row my-3">
                <!--<button type="submit" class="btn btn-primary" @click="calculateRoute">
                    Test
                </button>-->
                <button type="submit" class="btn btn-primary" @click="loadDestinations">
                    Plot Route
                </button>
            </div>
<!--                <div id="map" style="min-height: 500px;">-->
<!--                </div>-->

            <div class="card h-100 mt-3" v-if="destinations[0].location">
                <directions
                    ref="directions"
                    v-bind:initial_destinations="destinations"
                    v-bind:start="start"
                ></directions>
            </div>
        </div>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import Directions from "./Directions";
export default {
    name: "Test",
    components: {Directions},
    props:['start_point','access_token'],
    data() {
        return {
            start: this.start_point,
            longitude: -1.7775,
            latitude: 52.4159,
            location_data: '',
            destination1: '',
            destination2: '',
            destinations: [{location:''}],
        }
    },
    mounted(){
        // this.loadmap();
    },
    methods:{
        loadmap: function (){
            mapboxgl.accessToken = this.access_token;
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [this.longitude, this.latitude],
                zoom: 13
            });
            map.addControl(
                new MapboxDirections({
                    accessToken: mapboxgl.accessToken
                }),
                'top-left'
            );
        },
        setPosition: function (){
            // call https://api.mapbox.com/geocoding/v5/{endpoint}/{search_text}.json?access_token=
            axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/'
                + this.start + '.json?access_token=' + this.access_token)
                .then((response) => {
                    this.longitude = response.data.features[0].geometry.coordinates[0];
                    this.latitude = response.data.features[0].geometry.coordinates[1];
                    this.location_data = response;
                    this.loadmap();
                }).catch(function (error){
                    console.log(error);
                });
        },
        calculateRoute: async function (){
            this.destinations.push({location:'B92 0DL'},{location:'B92 8PS'});
        },
        getDirections: async function (coordinates){
            let route = {directions:''};
            // axios.get('https://api.mapbox.com/directions/v5/mapbox/driving/-84.518641,39.134270;-84.512023,39.102779?'
            await axios.get('https://api.mapbox.com/directions/v5/mapbox/driving/'+ coordinates+'?'
                + 'geometries=geojson&access_token=' + this.access_token + '&steps=true')
                .then((response) => {
                    // this.location_data = response.data;
                    // response.data.routes[0].distance returns distance in meters
                    // response.data.routes[0].duration returns travel time in seconds
                    let steps = response.data.routes[0].legs[0].steps;

                    steps.map(function (step,i){
                        route.directions += step.maneuver.instruction;
                        route.directions += "\n";
                    },[this,route])

                    route.duration = response.data.routes[0].duration;
                    route.distance = response.data.routes[0].distance;
                }).catch(function (error){
                console.log(error);
            });

            return route;
        },
        getCoordinates: async function (search){
            let cord;
                await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/'
                    + search + '.json?access_token=' + this.access_token)
                        .then((response) => {

                            let longitude = response.data.features[0].geometry.coordinates[0];
                            let latitude = response.data.features[0].geometry.coordinates[1];
                            cord = longitude + ',' + latitude;

                        })
                        .catch(function (error){
                            console.log(error);
                        });
                return cord;
        },
        loadDestinations: function (){
            this.$refs.directions.loadDirections();
        },
        addInput: function () {
            this.destinations.push({location:''});
        },
        removeInput(index){
            this.destinations.splice(index, 1);
        }
    }
}
</script>

<style scoped>

</style>
