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
var subjectTexts = ['sports.','ice-cream.','videogames.','action movies.','jazz bands.','colours.','fashion.', 
		'literature.','paintings.','photography.','animals.','architecture.','telephones.','cartoons.','bicycles.',
		'composers.','cars.','board-games.','planets.','sitcoms.','seafood.','kitchenware.','fireworks.','history.',
		'gymnastics.','record players.','fruits.','house-plants.','genres.','waterfalls.','deep-sea diving.',
		'parkour.','weightlifting.','handwriting.','camping.','chocolate.','horror films.','hairstyles.',
		'pizza toppings.','guitars.'];
var newSubjectNeeded = true; // flag for selecting new subject string
var subjectRemovalNeeded = false; // flag for progressively removing subject string
var currentSubjectText = ''; // var to hold the subject text currently being appended/removed

function randomSubject () {
	// this function randomly picks an element from the subjectTexts array
	return subjectTexts[Math.floor(Math.random()*subjectTexts.length)];
}

var stringInterval = setInterval(function() {	
	if (baseCounter <= baseString.length) {
		// progressively generate base string.
		$('.splash-text').text(baseString.slice(0, baseCounter) + '|');
		baseCounter++;
	} else {
		// progressively append/remove subject string.
		if (newSubjectNeeded) {
			currentSubjectText = randomSubject();
			newSubjectNeeded = false;
		}
		
		if (subjectRemovalNeeded) {
			// remove subject
			if (false) {

			}
		}	else {
			// append subject
			if (subjectCounter <= currentSubjectText.length) {				
				$('.splash-text').text(baseString + currentSubjectText.slice(0, subjectCounter) + '|');
				subjectCounter++;
			}
		}	
		
	}	
}, 100);