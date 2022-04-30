<template>
    <div class="container">
        <div class="card-header">Route Option Data</div>
        <div class="card-body">
            <pre>{{ direction_data }}</pre>
        </div>
    </div>
</template>

<script>
export default {
    name: "Directions",
    props: ['direction_data']
}
</script>

<style scoped>

</style>
