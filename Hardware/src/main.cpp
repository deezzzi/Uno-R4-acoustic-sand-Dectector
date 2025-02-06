// Include required libraries
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <arduinoFFT.h>
#include <WiFiS3.h>

// WiFi credentials
const char* ssid = "Bixyl_Lab";
const char* password = "bixyldell95";

// Define constants for FFT
#define SAMPLES 128             // Must be a power of 2
#define SAMPLING_FREQUENCY 10000 // Hz
#define AMPLITUDE_THRESHOLD 200  // Adjust based on testing

// Define pins
const int SOUND_SENSOR_PIN = A0;

// Initialize objects
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Set the LCD address to 0x27

arduinoFFT FFT = arduinoFFT();
WiFiServer server(80);

// Variables for FFT
double vReal[SAMPLES];
double vImag[SAMPLES];
unsigned long microseconds;

// Variables for sand detection
float currentSandLevel = 0.0;
unsigned long lastSampleTime = 0;
const unsigned long SAMPLE_INTERVAL = 1000; // 1 second between samples

// Function to analyze sand signature from FFT data
float analyzeSandSignature(double *vData) {
  float sandLevel = 0;
  for (int i = 2; i < SAMPLES/2; i++) {
    if (vData[i] > AMPLITUDE_THRESHOLD) {
      // Weight frequencies differently based on their likelihood of indicating sand
      if (i >= 10 && i <= 30) {  // Example range for sand impacts
        sandLevel += vData[i] * 1.5;
      } else {
        sandLevel += vData[i];
      }
    }
  }
  
  // Add debug output
  Serial.print("Sand Level: ");
  Serial.println(sandLevel);
  
  return sandLevel;
}

// Function to update LCD display
void updateLCD(float sandLevel) {
    if (abs(sandLevel - currentSandLevel) > 0.5) { // Only update if sandLevel changes significantly
        lcd.clear();
        lcd.print("Acoustic Level:");
        lcd.setCursor(0, 1);
        lcd.print(sandLevel, 2); // Display with 2 decimal places
        currentSandLevel = sandLevel;
    }
}

// Function to sample and process sound data
void sampleSound() {
  
  // Sampling
  for (int i = 0; i < SAMPLES; i++) {
    microseconds = micros();
    int avgReading = 0;
    for (int i = 0; i < 5; i++) {
        avgReading += analogRead(SOUND_SENSOR_PIN);
        delay(5);
    }
    avgReading /= 5;
    vReal[i] = avgReading; // Use averaged value  
    vImag[i] = 0;
    while (micros() < microseconds + 100) { /* wait */ }
  }

  // Perform FFT
  FFT.Windowing(vReal, SAMPLES, FFT_WIN_TYP_HAMMING, FFT_FORWARD);
  FFT.Compute(vReal, vImag, SAMPLES, FFT_FORWARD);
  FFT.ComplexToMagnitude(vReal, vImag, SAMPLES);

  // Analyze frequency components
  float sandSignature = analyzeSandSignature(vReal);
  updateLCD(sandSignature);
}

void setup() {
  Serial.begin(115200);
  Serial.println("Starting Pipeline Monitor...");
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.print("Initializing...");
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
 
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to WiFi");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    
    // Display IP on LCD
    lcd.clear();
    lcd.print("IP Address:");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
    lcd.clear();
    lcd.print("WiFi Failed!");
  }

  // Start the server
  server.begin();
  Serial.println("Server started");
  
  delay(2000);
  lcd.clear();
  lcd.print("System Ready");
}


void loop() {
  // Check for client connections
  Serial.println("Sampling sound...");
  WiFiClient client = server.available();
  
  if (client) {
    Serial.println("New client connected");
    String currentLine = "";
    unsigned long timeout = millis();

    while (client.connected() && (millis() - timeout < 3000)) {
      if (client.available()) {
        char c = client.read();
        
        if (c == '\n') {
          if (currentLine.length() == 0) {
            // Send HTTP response
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:application/json");
            client.println("Access-Control-Allow-Origin: *");
            client.println("Connection: keep-alive");
            client.println();
            
            // Create and send JSON response
            String json = "{\"sandLevel\":" + String(currentSandLevel, 2) + 
                         ",\"samplingRate\":" + String(1000.0/SAMPLE_INTERVAL, 1) + 
                         ",\"timestamp\":\"" + String(millis()) + 
                         "\",\"sampleInterval\":" + String(SAMPLE_INTERVAL) + "}";
            
            client.println(json);
            Serial.println("Sent: " + json);
            
            delay(100);
            break;
          } else {
            currentLine = "";
          }
        } else if (c != '\r') {
          currentLine += c;
        }

        timeout = millis();
      }
    }
    
    client.stop();
    Serial.println("Client disconnected");
  }

  // Perform regular sampling
  if (millis() - lastSampleTime >= SAMPLE_INTERVAL) {
    sampleSound();
    lastSampleTime = millis();
  }
}