// Initialize app
var myApp = new Framework7()


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var watchID = -1;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

function takePicture()
{
    document.getElementById('CameraButton').removeClass.addClass('gap-button center round large red flash animated');
    
}                    

function onBatteryStatus(status) {
    if (status.isPlugged)
    {
        document.getElementById('batterylevel').innerHTML = '(en charge) ' + Math.round(status.level);
    }
    else
    {
        document.getElementById('batterylevel').innerHTML = Math.round(status.level);
    }
}    

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Prêt !");
    
    window.addEventListener("batterystatus", onBatteryStatus, false);
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way)

myApp.onPageInit('about', function (page) {
    
console.log('Cordova : ' + device.cordova);
console.log('Model : ' + device.model);
console.log('Platform : ' + device.platform);
console.log('Uuid : ' + device.uuid);
console.log('Version : ' + device.version);
console.log('Manufacturer : ' + device.manufacturer);
console.log('IsVirtual : ' + device.isVirtual);
console.log('Serial : ' + device.serial);

})


/*
 myApp.onPageInit('qrcode', function (page) {
    cordova.plugins.barcodeScanner.scan(
      function (result) {
          alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
      }, 
      function (error) {
          alert("Echec : " + error);
      },
      {
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : true, // iOS and Android
          "prompt" : "Scannez le QR Code..." // supported on Android only
      }
   );
}) 
*/

myApp.onPageInit('gps', function (page) {
    // onSuccess Callback
    // This method accepts a Position object, which contains the
    // current GPS coordinates
    //
    var onSuccess = function(position) {
        alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
})


myApp.onPageBack('compass', function (page) {

    // ... later on ...
    if (watchID != -1) {
        navigator.compass.clearWatch(watchID);
        watchID = -1;
    }
})

myApp.onPageInit('camera', function (page) {
    navigator.camera.getPicture (
        function (imageData) {
                var image = document.getElementById('myImage') ;
                image.src = "données : image / jpeg ; base64," + imageData;
        }, 
        function (message) 
        {
                alert (' a échoué car: '+ message);
        },
        {
            quality: 75,
            PictureSourceType:Camera.PictureSourceType.CAMERA,
            destinationType: Camera.DestinationType.FILE_URI
        }
    );
})

myApp.onPageInit('compass', function (page) {
    
    var angle;
    
    drawCompass('boussole');
    
    function onInit(heading) {
        // drawFov(0,2,false);
        drawNeedle(0);
        gHeading = heading.magneticHeading;
        rotateNeedle(gHeading);

        var options = {
            frequency: 500
        }; // Update every 3 seconds

        watchID = navigator.compass.watchHeading(onSuccess, onError, options);
    };

    function onSuccess(heading) {
        
        angle = heading.magneticHeading - gHeading;
        gHeading = heading.magneticHeading;
        rotateNeedle(angle);
    };

    function onError(error) {
        alert('CompassError: ' + error.code);
    };

    navigator.compass.getCurrentHeading(onInit, onError);

})



