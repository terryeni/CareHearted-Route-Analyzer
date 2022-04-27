<template>
    <div class="container">
        <div class="card">
            <div class="card-header">Route Plan</div>
            <div class="card-body">
                    <div class="col-3 mb-2">
                        <label for="StartingPoint" class="form-label">Start PostCode</label>
                        <div class="row">
                            <input id="StartingPoint" type="text" class="form-control"
                                   aria-describedby="startPostcode" v-model="start"/>
                            <button class="btn btn-dark" @click="setPosition">Set Position</button>
                        </div>
                        <div id="startPostcode" class="form-text">
                            This is the postcode you will plan your route from
                        </div>
                    </div>
                    <div class="row my-3">
                        <div class="col-6">
                            <label for="tripDestination" class="form-label">Destination</label>
                            <input id="tripDestination" class="form-control" type="text" v-model="destination1"/>
                        </div>
                        <div class="col-6">
                            <label for="tripDestination_2" class="form-label">Destination 2</label>
                            <input id="tripDestination_2" class="form-control" type="text" v-model="destination2"/>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" @click="calculateRoute">
                        Route
                    </button>
                <div id="map" style="min-height: 500px;">
                </div>

                <div class="card h-100 mt-3" v-if="location_data">
                    <div class="card-header">Route Options</div>
                    <div class="card-body">
                        <pre>{{ location_data }}</pre>
                    </div>
                </div>
          </div>
        </div>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
export default {
    name: "Test",
    props:['start_point','access_token'],
    data() {
        return {
            start: this.start_point,
            longitude: -1.7775,
            latitude: 52.4159,
            location_data: '',
            destination1: '',
            destination2: '',
        }
    },
    mounted(){
        this.loadmap();
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
            let cord = [];
            let dest1 = await this.getCoordinates(this.destination1);
            let dest2 = await this.getCoordinates(this.destination2);
            cord.push(await this.getCoordinates(this.start),dest1,dest2);
            let destinations = cord.join(";");

            this.getDirections(destinations);
        },
        getDirections: function (coordinates){
            // axios.get('https://api.mapbox.com/directions/v5/mapbox/driving/-84.518641,39.134270;-84.512023,39.102779?'
            axios.get('https://api.mapbox.com/directions/v5/mapbox/driving/'+ coordinates+'?'
                + 'geometries=geojson&access_token=' + this.access_token + '&steps=true')
                .then((response) => {
                    this.location_data = response.data.routes[0].legs[0].steps[0].maneuver.instruction;
                    this.location_data += "\n";
                    this.location_data += response.data.routes[0].legs[0].steps[1].maneuver.instruction;
                    this.location_data += "\n";
                    this.location_data += response.data.routes[0].legs[0].steps[2].maneuver.instruction;
                    this.location_data += "\n";
                    this.location_data += response.data.routes[0].legs[0].steps[3].maneuver.instruction;
                    this.location_data += "\n";
                    this.location_data += response.data.routes[0].legs[0].steps[4].maneuver.instruction;
                    this.location_data += "\n";
                    this.location_data += response.data.routes[0].legs[0].steps[5].maneuver.instruction;
                    this.location_data += "\n";
                    this.location_data += response.data.routes[0].legs[0].steps[6].maneuver.instruction;
                    this.location_data += "\n";
                    this.location_data += response.data.routes[0].legs[0].steps[7].maneuver.instruction;
                    this.location_data += "\n";
                    this.location_data += response.data.routes[0].legs[0].steps[8].maneuver.instruction;
                }).catch(function (error){
                console.log(error);
            });
        },
        getCoordinates: async function (search){
            let cord;
                await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/'
                    + search + '.json?access_token=' + this.access_token)
                        .then((response) => {
                            console.log(response);
                            let longitude = response.data.features[0].geometry.coordinates[0];
                            console.log('longitude' + longitude);
                            let latitude = response.data.features[0].geometry.coordinates[1];
                            console.log('latidtude' + latitude);
                            cord = longitude + ',' + latitude;
                        })
                        .catch(function (error){
                            console.log(error);
                        });
                return cord;
        },
    }
}
</script>

<style scoped>

</style>
