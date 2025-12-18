# pylint.ps1
$pythonPath = "C:\Users\User\AppData\Local\Programs\Python\Python313\python.exe"
$pylintPath = "C:\Users\User\AppData\Local\Programs\Python\Python313\Scripts\pylint.exe"

# Check if pylint is installed
if (Test-Path $pylintPath) {
    & $pylintPath @args
} else {
    Write-Host "Pylint not found. Installing..." -ForegroundColor Yellow
    & $pythonPath -m pip install pylint
    if (Test-Path $pylintPath) {
        & $pylintPath @args
    } else {
        Write-Host "Using python -m pylint instead" -ForegroundColor Yellow
        & $pythonPath -m pylint @args
    }
}