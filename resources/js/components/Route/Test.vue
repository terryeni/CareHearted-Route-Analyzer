<template>
    <div class="container">
        <div class="card">
            <div class="card-header">Route Plan</div>
            <div class="card-body">
                <form>
                    <div class="col-3 mb-2">
                        <label for="StartingPoint" class="form-label">Start PostCode</label>
                        <input id="StartingPoint" type="text" class="form-control" :value="start_point"
                               aria-describedby="startPostcode"/>
                        <div id="startPostcode" class="form-text">
                            This is the postcode you will plan your route from
                        </div>
                    </div>
                    <div class="row my-3">
                        <div class="col-6">
                            <label for="tripDestination" class="form-label">Destination</label>
                            <input id="tripDestination" class="form-control" type="text" name="tripDestination[]"/>
                        </div>
                        <div class="col-6">
                            <label for="tripDestination_2" class="form-label">Destination 2</label>
                            <input id="tripDestination_2" class="form-control" type="text" name="tripDestination[]"/>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Route</button>
                </form>
          </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Test",
    props:['start_point','access_token']
}
</script>

<style scoped>

</style>
