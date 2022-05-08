<template>
    <div class="row">
        <div v-for="destination in destinations">
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
export default {
    name: "Directions",
    props: ['initial_start', 'initial_destinations'],
    data(){
        return {
            destinations: this.initial_destinations,
            start: {location:this.initial_start}
        }
    },
    mounted(){

    },
    methods: {
        loadDirections: async function (){
            for (let i = 0; i < this.destinations.length; i++){
                if (i === 0)
                    this.destinations[i].start_point = this.start;
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
        addCoordinatesToDestinations: async function () {
            this.destinations.map(async function (destination, i){
                let coordinates = await this.$parent.getCoordinates(destination.location)

                this.destinations[i].coordinates = coordinates;
            },this);
        },
        setStartingPoint: async function () {
            this.start.coordinates = await this.$parent.getCoordinates(this.start.location);
        },
        calculateClosestLocation: function(start, loc1,loc2) {
            this.destinations = this.destinations.sort((loc1, loc2) => {
                let first = {lon:loc1.coordinates.split(',')[0],lat:loc1.coordinates.split(',')[1]}
                let second = {lon:loc2.coordinates.split(',')[0],lat:loc2.coordinates.split(',')[1]}

            });
        },
    }
}
</script>

<style scoped>

</style>
