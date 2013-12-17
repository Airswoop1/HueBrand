var phantom = require('phantom');
var portscanner = require('portscanner');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

var Logopedia = mongoose.Schema({

	logoName : String,
	logopediaWebAddress : String

})

exports.logopediaModel = mongoose.model('logopedia', Logopedia)

exports.logopediaScrape = function(){

		var arrayOfLogos = Array();
		var arrayOfLogopediaSites = [ 'http://logos.wikia.com/wiki/Special:AllPages?from=!ViewSonic&to=AKQA',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=AKT_(Akita_Television)&to=Alchemy',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Alcoa&to=Army_Times',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Arnhem_1980&to=BSG_Motor_Babelsberg',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=BSkyB&to=Bieberpedia',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Biedronka&to=BritishSkyBroadcasting',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=BritishSkyBrodcasting&to=COSI',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=COlumbiatristar&to=Cartoon_Network_(Nordic)',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Cartoon_Network_(Pakistan)&to=Circle_7_Animation',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Circle_K&to=Coop_Nära',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Coop_Prima&to=Dasfa_ir_Ko',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Dash&to=Distraction_(U.K.)',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Distrito_Comedia&to=EastEnders',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=EastLink_TV&to=Evite',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Evite.com&to=Five/2002_Idents',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Five/2008_Idents&to=Full_Channel',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Full_House&to=GoodTimes_Entertainment',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Good_Boy!&to=HTC_Wildfire',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=HTC_Wildfire_S&to=Houston_Texans_Radio_Network',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Houston_Zoo&to=Integrated_Kent_Franchise',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Integrated_electronics&to=KABE-LD',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=KACV-TV&to=KPNZ',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=KPOB&to=Ketnet',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Kettering_Borough_Council&to=Lauda',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Lauf_al_Hamiliyon&to=Lrt.lt',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Lu&to=Manchester_Monarchs',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Manchester_United&to=Metrovalencia',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Mexicali_(Government)&to=Movistar_Hogar_Perú',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Movistar_Móvil_Colombia&to=Natonwide_Series',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Natreen&to=Norsk_Hydro',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Norsk_rikskringkasting&to=Ottawa_MacDonald-Cartier_International_Airport',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Ottawa_Macdonald-Cartier_International_Airport&to=Perfetti_van_Melle',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Performance_Channel&to=Por_Toda_Minha_Vida',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Por_el_Bien_de_Todos_(2006)&to=RTL_Télé_Lëtzebuerg',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=RTM&to=Reelz',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=ReelzChannel&to=SCHIP',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=SCORE&to=Scribblenauts',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Scribblenauts_Remix&to=Sky_Active',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Sky_Arte&to=Sparbanken_Finn',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Sparbanken_Gripen&to=Sumbeam_Television',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Sumitomo_Heavy_Industries&to=TV5_(Philippines)',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=TV5_Monde&to=Telepictures',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Telepictures_Corp.&to=The_Hornsby_Inn',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=The_Hub&to=The_X_Factor_(US)',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=The_X_Factor_(USA)&to=Trojan',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Trojka&to=Ushuaïa_TV',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Utah_Grizzlies&to=Vänsterpartiet',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Västerbottensost&to=WLYF',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=WLYH-TV&to=WXXA-TV',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=WXXI-TV&to=William_Morris_Endeavor',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Williams_&_Glyn\'s_Bank&to=XHGZ-FM',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=XHHC-FM&to=Zoo_Tycoon:_Marine_Mania',
											  'http://logos.wikia.com/wiki/Special:AllPages?from=Zoo_Tycoon_(2001)&to=Zyrtec' ];

		var arrayOfLogoSites  = [ 'http://logos.wikia.com/wiki/Special:AllPages?from=!ViewSonic&to=4Licensing_Corporation',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=4Minute&to=AKQA',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=AKT_(Akita_Television)&to=Adobe_Encore',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Adobe_Fireworks&to=Alchemy',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Alcoa&to=Android_4.1_Jelly_Bean',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Android_4.2_Jelly_Bean&to=Army_Times',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Arnhem_1980&to=AyM_Sports',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Ayala_Land&to=BSG_Motor_Babelsberg',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=BSkyB&to=Bauhaus',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Bausch_+_Lomb&to=Bieberpedia',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Biedronka&to=Bom_Dia_Sergipe',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Bom_Dia_São_Paulo&to=BritishSkyBroadcasting',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=BritishSkyBrodcasting&to=CBWFT',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=CBWT&to=COSI',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=COlumbiatristar&to=Canal+_Sport_HD_(Poland)',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Canal+_Séries&to=Cartoon_Network_(Nordic)',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Cartoon_Network_(Pakistan)&to=Chester_FC',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Chesterfield_Borough_Council&to=Circle_7_Animation',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Circle_K&to=Colorado_Rockies',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Colorado_Rockies_(NHL)&to=Coop_Nära',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Coop_Prima&to=DAN-BALL',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=DAT&to=Dasfa_ir_Ko',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Dash&to=Digital_Audio_Tape',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Digital_Compact_Cassette&to=Distraction_(U.K.)',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Distrito_Comedia&to=Dubai_Waterfront',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Dubailand&to=EastEnders',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=EastLink_TV&to=English_First',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=English_Markell_Pockett&to=Evite',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Evite.com&to=Fantasia',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Fantasia_(Disney)&to=Five/2002_Idents',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Five/2008_Idents&to=Fox_Sports_2_(United_States)',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Fox_Sports_2_HD&to=Full_Channel',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Full_House&to=Gençlerbirliği_SK',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Geo&to=GoodTimes_Entertainment',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Good_Boy!&to=Griesson',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Griesson_-_de_Beukelaer&to=HTC_Wildfire',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=HTC_Wildfire_S&to=Hi_Honey,_I\'m_Home!',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Hibernian_FC&to=Houston_Texans_Radio_Network',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Houston_Zoo&to=ITunes_Festival',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=ITélèvision&to=Integrated_Kent_Franchise',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Integrated_electronics&to=Jeju_United',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Jell-O&to=KABE-LD',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=KACV-TV&to=KICU-TV',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=KIDK&to=KPNZ',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=KPOB&to=KWCH-DT',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=KWCH-TV&to=Ketnet',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Kettering_Borough_Council&to=Kwik_E_Mart',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Kwik_Save&to=Lauda',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Lauf_al_Hamiliyon&to=Listerine',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Litecoin&to=Lrt.lt',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Lu&to=MTV_Brand_New_(Benelux)',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=MTV_Brasil&to=Manchester_Monarchs',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Manchester_United&to=MediaCorp_Channel_8',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=MediaCorp_Channel_U&to=Metrovalencia',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Mexicali_(Government)&to=Mlle_(TV_channel)',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Mnet&to=Movistar_Hogar_Perú',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Movistar_Móvil_Colombia&to=NETV',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=NET_(Brazil)&to=Natonwide_Series',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Natreen&to=Nfilm_2',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Nginx&to=Norsk_Hydro',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Norsk_rikskringkasting&to=Office_Create',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Office_Depot&to=Ottawa_MacDonald-Cartier_International_Airport',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Ottawa_Macdonald-Cartier_International_Airport&to=Paramount_Home_Entertainment',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Paramount_Home_VIdeo&to=Perfetti_van_Melle',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Performance_Channel&to=PlayStation_Rewards',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=PlayStation_Store&to=Por_Toda_Minha_Vida',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Por_el_Bien_de_Todos_(2006)&to=Puzz_3D',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Puzzle_Pirates&to=RTL_Télé_Lëtzebuerg',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=RTM&to=Rai/Other',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Rai_1&to=Reelz',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=ReelzChannel&to=Roller_Coaster_Trivia',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Roller_Coaster_Tycoon_2&to=SCHIP',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=SCORE&to=Samurai_Jack',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Samurai_Shodown&to=Scribblenauts',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Scribblenauts_Remix&to=Show_Me_St._Louis',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Show_Me_The_Money&to=Sky_Active',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Sky_Arte&to=Sol_música',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Solane&to=Sparbanken_Finn',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Sparbanken_Gripen&to=Star_Wars',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Star_Wars_Episode_I:_The_Phantom_Menace&to=Sumbeam_Television',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Sumitomo_Heavy_Industries&to=TAG_Heuer',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=TAME&to=TV5_(Philippines)',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=TV5_Monde&to=Talentvision',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Tales_of_Symphonia:_Dawn_of_the_New_World&to=Telepictures',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Telepictures_Corp.&to=The_Bill',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=The_Biography_Channel&to=The_Hornsby_Inn',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=The_Hub&to=The_Sims:_Bustin\'_Out',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=The_Sims:_Deluxe_Edition&to=The_X_Factor_(US)',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=The_X_Factor_(USA)&to=Top_Spin_3',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Top_Spin_4&to=Trojan',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Trojka&to=Um_Milhao_na_Mesa',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Um_Milhão_na_Mesa&to=Ushuaïa_TV',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Utah_Grizzlies&to=Video_Box_Office',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Video_Cassette_Recording&to=Vänsterpartiet',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Västerbottensost&to=WFTC',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=WFTS-TV&to=WLYF',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=WLYH-TV&to=WSYR-TV',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=WSYT&to=WXXA-TV',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=WXXI-TV&to=Wellbeing_Channel',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Wellcome&to=William_Morris_Endeavor',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Williams_&_Glyn\'s_Bank&to=XEBM-AM_/_XHBM-FM',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=XEBON-AM&to=XHGZ-FM',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=XHHC-FM&to=Yelp',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Yeo\'s&to=Zoo_Tycoon:_Marine_Mania',
								  'http://logos.wikia.com/wiki/Special:AllPages?from=Zoo_Tycoon_(2001)&to=Zyrtec']
		var logopedia = function(){

			request("http://logos.wikia.com/index.php?title=Special%3AAllPages&from=%21ViewSonic&to=Zyrtec&namespace=0", function(error, response, body){
				
				if(error){
					console.log("Something went wrong! " + error );
				}

				var $ = cheerio.load(body);

				var arrayOfSites = Array();
				console.log("Lets get some logos!! ")

				$('.allpageslist tr').each(function(){
					var link = $(this)[0].children[0].children[0].attribs.href;
					var decoded = decodeURIComponent("http://logos.wikia.com"+link).replace("&amp;", "&");
					arrayOfSites.push(decoded);
				})
				console.log(arrayOfSites)
				

				});
			}

		var logopedia2 = function(a, index){

			if(index < a.length && a[index] !== 'http://logos.wikia.com/wiki/Special:AllPages?from=Zoo_Tycoon_(2001)&to=Zyrtec'){
				request(a[index], function(error, response, body){
					if(error){
						console.log("Error " + error);
					}
					else{
						var $ = cheerio.load(body);
						var one, 
							two;

						if(typeof $('.mw-allpages-alphaindexline')[0].children[0].attribs.href !== 'undefined'){ 
							one = decodeURIComponent("http://logos.wikia.com" + $('.mw-allpages-alphaindexline')[0].children[0].attribs.href).replace("&amp;", "&");
							fullArrayOfSites.push(one);
						}
						if(typeof $('.mw-allpages-alphaindexline')[1].children[0].attribs.href !== 'undefined'){
							two = decodeURIComponent("http://logos.wikia.com" + $('.mw-allpages-alphaindexline')[1].children[0].attribs.href).replace("&amp;", "&");
							fullArrayOfSites.push(two);
						}
						
						index++;
						logopedia2(a, index);
					}
				})
			}
			else{
				console.log(fullArrayOfSites);
			}
		}
		var fullArrayOfSites = Array();
		logopedia2(arrayOfLogopediaSites, 0);
	}