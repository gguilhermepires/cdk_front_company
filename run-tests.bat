@echo off
echo Installing dependencies...
call npm install

echo.
echo Installing Playwright browsers...
call npx playwright install

echo.
echo Running Playwright tests...
call npm run test

echo.
echo Test run complete!
pause