<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Scripts -->
    <script src="{{ asset('js/app.js') }}" defer></script>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">
    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <link href="{{ asset('css/signin.css') }}" rel="stylesheet">
</head>

  <body class="text-center">
    <form method="POST" action="{{ route('login') }}">
    @csrf
      <img class="mb-4" src="{{ asset('images/logo-carehearted_1.png') }}" alt="">
      <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
        @error('email')
            <div class="alert alert-warning" role="alert">
                {{ $message }}
            </div>
        @enderror    
        @error('password')
        <div class="alert alert-warning" role="alert">
            {{ $message }}
        </div>
        @enderror  
      <div class="row">
        <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email" autofocus placeholder="Email Address">
      </div>
      <div class="row">&nbsp;</div>
      <div class="row">
        <input id="password" type="password" class="form-control @error('password') is-invalid @enderror" name="password" required autocomplete="current-password" placeholder="Password">
      </div>  
      <div class="checkbox mb-3">
        <input class="form-check-input" type="checkbox" name="remember" id="remember" {{ old('remember') ? 'checked' : '' }}>
        <label class="form-check-label" for="remember">
            {{ __('Remember Me') }}
        </label>
      </div>
      <div class="row">
        <button type="submit" class="btn btn-primary">
                {{ __('Login') }}
        </button>
      </div>        
      @if (Route::has('password.request'))
        <a class="btn btn-link" href="{{ route('password.request') }}">
            {{ __('Forgot Your Password?') }}
        </a>
      @endif
      <p class="mt-5 mb-3 text-muted">&copy; <?php echo date('Y');?></p>
    </form>
  </body>
</html>