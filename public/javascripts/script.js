// ////////////////////////////////
// MOBILE MENU CODE
	
	var dropdownOpen = false;
	$('.menu-div').click(function() {
		if (dropdownOpen) {
			$('.custom-dropdown-menu').hide();
			dropdownOpen = false;
		} else {
			$('.custom-dropdown-menu').show();
			dropdownOpen = true;
		}
	});
	

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
	var $splash = $('.splash-text');
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
			$splash.text(baseString.slice(0, baseCounter));
			baseCounter++;
		} else {
			// progressively append/remove subject string.
			if (newSubjectNeeded) {
				currentSubject = randomNewSubject();
				newSubjectNeeded = false;
			}
			
			if (subjectRemovalNeeded) {
				// remove subject
				if ($splash.text() !== 'Let\'s vote on ') {
					// if subject string is not fully removed, remove one more letter
					$splash.text(baseString + currentSubject.slice(0, subjectCounter));
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
					$splash.text(baseString + currentSubject.slice(0, subjectCounter));
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

	// Profile Option Buttons

	var $creationForm = $('#creationForm');
	var $myPolls = $('#myPollList');

	$('#profileCreatePoll').click(function() {
		$creationForm.show();
		$myPolls.hide();
	});

	$('#profileMyPolls').click(function() {
		$creationForm.hide();
		$myPolls.show();
	});
	
	
	// this code handles showing/hiding
	// the password change modal
	var $passBg = $('#passBg');
	var $passModal = $('#passModal');
	var $body = $('body');

	$('#passChange').click(function() {
		$('#passMessage').hide();
		$passBg.addClass('bg-active');
		$passModal.addClass('modal-active');
		$body.addClass('open-modal-body');
	});

	$('#closeModal').click(function() {
		$passBg.removeClass('bg-active');
		$passModal.removeClass('modal-active');
		$body.removeClass('open-modal-body');
	});


	// Password Modal Form Submission Code

	$('#passChangeForm').submit(function(e) {
		e.preventDefault();		
		$.post($('#passChangeForm').attr('action'), $('#passChangeForm').serialize(), function(data) {
			$('#passMessage').text(data).show();
			$passBg.removeClass('bg-active');
			$passModal.removeClass('modal-active');
			$body.removeClass('open-modal-body');
		});		
	});


	// Poll Delete Code

	var $delBg = $('#delBg');
	var $delModal = $('#delModal');
	var siblingLink; // storage var for href of poll to be deleted
	var pollId; // storage var for pollId extracted from above href
	
	// user clicks on delete button, get pollId of relevant poll, show confirmation modal
	$('#myPollList').on('click', 'button', function(e) {		
		siblingLink = e.target.previousSibling.href; // sibling 'a' element contains pollId within href
		pollId = siblingLink.slice(siblingLink.lastIndexOf('/') + 1); // extract pollId from href string
		$('#passMessage').hide(); // hide passMessage
		// show the poll deletion modal
		$delBg.addClass('bg-active');
		$delModal.addClass('modal-active');
		$body.addClass('open-modal-body');		
	});
	
	// user cancels poll deletion via confirmation modal cancel button
	$('#delPollCancel').click(function() {
		$delBg.removeClass('bg-active');
		$delModal.removeClass('modal-active');
		$body.removeClass('open-modal-body');
	});

	// user confirms poll deletion via confirmation modal confirm button
	$('#delPollConfirm').click(function() {
		// remove nested document that matches pollId via post
		$.post('/delete/' + pollId, function(data) {
			$('#passMessage').text(data).show();
			// if poll was successfully deleted, remove from My Polls list
			if (data === 'Poll deleted!') {
				$('a[href="poll/'+ pollId + '"]').next().remove(); // remove deletion button
				$('a[href="poll/' + pollId + '"]').replaceWith('<h2 class="deleted-poll">Poll deleted.</h2>');
			}
			$delBg.removeClass('bg-active');
			$delModal.removeClass('modal-active');
			$body.removeClass('open-modal-body');
		});
	});


	// Poll Creation Code

	var inputCounter = 3;

	$('#addOption').click(function() {	
		$('#optionGroup').append('<input class="custom-input form-control" placeholder="Add another option" id="pollOption' + inputCounter + '" type="text" name="pollOption' + inputCounter + '"></input>');
		inputCounter++;
	});


// ////////////////////////////////
// POLL.PUG CODE


	// Chart.js Code
	
	var optionNames = singleUser.polls[0].pollOptions.map(function(pollOption) {
		return pollOption.optionName;
	});

	var votes = singleUser.polls[0].pollOptions.map(function(pollOption) {
		return pollOption.votes;
	});

	var backgroundColours = optionNames.map(function() {
		return randomColour();
	});

	var ctx = $('#pollChart');
	var doughnutPoll = new Chart(ctx, {
		type: 'doughnut',
	  data: {
	  	labels: optionNames,
	  	datasets: [
	  		{
					data: votes,
					backgroundColor: backgroundColours
	  		}			
	  	]
	  } 
	});


	function randomColour() {
		// generate a random hex colour
		var hexChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
		var colour = '#';
		for (var i = 0; i < 6; i++) {
	    colour += hexChars[Math.floor(Math.random() * 16)];
	  }
	  return colour;
	}
	// end Chart.js code

	
	// Form Submission Code
	
	$('#voteForm').submit(function(e) {
		// check if user has voted already to ensure one poll-vote per user
		
		// extract the pollId from the form's action attribute
		var actionString = $('#voteForm').attr('action');	// action attribute contains pollId, amongst other info	
		var pollIdStart = actionString.lastIndexOf('/') + 1; // find the index at which the pollId starts
		var pollIdEnd = actionString.indexOf('?'); // find the index at which the pollId ends
		var pollId = actionString.slice(pollIdStart, pollIdEnd); // extract the pollId
		
		if(localStorage[pollId]) {
			e.preventDefault();
			$('#voteLimitMsg').show();
		} else {
			localStorage.setItem(pollId, 'voted');
		}
	});