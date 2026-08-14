$headers = @{
  Origin = 'http://localhost:3001'
  'Access-Control-Request-Method' = 'POST'
}

$response = Invoke-WebRequest -Method OPTIONS -Uri 'http://localhost:5000/api/v1/auth/register' -Headers $headers -SkipHttpErrorCheck

Write-Output "STATUS=$($response.StatusCode)"
Write-Output "ACAO=$($response.Headers['Access-Control-Allow-Origin'])"
Write-Output "METHODS=$($response.Headers['Access-Control-Allow-Methods'])"
Write-Output "HEADERS=$($response.Headers['Access-Control-Allow-Headers'])"
