var playList = [];
var source = "";
var track = 1;
var title = "";

function calculateTotalValue(length) {
	var minutes = Math.floor(length / 60),
    seconds_int = length - minutes * 60,
    seconds_str = seconds_int.toString(),
    seconds = (seconds > 10 ? seconds_str.substr(0, 2) : seconds_str.substr(0, 1)),
    time = (minutes < 10 ? "0" + minutes : minutes) + ':' + (seconds < 10 ? "0" + seconds : seconds)
	return time;
}

function calculateCurrentValue(currentTime) {
	var current_hour = parseInt(currentTime / 3600) % 24,
    current_minute = parseInt(currentTime / 60) % 60,
    current_seconds_long = currentTime % 60,
    current_seconds = current_seconds_long.toFixed(),
    current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);
	return current_time;
}

function initProgressBar() {
	var length = $("#player").prop("duration");
	var currentTime = $("#player").prop("currentTime");
	
	// calculate total length of value
	var totalLength = calculateTotalValue(length)
	$("#end-time").html(totalLength);
	
	// calculate current value time
	var startTime = calculateCurrentValue(currentTime);
	$("#start-time").html(startTime);
	
	var progress = (currentTime/length) * 100;
	
	console.log("progress: " + progress + '%')
	
	$("#progressBar").css('width', progress + '%');
	
	/*
	$("#progressBar").on("click", function(event){
		var percent = event.offsetX / this.offsetWidth;
		$("#player").attr("currentTime", (percent * $("#player").prop("duration")));
		$("#progressBar").val(percent / 100);
	});

  if (player.currentTime == player.duration) {
    document.getElementById('play-btn').className = "";
  }*/
};

function displayInfo(mp3Info) {
	if (mp3Info.album != "Unknown") {
		mp3Title = mp3Info.artist + " - " + mp3Info.album + " - " + mp3Info.year
	} else {
		mp3Title = mp3Info.artist
	}
	
	$("#art").attr("title", mp3Title);
	
	$.each(mp3Info, function(index, value){
		if (index != "dataImage") {
			$("#" + index).html(value);
		} else {
			$("#art").attr("src", value);
		}
	});
}

function validateTags(url) {
	/* Get all tags from the file */
	var tags = ID3.getAllTags(url);
	
	var artist = tags.artist || "";
	var title = tags.title || "";
	var album = tags.album || "";
	var year = tags.year || "";
	var comment = (tags.comment||{}).text || "";
	var genre = tags.genre || "";
	var track = tags.track || "";
	var lyrics = (tags.lyrics||{}).lyrics || "";
	var dataImage = "img/mp3.png"
	
	/* Validate the data */
	if (title == "") {
		title = url.replace(".mp3", "");
	}
	if (artist == "") {
		artist = "Unknown"
	}
	if (album == "") {
		album = "Unknown"
	}
	if (year == "") {
		year = "Unknown"
	}
	if (comment == "") {
		comment = "Unknown"
	}
	if (genre == "") {
		genre = "Unknown"
	}
	if (track == "") {
		track = "Unknown"
	}
	if (lyrics == "") {
		lyrics = "None"
	}
	if ( "picture" in tags ) {
		var image = tags.picture;
		var base64String = "";
		for (var i = 0; i < image.data.length; i++) {
			base64String += String.fromCharCode(image.data[i]);
		}
		dataImage = "data:" + image.format + ";base64," + window.btoa(base64String)
	}
	
	/* Make a JSON Object to display the Info*/
	var mp3Info = new Object();
	mp3Info.artist = artist;
	mp3Info.title = title;
	mp3Info.album = album;
	mp3Info.year = year;
	mp3Info.comment = comment;
	mp3Info.genre = genre;
	mp3Info.track = track;
	mp3Info.lyrics = lyrics;
	mp3Info.dataImage = dataImage;
	
	displayInfo(mp3Info);
}

