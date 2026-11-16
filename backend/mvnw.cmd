@echo off
setlocal
set "MAVEN_PROJECTBASEDIR=%~dp0"
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

if not exist "%WRAPPER_JAR%" (
  echo Downloading Maven wrapper...
  powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; New-Item -ItemType Directory -Force -Path '%MAVEN_PROJECTBASEDIR%.mvn\wrapper' | Out-Null; Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'"
)

if "%JAVA_HOME%"=="" (
  for /f "delims=" %%i in ('where java') do (
    for %%j in ("%%~dpi..") do set "JAVA_HOME=%%~fj"
    goto javaReady
  )
)
:javaReady
if "%JAVA_HOME%"=="" (
  echo Java was not found. Install JDK 21 or set JAVA_HOME.
  exit /b 1
)

"%JAVA_HOME%\bin\java.exe" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
endlocal
