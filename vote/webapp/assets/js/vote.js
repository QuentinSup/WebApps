/* Examples */
(function($) {

	var json = {
		id: '124578',
		chamber: {
			id: '123',
			name: 'FrenchTech - Digital Grenoble'
		},
		questions: [{
			id: '12301',
			timeout: 10,
			extratime: 5, 
			label: "Validation des comptes de l'exercice actuel ?",
			answers: [
				{
					id: '1230101',
					label: 'Oui',
					value: 'Y'
				},
				{
					id: '1230102',
					label: 'Non',
					value: 'N'
				},
				{
					id: '1230103',
					label: 'Blanc',
					value: 'B'
				}
			]
			},
			{
				id: '12302',
				timeout: 20,
				label: "Validation des comptes de l'exercice suivant ?",
				answers: [
					{
						id: '1230101',
						label: 'Oui',
						value: 'Y'
					},
					{
						id: '1230102',
						label: 'Non',
						value: 'N'
					}
				]
				}
	    ]
	};
	
	var questionId = ko.observable();
	var questionLabel = ko.observable();
	var isExtraTime = ko.observable(false);
	var canVote = ko.observable(false);
	var questionValue = ko.observable();
	var questionAnswers = ko.observableArray();
	
	var model = {
		questionId: questionId,
		questionLabel: questionLabel,
		questionValue: questionValue,
		questionAnswers: questionAnswers,
		isExtraTime: isExtraTime,
		canVote: canVote
	};
	
	var currentQuestionIndex = null;
	
	var launchExtraTime = function(extratime) {
		model.isExtraTime(true);
		model.canVote(false);
		launchTimer(extratime, 1000);
	};
	
	var launch = function(question, delay) {
	
		model.questionValue('');
		model.canVote(false);
		model.isExtraTime(false);
		model.questionLabel(question.label);
		model.questionAnswers(question.answers);
		
		var timer = question.timeout;
	
		launchTimer(timer, delay);

	};
	
	var launchTimer = function(timer, delay) {
		
		var animationDelay = timer * 1000;
		
		var $circle = $('.circle');

		var counter = $circle.circleProgress({
			size: $circle.innerWidth(),
			value : 1,
			animationStartValue: 0,
			startAngle: Math.PI * 2.5,
			lineCap: 'round',
			thickness : 5,
			reverse: false,
			animation :  {
				duration : delay,
				easing : "circleProgressEasing"
			},
			fill : 'orange'
		});
		
		counter.find('strong').html(timer);

		setTimeout(function() {
			
			model.canVote(true);
			
			var counter = $circle.circleProgress({
				size: $circle.innerWidth(),
				value : 1,
				startAngle: Math.PI * 2.5,
				lineCap: 'round',
				animationStartValue: 0,
				thickness : 5,
				reverse: true,
				animation : {
					duration : animationDelay,
					easing : "linear"
				},
				fill : '#0681c4'
			});
			
			decrement(counter, timer);
			
		}, delay);
	}
	
	var decrement = function(counter, timer) {
		counter.find('strong').html(timer);
		if (timer > 0) {
			setTimeout(function() {
				decrement(counter, timer - 1)
			}, 1000);
		} else {
			nextQuestion();
		}
	};
	
	var transition = function(fnDone) {
		setTimeout(function() {
			$('#vote-area').fadeOut('slow', function() {
				fnDone.call();
				$(this).fadeIn();
			});
		}, 2000);
	};
	
	var currentQuestion = function() {
		if(currentQuestionIndex == null) {
			return null;
		}
		return json.questions[currentQuestionIndex];
	};
	
	var nextQuestion = function() {
		var current = currentQuestion();
		if(currentQuestionIndex == null) {
			currentQuestionIndex = 0;
		} else {
			if(!model.questionValue() && current != null) {
				if(!model.isExtraTime() && current.extratime > 0) {
					launchExtraTime(current.extratime);
					return;
				} 
			}
			currentQuestionIndex++;
		}
		var question = json.questions[currentQuestionIndex];
		if(question) {
			if(currentQuestionIndex == 0) {
				launch(question, 3000);
			} else {
				transition(function() {
					launch(question, 2000);
				});
			}
		}
	};
	
	nextQuestion();

	ko.applyBindings(model);
	
})(jQuery);