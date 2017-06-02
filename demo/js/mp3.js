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

$("#progressBar").parent().on("click", function(e) {
	var length = $("#player").prop("duration");
	var total = $(this).css("width").replace("px", "")
	var xPos = e.pageX - $(this).offset().left;
	var percent = parseFloat(xPos/total).toFixed(2);
	var currentTime = parseFloat(percent * length).toFixed(2);
	percent = (percent * 100);
	
	$("#player").attr("currentTime", currentTime);
	$("#progressBar").css('width', percent + '%');
})
	
function initProgressBar() {
	var length = $("#player").prop("duration");
	var currentTime = $("#player").prop("currentTime");
	
	// calculate total length of value
	var totalLength = calculateTotalValue(length)
	$("#end-time").html(totalLength);
	
	// calculate current value time
	var startTime = calculateCurrentValue(currentTime);
	$("#start-time").html(startTime);
	
	var progress = parseFloat((currentTime/length) * 100).toFixed(2);
	$("#progressBar").css('width', progress + '%');
	
	if (currentTime == length && $("#player").data("current") == $(".song").length) {
		$("#pause").hide();
		$("#stop").show();
	}
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
	/** get the data info about the audio loaded **/
	var source = audio.source;
	var title = audio.title;
	var track = audio.track;
	/** calculate the total tracks in the current playlist **/
	var totalTracks = $(".song").length;
	/** set the data info to the audio tag **/
	$("#player").attr('src', source);
	$("#player").attr('data-current', audio.track);
	$("#player").attr('autoplay', "true");
	$("#trackId").html(audio.track + "/" + totalTracks);
	/** remove the marquee for the div before selected (if exists) **/
	$(".song > marquee").each(function(){
		var dataTitle = $(this).parent().data("title");
		$(".song > marquee").parent().parent().removeClass("label label-primary");
		$(".song > marquee").parent().html(dataTitle);
	});
	/** set the marquee for the current audio playing **/
	var current = $("#playList>div")[(track-1)];
	$(current).addClass("label label-primary");
	$(current).children().html('<marquee scrolldelay="200" style="vertical-align: middle;">' + title + '<marquee>')
	/** verify if the stop button is visible, then hide it **/
	if ($("#stop").css("display") != "none") {
		$("#stop").hide();
	}
	/** hide the play button and show the pause button **/
	$("#play").hide();
	$("#pause").show();
}

$("#fileList").on("change", function() {
	var playList = [];
	track = 1;
	var list = $(this)[0].files;
	$("#playList").empty();
	$.each(list, function(value) {
		var audio = new Object();
		var title = this.name.replace(".mp3", "");
		var source = URL.createObjectURL(this);
		
		audio.source = source;
		audio.title = title;
		audio.track = track;
		playList.push(audio);
		
		$("#playList").append('<div><label class="song m-l-15" data-track="' + track + '" data-title="' + title + '" data-song="' + source + '" style="width: 91%;">' + title + '</label></div>');
		track++;
	});
	
	var playTrack = Math.floor((Math.random() * ($(".song").length)) + 1);
	play (playList[playTrack-1]);
	loadFromFile($(this)[0].files[playTrack-1]);
	/** on double click event to playList **/
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