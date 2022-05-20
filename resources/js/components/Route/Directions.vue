<template>
    <div class="row">
        <div v-for="destination in the_destinations">
            <div class="card-header">Route Directions</div>
            <div class="card-body" v-if="destination.location">
                <div class="form-label">
                    <p> Trip:
                        <small> {{ destination.start_point }} </small> to
                        <small> {{ destination.location}} </small>
                    </p>
                </div>
                <div class="form-text">
                    <p>
                        Duration: <small v-if="destination.duration">{{ destination.duration | secondsToMinutes}} <b>Minutes</b> </small>
                        <br/>
                        Driving distance: <small v-if="destination.distance">{{ destination.distance | metresToMiles}} <b>Miles</b></small>
                        <br/>
                        Direct distance: <small v-if="destination.distance_between">{{ destination.distance_between | twoDP }} <b>Miles</b></small>
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
            currentFrom: {location:this.initial_start},
            currentTo: '',
            start: {location:this.initial_start},
            routes:[],
        }
    },
    computed : {
        the_destinations(){
            if (this.routes.length)
                return this.routes;
            return this.destinations;
        },
    },
    mounted(){

    },
    methods: {
        sleep: async function (ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        testReduce: function(){
            let smallestletter = this.destinations.reduce(function (prev,current){
                console.log("PREVIOUS:")
                console.log(prev.location);
                console.log("CURRENT:")
               console.log(current.location);
                console.log("\n\n");
                return prev.location < current.location ? prev : current;
            });
            console.log("the smallest was" + smallestletter.location);
        },
        nextDestination: async function() {
            await this.setStartCoordinates();
            await this.calculateClosestLocation();
            // await this.sleep(10000);
            // let whereTo = this.destinations.reduce(function (prev, current) {
            //     if (prev.routed === true) return current;
            //     return prev.distance_to_next <= current.distance_to_next
            //         ? prev : current;
            // });
            let whereTo = this.destinations.reduce(function (prev, current,i) {
                if (prev.routed === true) return current;
                if (current.routed === true) return prev;
                console.log(i + " PREVIOUS:")
                console.log(prev.location);
                console.log(prev.distance_to_next);
                console.log(i + " CURRENT:")
                console.log(current.location);
                console.log(current.distance_to_next);
                console.log("\n\n");
                return prev.distance_to_next < current.distance_to_next ? prev : current;
                // if (current.routed === true) return prev;
                // return current.distance_to_next < prev.distance_to_next
                //     ? current : prev;
            });
            console.log("the smallest was" + whereTo.location);

            Vue.set(this, 'currentTo',whereTo);
            console.log("current to is " + this.currentTo.location);
            return whereTo;
        },
        resetDestinations: function () {
            Vue.set(this,'routes',[]);
            Vue.set(this,'currentFrom',this.start);
            this.destinations.find(destination => { if ( destination.route === true ) { destination.routed = false; } })
        },
        loadDirections: async function (){
            await this.setDestinationCoordinates();
            for (let i = 0; i < this.destinations.length; i++){

                console.log("current from is " + this.currentFrom.location + "------ iteration " + i);

                let coordinates = [await this.$parent.getCoordinates(this.currentFrom.location)];
                let whereTo = await this.nextDestination();

                console.log("the current to is " + this.currentTo.location);
                whereTo.start_point = this.currentFrom.location;

                let dest = await this.$parent.getCoordinates(this.currentTo.location);
                whereTo.coordinates = dest;
                coordinates.push(whereTo.coordinates);
                let coordinatesList = coordinates.join(";");

                let route = await this.$parent.getDirections(coordinatesList);
                console.log("Route:");
                console.log(route);
                this.destinations.find(destination => { if ( destination.location === whereTo.location ) { destination.routed = true; } })
                this.routes.push({
                    start_point: this.currentFrom.location,
                    location: this.currentTo.location,
                    coordinates: dest,route: route.directions,
                    duration: route.duration,distance: route.distance,distance_between: route.distance_between
                });
                Vue.set(this,'currentFrom',whereTo);
                console.log("we just added 'routed' to the data for " + whereTo.location);

               // await this.sleep(7000);
                this.$forceUpdate();
            }
        },
        calculateClosestLocation: async function() {
            this.destinations.map(async function (destination, i){
                let distance = await this.getDistance(this.currentFrom,destination);

                Vue.set(this.destinations[i],'distance_to_next',distance);
                Vue.set(this.destinations[i],'start_point',this.currentFrom);

            },this);
        },
        getDistance: async function (start, destination){
            let loc1 = {lon:start.coordinates.split(',')[0],lat:start.coordinates.split(',')[1]}
            let loc2 = {lon:destination.coordinates.split(',')[0],lat:destination.coordinates.split(',')[1]}

            let distance = this.$parent.calculateDistanceBetweenLocations(loc1,loc2);
            return distance;
        },
        setStartCoordinates: async function () {
            let start_coordinates = await this.$parent.getCoordinates(this.currentFrom.location);
            Vue.set(this.currentFrom,'coordinates', start_coordinates);
        },
        setDestinationCoordinates: function () {
            this.destinations.map(async function (destination, i)
            {
                let coordinates = await this.$parent.getCoordinates(destination.location);
                Vue.set(this.destinations[i], 'coordinates', coordinates);
            },this);

            return this.destinations;
        },
    }
}
</script>

<style scoped>

</style>
