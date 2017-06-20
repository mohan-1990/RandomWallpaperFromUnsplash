const https = require('https');
const fs = require('fs');
const wallpaperChanger = require('wallpaper');

function Wallpaper() {

}

Wallpaper.prototype.shouldDownload = function(fileName, wallpaperChangeFrequency) {
	var stats = fs.statSync(fileName);
	var fileLastModifiedDate = new Date(stats.mtime);
	console.log('Wallpaper last modified on ' + fileLastModifiedDate);	
	var elapsedDays = getDateDiffInDays(fileLastModifiedDate, new Date());	

	if(elapsedDays >= wallpaperChangeFrequency) {
		console.log("Should download new wallpaper");
		return true;
	}
	else {
		console.log("No need to download new wallpaper");
		return false;
	}
	
	function getDateDiffInDays(date1, date2) {
		var diffInTime = Math.abs(date2.getTime() - date1.getTime());	
		var diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));	
		return diffInDays;
	}
};

Wallpaper.prototype.download = function(url) {
	var download1 = function(url) {
		return new Promise(function(resolve, reject) {
			https.get(url, function(response) {
				resolve(response);
			});
		});
	};

	return new Promise(function(resolve, reject) {
		var downloadPromise = download1(url).then(function(response) {
			if(response.statusCode == '302') {
				return download1(response.headers['location']);
			}			
		}).then(function(response) {
			var file = fs.createWriteStream('wall.jpg');
            response.pipe(file);
            response.on('end', function() {
                resolve('Wallpaper downloaded.');
            });
		});
	});
};


function main() {
	var fileName = 'wall.jpg';
	var changeFrequency = 7;
	var downloadUrl = 'https://source.unsplash.com/collection/1227/1600x900';
	var wallpaper = new Wallpaper();
	if(wallpaper.shouldDownload(fileName, changeFrequency)) {
		wallpaper.download(downloadUrl).then(function(msg) {
			console.log(msg);
			return wallpaperChanger.set(fileName);
		}).then(function() {
			console.log('Wallpaper changed.');
		});
	}		
}

main();
