<template>
    <div class="container">
        <div v-for="destination in destinations">
            <div class="card-header">Route Option Data</div>
            <div class="card-body" v-if="destination.location">
                <h3>Directions to {{ destination.location}}</h3>
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
                let coordinates = [await this.$parent.getCoordinates(this.start)];
                let dest = await this.$parent.getCoordinates(this.destinations[i].location)

                this.destinations[i].coordinates = dest;
                coordinates.push(this.destinations[i].coordinates);

                let map = coordinates.join(";");
                this.destinations[i].route = await this.$parent.getDirections(map);
                this.$forceUpdate();
            }
        }
    }
}
</script>

<style scoped>

</style>
