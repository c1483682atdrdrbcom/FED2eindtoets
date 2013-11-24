// 1
var APP = APP || {};

//Anonieme/naamloze functie begint hier
// 2
(function () {

// Instellingen
// 3
var loader = document.getElementById('loader');
var mySwiper = new Swiper ('.swiper-container',{
	loop: false
});
	
	// Controller Init
	// 5
	APP.controller = {
		init: function () {
			// Initialize de router
			// Voer de router uit
			APP.router.init();
			APP.button.init();
		}
	};
	
	//6
	APP.button = {	
		init: function () {
			//Nieuwe variabel die id submit pakt
			var button = document.getElementById('submit');	
			//Functie bij klik
			button.addEventListener('click', function(){
			//Zet lader op display block
			loader.style.display = 'block';
			
				//Pakt waarden van input velden
				var value1 = document.getElementById('team1score').value;
				var value2 = document.getElementById('team2score').value;
				
				//Logged de waarde van input velden
				console.log(value1);
				console.log(value2);
				
				//GET game_id
					//Maak een string van de URL, zodat deze te bewerken/ontleden is.
					var url = window.location.toString();
					//Deel de URL in stukken bij de /
					var array = url.split("/");
					//Pak het achterste gedeelte van de array
					var game_id = array[array.length - 1];
					
					//Tussendoor console log van de game_ID
					console.log(game_id);
					
					//Voert methode post uit
					APP.data.post({
						game_id: game_id,
						team_1_score: value1,
						team_2_score: value2,
						is_final: 'True'
					});
			});
		}
	}
	
	// 8
	APP.data = {
		post: function(postData) {
            var url = 'https://api.leaguevine.com/v1/game_scores/';
			
			//Maakt string van post data, leaguevine accepteert namelijk niets anders.
            var postData = JSON.stringify(postData);
			console.log(postData);
			
            // Create een request
			// Request naar bepaalde url
            var xhr = new XMLHttpRequest();
            xhr.open('POST',url,true);
			
			//Check voor response
			//Houdt verbinding van request in de gaten, op moment dat verbinding is verandert, bij 4 = response terug, als die response 201 is voer uit
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4 && xhr.status == 201) {
						//Verberg de loader
						loader.style.display = 'none';
						//Voer router change uit
						APP.router.change('schedule');
						
					} else if (xhr.readyState == 4) {
						alert('Er is iets fout gegaan tijdens het posten');
				}
			};
			//Zet request headers
			//Meegeven dat de meegestuurde data JSON is.
            xhr.setRequestHeader('Content-type','application/json');
			//Authoricatie van de post, met "3583789567"
            xhr.setRequestHeader('Authorization','bearer 3583789567');
                        
            // Stuur request (POST)
            xhr.send(postData);
		},
	};

	// Router
	// 6
	APP.router = {
		init: function () {
	  		routie({
			    '/game/:game_id': function(game_id) { // met : geef je een parameter mee aan routie die later gebruikt kan worden in page game
			    	APP.page.game(game_id);
				},
			    '/ranking': function() {
			    	APP.page.ranking();
					mySwiper.swipeTo(0,1000);
			    },

			    '/schedule': function() {
			    	APP.page.schedule();
					mySwiper.swipeTo(1,1000);
			    }
			});
		},

		// 7
		change: function (section_name) {
            var sections = qwery('section'),
                section = qwery('[data-route=' + section_name + ']')[0];

            // Laat actieve sectie zien, verberg de rest
            if (section) {
            	for (var i=0; i < sections.length; i++){
            		sections[i].classList.remove('active');
            	}
            	section.classList.add('active');
            }
		}
	};

	// Pages
	// 7
	APP.page = {	
		game: function (game_id) {
			loader.style.display = 'block';
		promise.get('https://api.leaguevine.com/v1/games/'+game_id+'/?access_token=3583789567').then(function(error, data, xhr) {
				if (error) {
					alert('Error ' + xhr.status);
					return;
				}
				data = JSON.parse(data);
				console.log(data);
			
				Transparency.render(qwery('[data-route=game]')[0], data);
				APP.router.change('game');
				loader.style.display = 'none';
			});
		},

		schedule: function () {
		loader.style.display = 'block';
			promise.get('https://api.leaguevine.com/v1/games/?tournament_id=19389&pool_id=19219&fields=%5Bid%2C%20pool%2C%20start_time%2C%20team_1%2C%20team_1_score%2C%20team_2%2C%20team_2_score%5D&access_token=8ade08dd13').then(function(error, data, xhr) {
				if (error) {
					alert('Error ' + xhr.status);
					return;
				}
				//Parse maakt er een JSON Object van, nodig voor Leaugevine
				data = JSON.parse(data);
				console.log(data);
			
				var directives = APP.directives.schedule;
				
				//Rendert de data en de directives
				Transparency.render(qwery('[data-route=schedule]')[0], data, directives);
				APP.router.change('schedule');
				loader.style.display = 'none';
			});
		},

		ranking: function () {
		loader.style.display = 'block';
			promise.get('https://api.leaguevine.com/v1/pools/19219/').then(function(error, data, xhr) {
				if (error) {
					alert('Error ' + xhr.status);
					return;
				}
				data = JSON.parse(data);
				console.log(data);
			
				Transparency.render(qwery('[data-route=ranking]')[0], data);
				APP.router.change('ranking');
				loader.style.display = 'none';
			});
		}
	}
	
	//Directives geven op moment van update score data bind tegen komt href mee waarin game id meegeeft
	//Zorgt voor de dynamische URL vanaf de schedule pagina, werkt met transparacy.
	APP.directives = {
		schedule: {
			objects: {
			// Wanneer je op score drukt, return dan de url met deze info
				update_score: {
					href: function() {
						return '#/game/' + this.id;
					}
				},

				time: {
					// Dit zet de tijd om naar een normaal formaat
            		text: function(params){
                        var timeObj = new Date(this.start_time);
                        var hours = timeObj.getHours();
                        var minutes = (timeObj.getMinutes() <10?'0':'') + timeObj.getMinutes();
                        var offset = Math.abs(timeObj.getTimezoneOffset() / 60);
                        var correct_hours = hours + offset;
						var startTime = correct_hours + ":" + minutes;
						return startTime;
                        }
                    }
                }
             }
		}
	
	// DOM ready? Start dan de controller
	// 4
	domready(function () {
		// Dit start de applicatie wanneer alle content geladen is
		APP.controller.init();
	});
})();