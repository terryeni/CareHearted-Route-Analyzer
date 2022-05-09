<template>
    <div class="row">
        <div v-for="destination in destinations">
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
                        Duration: <small>{{ destination.duration | secondsToMinutes}} <b>minutes</b> </small>
                        <br/>
                        Driving distance: <small>{{ destination.distance | metresToMiles}} <b>miles</b></small>
                        <br/>
                        Direct distance: <small>{{ destination.distance_between }} <b>Miles</b></small>
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
    props: ['start', 'initial_destinations'],
    data(){
        return {
            destinations: this.initial_destinations
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
                    this.destinations[i].start_point = this.destinations[i-1].location;

                let coordinates = [await this.$parent.getCoordinates(this.destinations[i].start_point)];
                let dest = await this.$parent.getCoordinates(this.destinations[i].location)

                this.destinations[i].coordinates = dest;
                coordinates.push(this.destinations[i].coordinates);
                let coordinatesList = coordinates.join(";");

                if (!this.destinations[i].route){
                    let route = await this.$parent.getDirections(coordinatesList);

                    this.destinations[i].route = route.directions;
                    this.destinations[i].duration = route.duration;
                    this.destinations[i].distance = route.distance;
                    this.destinations[i].distance_between = route.distance_between;
                }
                else {
                    console.log("skipping getDirections");
                }
                this.$forceUpdate();
            }
        }
    }
}
</script>

<style scoped>

</style>
