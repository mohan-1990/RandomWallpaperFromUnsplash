const https = require('https');
const fs = require('fs');
const wallpaper = require('wallpaper');
const wallpaperChangeFrequency = 7;
var wallpaperUrl = 'https://source.unsplash.com/collection/1227/1600x900';

function downloadNewRandomImage(url) {
    https.get(url, function(response) {
        if(response.statusCode == '302') {
            downloadNewRandomImage(response.headers['location']);
        }
        else {
        	var file = fs.createWriteStream('wall.jpg');
            response.pipe(file);
            response.on('end', function() {
                console.log('Wallpaper downloaded.');
                wallpaper.set('wall.jpg').then(function() {
                    console.log('Wallpaper changed.');
                });
            })
        }
    });
}

function getDateDiffInDays(date1, date2) {
	var diffInTime = Math.abs(date2.getTime() - date1.getTime());	
	var diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));	
	return diffInDays;
}

function main() {
	var stats = fs.statSync('wall.jpg');
	var fileLastModifiedDate = new Date(stats.mtime);
	console.log('Wallpaper last modified on ' + fileLastModifiedDate);	
	var elapsedDays = getDateDiffInDays(fileLastModifiedDate, new Date());	

	if(elapsedDays >= wallpaperChangeFrequency) {
		console.log("Downloading new random wallpaper from Unsplash.com");
		downloadNewRandomImage(wallpaperUrl)
	}
	else {
		console.log("Not going to change the wallpaper");
	}
}

main();