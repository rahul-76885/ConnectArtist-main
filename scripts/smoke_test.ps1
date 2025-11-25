# scripts/smoke_test.ps1
# Runs an end-to-end smoke test for booking flow using local dev server
# 1) Temporarily disable cert validation for this PowerShell session
# 2) Signup (or login) a test organizer
 # scripts/smoke_test.ps1
 # End-to-end smoke test for booking flow using local dev server
 # Usage:
 #   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\smoke_test.ps1
 # Parameters:
 #   -BaseUrl (default https://localhost:5000)
 #   -Email (default smoketest+org@example.com)
 #   -ArtistId (default a sample id, change if invalid)
 #   -PlainPassword (optional; if not provided you'll be prompted securely)

param(
  #!/usr/bin/env pwsh
  # scripts/smoke_test.ps1
  # End-to-end smoke test for booking flow using local dev server
  # Usage:
  #   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\smoke_test.ps1
  # Parameters:
  #   -BaseUrl (default https://localhost:5000)
  #   -Email (default smoketest+org@example.com)
  #   -ArtistId (default a sample id, change if invalid)
  #   -PlainPassword (optional SecureString; if not provided you'll be prompted securely)

  param(
    #!/usr/bin/env pwsh
    # scripts/smoke_test.ps1
    # End-to-end smoke test for booking flow using local dev server
    # Usage:
    #   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\smoke_test.ps1
    # Parameters:
    #   -BaseUrl (default https://localhost:5000)
    #   -Email (default smoketest+org@example.com)
    #   -ArtistId (default a sample id, change if invalid)
    #   -PlainPassword (optional SecureString; if not provided you'll be prompted securely)

    param(
      [string]$BaseUrl = 'https://localhost:5000',
      [string]$Email = 'smoketest+org@example.com',
      [string]$ArtistId = '68bde1fbcd2e93059ea312d5',
      [System.Security.SecureString]$PlainPassword
    )

    # Allow self-signed certs for this session (local dev)
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $logDir = Join-Path $scriptDir '..\logs'
    if (-not (Test-Path $logDir)) { New-Item -Path $logDir -ItemType Directory | Out-Null }
    $logPath = Join-Path $logDir 'smoke_test_output.log'
    New-Item -Path $logPath -Force -ItemType File | Out-Null

    function Log([string]$s){ $t = "$(Get-Date -Format o) `t $s"; Add-Content -Path $logPath -Value $t; Write-Host $t }

    try {
      Log "Starting smoke test against $BaseUrl"

      #!/usr/bin/env pwsh
      # scripts/smoke_test.ps1
      # End-to-end smoke test for booking flow using local dev server
      # Usage:
      #   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\smoke_test.ps1
      # Parameters:
      #   -BaseUrl (default https://localhost:5000)
      #   -Email (default smoketest+org@example.com)
      #   -ArtistId (default a sample id, change if invalid)
      #   -PlainPassword (optional SecureString; if not provided you'll be prompted securely)

      param(
        [string]$BaseUrl = 'https://localhost:5000',
        [string]$Email = 'smoketest+org@example.com',
        [string]$ArtistId = '68bde1fbcd2e93059ea312d5',
        [System.Security.SecureString]$PlainPassword
      )

      # Allow self-signed certs for this session (local dev)
      [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

      $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
      $logDir = Join-Path $scriptDir '..\logs'
      if (-not (Test-Path $logDir)) { New-Item -Path $logDir -ItemType Directory | Out-Null }
      $logPath = Join-Path $logDir 'smoke_test_output.log'
      New-Item -Path $logPath -Force -ItemType File | Out-Null

      function Log([string]$s){ $t = "$(Get-Date -Format o) `t $s"; Add-Content -Path $logPath -Value $t; Write-Host $t }

      try {
        Log "Starting smoke test against $BaseUrl"

        #!/usr/bin/env pwsh
        # Clean smoke_test.ps1 - minimal, single-block script

        param(
          [string]$BaseUrl = 'https://localhost:5000',
          [string]$Email = 'smoketest+org@example.com',
          [string]$ArtistId = '68bde1fbcd2e93059ea312d5',
          [System.Security.SecureString]$PlainPassword
        )

        # Allow self-signed certs for this session (local dev)
        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
        $logDir = Join-Path $scriptDir '..\logs'
        if (-not (Test-Path $logDir)) { New-Item -Path $logDir -ItemType Directory | Out-Null }
        $logPath = Join-Path $logDir 'smoke_test_output.log'
        New-Item -Path $logPath -Force -ItemType File | Out-Null

        function Log([string]$s) {
          $t = "$(Get-Date -Format o) `t $s"
          Add-Content -Path $logPath -Value $t
          Write-Host $t
        }

        try {
          Log "Starting smoke test against $BaseUrl"

          if (-not $PlainPassword) {
            $securePwd = Read-Host -Prompt "Password for $Email" -AsSecureString
          } else {
            $securePwd = $PlainPassword
          }

          $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
          $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
          [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) | Out-Null

          # Signup (or login if exists)
          $signupBody = @{ name = 'Smoke Tester'; email = $Email; password = $plainPassword } | ConvertTo-Json
          try {
            $resp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/signup" -Method POST -ContentType 'application/json' -Body $signupBody -UseBasicParsing -ErrorAction Stop
            Log "Signup success"
          } catch {
            Log "Signup failed (maybe exists) - trying login"
            $loginBody = @{ email = $Email; password = $plainPassword } | ConvertTo-Json
            $resp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType 'application/json' -Body $loginBody -UseBasicParsing -ErrorAction Stop
            Log "Login success"
          }

          $token = $resp.token
          if (-not $token) { throw "No token returned" }
          Log "Token length: $($token.Length)"

          # write token
          $tokenPath = Join-Path $logDir 'smoke_test_token.txt'
          Set-Content -Path $tokenPath -Value $token -Force
          Log "Token written to $tokenPath"

          # Create booking
          $bookingBody = @{ eventDate = (Get-Date).AddDays(1).ToString('yyyy-MM-dd'); eventTime = '18:00'; eventLocation = 'Smoke Test Venue'; organizerPhone = '+919876543210'; notes = 'Smoke test booking' } | ConvertTo-Json
          #!/usr/bin/env pwsh
          # Clean final smoke_test.ps1

          param(
            [string]$BaseUrl = 'https://localhost:5000',
            [string]$Email = 'smoketest+org@example.com',
            [string]$ArtistId = '68bde1fbcd2e93059ea312d5',
            [System.Security.SecureString]$PlainPassword
          )

          # Allow self-signed certs for this session (local dev)
          [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

          $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
          $logDir = Join-Path $scriptDir '..\logs'
          if (-not (Test-Path $logDir)) { New-Item -Path $logDir -ItemType Directory | Out-Null }
          $logPath = Join-Path $logDir 'smoke_test_output.log'
          New-Item -Path $logPath -Force -ItemType File | Out-Null

          function Log([string]$s) { $t = "$(Get-Date -Format o) `t $s"; Add-Content -Path $logPath -Value $t; Write-Host $t }

          try {
            Log "Starting smoke test against $BaseUrl"

            if (-not $PlainPassword) { $securePwd = Read-Host -Prompt "Password for $Email" -AsSecureString } else { $securePwd = $PlainPassword }
            $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
            $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) | Out-Null

            # Signup or login
            $signupBody = @{ name = 'Smoke Tester'; email = $Email; password = $plainPassword } | ConvertTo-Json
            try { $resp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/signup" -Method POST -ContentType 'application/json' -Body $signupBody -UseBasicParsing -ErrorAction Stop; Log "Signup success" } 
            catch { Log "Signup failed, trying login"; $loginBody = @{ email = $Email; password = $plainPassword } | ConvertTo-Json; $resp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType 'application/json' -Body $loginBody -UseBasicParsing -ErrorAction Stop; Log "Login success" }

            $token = $resp.token
            if (-not $token) { throw "No token returned" }
            Log "Token length: $($token.Length)"

            Set-Content -Path (Join-Path $logDir 'smoke_test_token.txt') -Value $token -Force
            Log "Token written"

            $headers = @{ Authorization = "Bearer $token" }
            $bookingBody = @{ eventDate = (Get-Date).AddDays(1).ToString('yyyy-MM-dd'); eventTime = '18:00'; eventLocation = 'Smoke Test Venue'; organizerPhone = '+919876543210'; notes = 'Smoke test booking' } | ConvertTo-Json
            $createResp = Invoke-RestMethod -Uri "$BaseUrl/api/escrow/bookings/artist/$ArtistId/create-order" -Method POST -Headers $headers -ContentType 'application/json' -Body $bookingBody -UseBasicParsing -ErrorAction Stop
            Log "Create-order response received"

            $bookingId = $null
            if ($createResp.bookingId) { $bookingId = $createResp.bookingId } elseif ($createResp.booking -and $createResp.booking._id) { $bookingId = $createResp.booking._id }
            if (-not $bookingId) { throw "No booking id in response" }
            Log "BookingId: $bookingId"

            $bookings = Invoke-RestMethod -Uri "$BaseUrl/api/organizer/bookings" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
            Log "Organizer bookings count: $($bookings.bookings.Count)"

            $outFile = Join-Path $scriptDir "..\booking-$bookingId-receipt.pdf"
            Invoke-RestMethod -Uri "$BaseUrl/api/debug/bookings/$bookingId/files/receipt" -OutFile $outFile -Headers $headers -UseBasicParsing -ErrorAction Stop
            Log "Downloaded receipt to $outFile"

            $markResp = Invoke-RestMethod -Uri "$BaseUrl/api/escrow/bookings/$bookingId/mark-success" -Method POST -Headers $headers -UseBasicParsing -ErrorAction Stop
            Log "Mark-success response: $((ConvertTo-Json $markResp -Depth 2))"

            Log "Smoke test completed successfully"
          } catch {
            Log "Smoke test failed: $_"
          } finally {
            [System.Net.ServicePointManager]::ServerCertificateValidationCallback = $null
          }

          Write-Host "Smoke test log written to: $logPath"