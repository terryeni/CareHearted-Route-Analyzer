<template>
    <div class="row">
        <div v-for="destination in the_destinations">
            <div class="card-header">Route Directions</div>
            <div class="card-body" v-if="destination.location">
                <div class="form-label">
                    <p> Trip:
                        <small> {{ destination.start_point.location.toUpperCase() }} </small> to
                        <small> {{ destination.location.toUpperCase() }} </small>
                    </p>
                </div>
                <div class="form-text">
                    <p>
                        Duration: <small>{{ destination.duration | secondsToMinutes }} <b>minutes</b> </small>
                        <br/>
                        Distance: <small>{{ destination.distance | metresToMiles }} <b>miles</b></small>
                        <br/>
                        <span v-if="destination.distance_between">
                        As the crow flies: <small>{{ destination.distance_between | twoDP }} <b>Miles</b></small>
                        </span>
                    </p>
                </div>
                <pre>{{ destination.route || 'Preparing to fetch route information...\nClick Route to complete.' }}</pre>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from "vue";

export default {
    name: "Directions",
    props: ['initial_start', 'initial_destinations'],
    data(){
        return {
            destinations: this.initial_destinations,
            start: this.initial_start,
            currentFrom: this.initial_start,
            currentTo: '',
            routes:[],
        }
    },
    mounted(){

    },
    computed: {
        the_destinations() {
            return this.routes;
        }
    },
    methods: {
        calculateRoutes: async function ( ){
            await this.calculateClosestLocation();
            this.pickNextDestination();
            await this.getRoute();
        },
        getRoute: async function () {
            let coordinatesList = [this.currentFrom.coordinates];
            coordinatesList.push(this.currentTo.coordinates);
            let coordinates = coordinatesList.join(";");

            let route = await this.$parent.getDirections(coordinates);

            Vue.set(this.currentTo,'start_point',this.start);
            Vue.set(this.currentTo,'route',route.directions);
            Vue.set(this.currentTo,'duration',route.duration);
            Vue.set(this.currentTo,'distance',route.distance);
            Vue.set(this.currentTo,'distance_between',route.distance_between);

            this.routes.push(this.currentTo);
        },
        loadDirections: async function (){
            await this.calculateClosestLocation();
            for (let i = 0; i < this.destinations.length; i++){
                if (i === 0){
                    if (!this.start.coordinates)
                        await this.setStartingPoint();
                    this.destinations[i].start_point = this.start;
                }
                else
                    this.destinations[i].start_point = this.destinations[i-1];

                let coordinatesList = [this.destinations[i].start_point.coordinates];
                coordinatesList.push(this.destinations[i].coordinates);

                let coordinates = coordinatesList.join(";");
                let route = await this.$parent.getDirections(coordinates);

                this.destinations[i].route = route.directions;
                this.destinations[i].duration = route.duration;
                this.destinations[i].distance = route.distance;
                this.destinations[i].distance_between = route.distance_between;

            }
            this.$forceUpdate();
        },
        calculateClosestDestination: async function() {
            let start_cord = {lon:this.start.coordinates.split(',')[0],lat:this.start.coordinates.split(',')[1]};

            this.destinations = this.destinations.sort((loc1, loc2) => {
                let first = {lon:loc1.coordinates.split(',')[0],lat:loc1.coordinates.split(',')[1]}
                let second = {lon:loc2.coordinates.split(',')[0],lat:loc2.coordinates.split(',')[1]}

                if (this.$parent.calculateDistanceBetweenLocations(start_cord, first) <
                    this.$parent.calculateDistanceBetweenLocations(start_cord, second)) {
                    return -1;
                }

                if (this.$parent.calculateDistanceBetweenLocations(start_cord, first) >
                    this.$parent.calculateDistanceBetweenLocations(start_cord, second)) {
                    return 1;
                }
                return 0;
            });

        },
        setStartingPoint: async function () {
            let start_coordinates = await this.$parent.getCoordinates(this.start.location);
            Vue.set(this.start,'coordinates', start_coordinates);
        },
        calculateClosestLocation: async function() {
            this.destinations.map(async function (destination, i){
                let distance = await this.getDistance(this.start,destination);

                Vue.set(this.destinations[i],'distance_to_next',distance);

            },this);
        },
        pickNextDestination: function () {
            let id_to_remove;
            this.count = this.destinations.length;
            this.destinations.map(function (destination, i) {
                if (i < this.destinations.length-1) {
                    if (destination.distance_to_next < this.destinations[i + 1].distance_to_next) {
                        Vue.set(this,'currentTo',destination);
                        id_to_remove = i;
                    } else {
                        Vue.set(this,'currentTo',this.destinations[i+1]);
                        id_to_remove = i;
                    }
                }
            },this, id_to_remove)
        },
        getDistance: async function (start, destination){
            let loc1 = {lon:start.coordinates.split(',')[0],lat:start.coordinates.split(',')[1]}
            let loc2 = {lon:destination.coordinates.split(',')[0],lat:destination.coordinates.split(',')[1]}

            let distance = this.$parent.calculateDistanceBetweenLocations(loc1,loc2);
            return distance;
        },
    }
}
</script>

<style scoped>

</style>