function loadUrl(url, callback, reader) {
	var startDate = new Date().getTime();
	ID3.loadTags(url, function() {
		var endDate = new Date().getTime();
		if (typeof console !== "undefined") console.log("Time: " + ((endDate-startDate)/1000)+"s");
		var tags = ID3.getAllTags(url);
		
		validateTags(url);
		
		if( callback ) {
			callback();
		};
	},
	{
		tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"],
		dataReader: reader
	});
}

function loadFromFile(file) {
	var url = file.urn || file.name;
	loadUrl(url, null, FileAPIReader(file));
}

function play(audio) {
	var source = audio.source;
	var title = audio.title;
	var track = audio.track;
	var totalTracks = $(".song").length;
	$("#player").attr('src', source);
	$("#player").attr('data-current', audio.track);
	$("#player").attr('autoplay', "true");
	$("#trackId").html(audio.track + "/" + totalTracks);
	
	console.log("Playing now: " + title + ".mp3 -> Track: " + track + "\n");
}

$("#fileList").on("change", function() {
	var list = $(this)[0].files;
	$.each(list, function(value) {
		var audio = new Object();
		var title = this.name.replace(".mp3", "");
		var source = URL.createObjectURL(this);
		
		audio.source = source;
		audio.title = title;
		audio.track = track;
		playList.push(audio);
		
		$("#playList").append('<div><i class="fa fa-music"></li>  <label class="song" data-track="' + track + '" data-song="' + source + '" style="user-select: none;">' + title + '</label></div>');
		track++;
	});
	
	var playTrack = Math.floor((Math.random() * ($(".song").length)) + 1);
	play (playList[playTrack-1]);
	loadFromFile($(this)[0].files[playTrack-1]);
	$("#play").hide();
	$("#pause").show();
	
	$(".song").on("dblclick", function(){
		var source = $(this).attr('data-song');
		var title = $(this).html();
		var track  = $(this).attr('data-track');
		
		var audio = new Object();
		audio.source = source;
		audio.title = title;
		audio.track = track;
		
		play(audio);
		loadFromFile($("#fileList")[0].files[(track-1)]);
		return false;
	});
});

$("#next").on("click", function(){
	totalTracks = $(".song").length;
	currentTrack = $("#player").attr('data-current');
	newTrack = +currentTrack+1;
	if (newTrack <= totalTracks){
		source = $("label[data-track=" + newTrack + "]").attr('data-song');
		title = $("label[data-track=" + newTrack + "]").html();
		track = $("label[data-track=" + newTrack + "]").attr('data-track');
		
		var audio = new Object();
		audio.source = source;
		audio.title = title;
		audio.track = track;
		
		play(audio);
		loadFromFile($("#fileList")[0].files[(newTrack-1)]);
		return false;
	}
});

$("#prev").on("click", function(){
	totalTracks = $(".song").length
	currentTrack = $("#player").attr('data-current')
	newTrack = +currentTrack-1;
	if (newTrack > 0){
		source = $("label[data-track=" + newTrack + "]").attr('data-song');
		title = $("label[data-track=" + newTrack + "]").html();
		track = $("label[data-track=" + newTrack + "]").attr('data-track');
		
		var audio = new Object();
		audio.source = source;
		audio.title = title;
		audio.track = track;
		
		play(audio);
		loadFromFile($("#fileList")[0].files[(newTrack-1)]);
		return false;
	}
});

$("#player").bind("ended", function(){
	$("#next").click();
});

$("#play").on("click", function(){
	if ($("#player").attr("data-current")  != "") {
		$("#player").trigger('play')
		$("#play").hide();
		$("#pause").show();
	}
});

$("#pause").on("click", function(){
	$("#player").trigger('pause')
	$("#pause").hide();
	$("#play").show();
});

$("#mute").on("click", function(){
	$("#player").trigger('mute')
	$("#mute").hide();
	$("#audio").show();
});

$("#btnPlayList").on("click", function(){
	if ($("#playList").css("display") == "none") {
		$("#playList").fadeIn("slow");
	} else {
		$("#playList").fadeOut("slow");
	}
});