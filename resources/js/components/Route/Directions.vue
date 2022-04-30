<template>
    <div class="container">
        <div v-for="destination in dests">
            <div class="card-header">Route Option Data</div>
            <div class="card-body">
                <pre>{{ destination.route }}</pre>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Directions",
    props: ['start', 'destinations'],
    data(){
        return {
            dests: this.destinations
        }
    },
    mounted(){
        this.loadDirections();
    },
    methods: {
        loadDirections: async function (){
            for (let i = 0; i < this.dests.length; i++){
                let coordinates = [await this.$parent.getCoordinates(this.start)];
                let dest = await this.$parent.getCoordinates(this.dests[i].location)

                this.dests[i].coordinates = dest;
                coordinates.push(this.dests[i].coordinates);

                let map = coordinates.join(";");
                this.dests[i].route = await this.$parent.getDirections(map);
                this.$forceUpdate();
            }
        }
    }
}
</script>

<style scoped>

</style>
