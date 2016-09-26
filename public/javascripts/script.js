// ////////////////////////////////
// INDEX.PUG CODE

// this code progressively prints out the text of baseString as
// though it were being typed out by a person on a terminal.
// when the baseString is fully printed to screen, the code progressively
// appends a subject-text (e.g. 'sports') to the baseString. it then waits for
// a moment before progressively removing the subject string from text, before
// progressively replacing it with a new subject string. this cycle continues indefinitely. 

// declare variables for use within function
var baseString = 'Let\'s vote on ';
var baseCounter = 1; // counter for progressively increasing slice length on baseString
var subjectCounter = 1; // counter for progressively increasing slice length on subjectText
var subjects = ['sports.','ice-cream.','videogames.','action films.','jazz bands.','colours.','fashion.', 
		'literature.','paintings.','photography.','animals.','architecture.','telephones.','cartoons.','bicycles.',
		'composers.','cars.','board-games.','planets.','sitcoms.','seafood.','kitchenware.','fireworks.','history.',
		'gymnastics.','turntables.','fruits.','house-plants.','genres.','waterfalls.','fancy hats.',
		'parkour.','weightlifting.','handwriting.','camping.','chocolate.','ghost stories.','hairstyles.',
		'guitars.'];
var newSubjectNeeded = true; // flag for selecting new subject string
var subjectRemovalNeeded = false; // flag for progressively removing subject string
var currentSubject = ''; // var to hold the subject text currently being appended/removed
var recentSubjects = ['','','','','']; // this array tracks the 5 most recently rendered subjects
var completedCounter = 0; // var to count time completed subject is on-screen for.

var stringInterval = setInterval(function() {	
	
	if (baseCounter <= baseString.length) {
		// progressively generate base string.
		$('.splash-text').text(baseString.slice(0, baseCounter));
		baseCounter++;
	} else {
		// progressively append/remove subject string.
		if (newSubjectNeeded) {
			currentSubject = randomNewSubject();
			newSubjectNeeded = false;
		}
		
		if (subjectRemovalNeeded) {
			// remove subject
			if ($('.splash-text').text() !== 'Let\'s vote on ') {
				// if subject string is not fully removed, remove one more letter
				$('.splash-text').text(baseString + currentSubject.slice(0, subjectCounter));
				subjectCounter--;
			} else {
				// reset counters and flags in preparation for new subject append
				newSubjectNeeded = true;
				subjectRemovalNeeded = false;
				subjectCounter = 0;
			}
		}	else {
			// append subject
			if (subjectCounter <= currentSubject.length) {		
				// if the subject is not fully appended, append one more letter		
				$('.splash-text').text(baseString + currentSubject.slice(0, subjectCounter));
				subjectCounter++;
			} else {
				// this section provides a 'delay', allowing the completed subject
				// string to remain on-screen for a few moments.
				// once this period is complete, variables are set to prep for removal
				// of the subject string.										
				completedCounter++;
				if (completedCounter === 3) {						
					subjectRemovalNeeded = true;
					completedCounter = 0;
					subjectCounter = -1;
				}				
			}
		}			
	}	
}, 100);

function randomNewSubject() {
	// this function returns a random element from the subjects array,
	// and makes sure that it has not appeared in the previous 5 subject renders
	// before returning it

	var generatedSubject = randomSubject();
	if (recentSubjects.indexOf(generatedSubject) > -1) {
		return randomNewSubject();
	} else {
		recentSubjects.pop();
		recentSubjects.unshift(generatedSubject);
		return generatedSubject;
	}

	function randomSubject () {
		// this function randomly picks an element from the subjects array
		return subjects[Math.floor(Math.random()*subjects.length)];
	}
}


// ////////////////////////////////
// PROFILE.PUG CODE

var inputCounter = 3;

$('#addOption').click(function() {	
	$('#optionGroup').append('<input class="form-control" id="pollOption' + inputCounter + '" type="text" name="pollOption' + inputCounter + '"></input>');
	inputCounter++;
});