@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col">
        </div>
        <div class="col-10">
            <h1>Help Centre</h1>
            <div class="card">
                <div class="card-header">
                    How to use the Care Hearted Route Planner
                </div>
                <div class="card-body">
                    <p>Using the Care Hearted Route Planner couldn't be more simple.</p>
                    <p>Once you have logged into the app you will see the Route Planner page where you will plot your route.</p>
                    <p><strong>The first thing you must do is set your starting point.</strong> Enter a post code into the text box and click on the "Set starting point" button. Once your starting point is set, a map will appear with your starting point at the centre. You're now ready to set your destinations. <strong>You can set up to a maximum of 10 destination post codes.</strong> To begin with you'll see one destination box to enter a post code. <strong>Press the "Add another destination" button to add a an additional destination box.</strong></p>
                    <p>Once you have entered all destinations you can plot your route. By pressing the "Plot Route" button your destinations will be ordered by distance and directions between each one will be displayed. The first destination will be the closest postcode to your starting point. The 2nd destination will be the closest postcode to your first destination. The 3rd destination will be the closest postcode to your 2nd destination, and so on.....</p>
                    <p>In addition to the directions given between destinations you are also able to input any 2 postcodes into the map and it will display the quickest route between them.</p>
                    <p>You can log out of the app by clicking your name in the top right corner and clicking "Logout".</p>
                </div>
            </div>
        </div>
        <div class="col">
        </div>
    </div>
</div>
@endsection
