//---------------------------------------
//			****  MUST KEEP  *****
//---------------------------------------
//Necessary objects
{
	{
		console.log('Getting dependencies...');
		var http = require('http');
		var express = require('express');
		var http = require('http');
		var bodyParser = require('body-parser');
		var url = require('url');
		var app = express(); //create express middleware dispatcher
		var urlObj; //we will parse user GET URL's into this object
		var session = require('express-session')
		const uuidV4 = require('uuid/v4');
		var fs = require('fs');
		function password_generator( len ) {
	        var length = (len)?(len):(10);
	        var string = "abcdefghijklmnopqrstuvwxyz"; //to upper
	        var numeric = '0123456789';
	        var punctuation = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
	        var password = "";
	        var character = "";
	        var crunch = true;
	        while( password.length<length ) {
	            entity1 = Math.ceil(string.length * Math.random()*Math.random());
	            entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
	            entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
	            hold = string.charAt( entity1 );
	            hold = (entity1%2==0)?(hold.toUpperCase()):(hold);
	            character += hold;
	            character += numeric.charAt( entity2 );
	            character += punctuation.charAt( entity3 );
	            password = character;
	        }
	        return password;
	    }

		var minsToDeleteCookieAt = 120

		var sessionMongoose = require('mongoose');
		sessionMongoose.connect('mongodb://localhost:27017/test');

		var dbMongoose = require('mongo');
		dbMongoose.connect('mongodb://localhost:27017/gurdwaraDB');

		var receiptSchema = dbMongoose.Schema({receiptNum: Number,
						amount: Number,
						date: String,
						type: String,
						paymentType: String,
						clientID: String,
						donator: {
							salutation: String,
							name: String,
							address: String,
							city: String,
							telephone: Number,
							email: String}})
		var Receipt = mongoose.model('Receipt', receiptSchema);

		var donatorSchmea = dbMongoose.Schema({
							salutation: String,
							name: String,
							address: String,
							city: String,
							telephone: Number,
							email: String})
		var Donator = mongoose.model('Donator', donatorSchmea);
		
		var randomSecret = password_generator(40)
		app.use(session({
				secret: randomSecret,
				resave: false,
				store: new (require('express-sessions'))({
						storage: 'mongodb',
						instance: sessionMongoose, // optional
						collection: 'sessions', // optional
						expire: minsToDeleteCookieAt*60*1000, // optional
						token: null,
						name: null,
						clientID: null
				})
		}));

	}
	function addHeader(request, response, next){
		// header portion of web page
		response.writeHead(200, {'Content-Type': 'text/html'});
		var html = fs.readFileSync('header.html')
		response.write(html)
		next();
	}
	function logStatus(request, response,next){
		var title = 'Gurdwara Guru Nanak Mission Centre';
		var tag = 'Donation Managment System';
		response.write('<body>');
		response.write('<div class="row"><div class="large-12 columns">');

		response.write('<h3 style="text-align: center;margin: 20px auto 0;">' +  title + '</h3>');
		response.write('<h4 style="text-align: center;margin: 0 auto 10px;">' +  tag + '</h4>');

		if(request.session.name !== undefined && request.session.name !== null ){
		  response.write('<p style="text-align: right;"><strong>Logged In:</strong> ' + request.session.name + ' <a class="button alert" href= "/logout" style="color:white;">Logout</a></p>');
		}

		response.write('<hr>');
		next();
	}
	function addFooter(request, response, next){
		var html = fs.readFileSync('footer.html')
		response.write(html)
		next();
	}
	function parseURL(request, response, next){
	    //parse query parameters in URL
		var parseQuery = true; //parseQueryStringIfTrue
	  var slashHost = true; //slashDenoteHostIfTrue
	  urlObj = url.parse(request.url, parseQuery , slashHost );

	  for(x in urlObj.query) console.log(x + ': ' + urlObj.query[x]);
		next();
	}
	function respondToClient(request, response, next){
	    response.end(); //send response to client
		//notice no call to next()
	}
	function randomInt(low,high){
		return Math.floor(Math.random()*(high-low+1)+low);
	}
}

//---------------------------------------
//	   ******** USER SEARCH **********
//---------------------------------------
function userSearchForm(request, response, next){
    // handler for search POST message
	console.log("RUNNING HANDLE SEARCH FORM");
	console.log("SEARCH REQUEST BODY");
	console.log(request.body);
	console.log("END REQUEST BODY");
	if(request.body.can == ''){
		request.body.can = 'All';
	}
	if(request.body.elec == ''){
		request.body.elec = 'All';
	}
	if(request.body.ride == ''){
		request.body.ride = 'All';
	}
	if(request.body.prov == ''){
		request.body.prov = 'All';
	}

	response.write('<div class="row callout secondary">');
	console.log(request.body.can);
	response.write('<form method="post" action="/candidateView">');
	response.write('<legend><h3>Filter</h3></legend>');
	response.write('<div class="row"><div class="small-2 columns"><label for="right-label" class="text-right">Candidate Name: </label></div><div class="small-8 columns"><input type="text" name="can" value="'+request.body.can+'"></div><div class="small-2 columns"></div></div>');
    response.write('<div class="row"><div class="small-2 columns"><label for="right-label" class="text-right">Election: </label></div><div class="small-8 columns"><input type="text" name="elec" value="'+request.body.elec+'"></div><div class="small-2 columns"></div></div>');
    response.write('<div class="row"><div class="small-2 columns"><label for="right-label" class="text-right">Riding: </label></div><div class="small-8 columns"><input type="text" name="ride" value="'+request.body.ride+'"></div><div class="small-2 columns"></div></div>');
    response.write('<div class="row"><div class="small-2 columns"><label for="right-label" class="text-right">Province: </label></div><div class="small-8 columns"><input type="text" name="prov" value="'+request.body.prov+'"></div><div class="small-2 columns"></div>');
 	response.write('<div class="small-2 columns"><input class="large button"style="float:right;" type="submit" value="Search"></div></div>');
 	response.write('</form>');
	response.write('</div>');


	// DB CALL HERE TO GET RESULTS


	var query = 'create table a4 AS select politicianID from a3';
	var lastAdd = 0;
	if(request.body.can != 'All'){
		if(lastAdd == 0){query += ' WHERE ';}
		query += "name='" + request.body.can + "'";
		lastAdd = 1;
	}
	if(request.body.elec != 'All'){
		if(lastAdd == 0){query += ' WHERE ';}
		if(lastAdd == 1){query += ' AND ';}
		query += ' elecID=' + request.body.elec;
		lastAdd = 1;
	}
	if(request.body.ride != 'All'){
		if(lastAdd == 0){query += ' WHERE ';}
		if(lastAdd == 1){query += ' AND ';}
		query += "ridingID='" + request.body.ride + "'";
		lastAdd = 1;
	}
	if(request.body.prov != 'All'){
		if(lastAdd == 0){query += ' WHERE ';}
		if(lastAdd == 1){query += ' AND ';}
		query += "Province='" + request.body.prov + "'";
		lastAdd = 1;
	}
	query += ";";
	var sql1 = 'drop table if exists a1; drop table if exists a2; drop table if exists a3; drop table if exists a4;'+
		'create table a1 AS select politicianID, name from politician;'+
		'create table a2 AS select politicianID, name, elecID, ridingID from contendor INNER JOIN  a1 ON contendor.polID = a1.politicianID;' +
		'create table a3 AS select politicianID, name, elecID, a2.ridingID, Province from a2 INNER JOIN riding ON a2.ridingID = riding.ridingID;' +
		query;

	var sql2 = 'select distinct a4.politicianID,name,party,description,wikiLink,parlLink from a4 INNER JOIN politician ON a4.politicianID = politician.politicianID;';

	console.log(sql1 +sql2);
	db.run(sql1);
	db.all(sql2, function(err, rows){
		console.log("num of row: " + rows.length);
		var toReturn = '';
		for(var i=0; i<rows.length; i++){
			toReturn += '<div class="row">';
			toReturn += '<div class="small-6 columns">';
		    toReturn += '<div class="small-12 columns"><strong>' + rows[i].name  + '</strong> - '+ rows[i].party +'</div>';
		    toReturn += '<div class="row"><div class="small-6 columns">' + rows[i].wikiLink  + '</div>';
		    toReturn += '<div class="small-6 columns">' + rows[i].parlLink  + '</div></div>';
		   	toReturn += '</div>'
		    toReturn += '<div class="small-4 columns">' + rows[i].description  + '</div>'
		    toReturn += '<div class="small-2 columns"><form method="post" action="/candidateDetails">';
		    toReturn += '<input type="text" name="canID" value="'+rows[i].politicianID+'"placeholder="Province" style="display:none;">';
		    toReturn += '<input class="large button" style="float:right;" type="submit" value="details">';
		    toReturn += '</form></div><hr></div>'
		}
		response.write(toReturn);
		console.log('Returning...');
    	next();
	});
}

//---------------------------------------
//	  ******** BILL SEARCH **********
//---------------------------------------
function billSearchForm(request, response, next){
    // handler for search POST message'
    if(request.body.bill == ''){
		request.body.bill = 'All';
	}
	response.write('<div class="row callout secondary">');
	response.write('<form method="post" action="/billView">');
	response.write('<legend><h3>Filter</h3></legend>');
	response.write('<div class="small-2 columns"><label for="right-label" class="text-right">Bills: </label></div><div class="small-8 columns"><input type="text" name="bill" value="'+request.body.bill+'"></div>');
    response.write('<div class="small-2 columns"><input class="large button"style="float:right;" type="submit" value="Search"></div>');
	response.write('<div class="large-6 columns"><input id="checkbox1" type="checkbox"><label name="passed">Show only passed Bills</label></div>');
	response.write('</form>');
	response.write('</div>');

	// DB CALL HERE TO GET RESULTS

	var sql = 'SELECT billName, passed, desc, link FROM bills';
	var lastAdd = 0;
	if(request.body.bill != 'All'){
		if(lastAdd == 0){sql += ' WHERE ';}
		sql += "billName='" + request.body.bill + "'";
		lastAdd = 1;
	}
	if(request.body.passed == 1){
		if(lastAdd == 0){sql += ' WHERE ';}
		if(lastAdd == 1){sql += ' AND ';}
		sql += "passed=" + request.body.passed;
		lastAdd = 1;
	}

	console.log(sql);
	db.all(sql, function(err, rows){
		console.log("num of row: " + rows.length);
		var toReturn = '';
		for(var i=0; i<rows.length; i++){
			toReturn += '<div class="row">';
		    toReturn += '<div class="small-6 columns"><strong>' + rows[i].billName  + '</strong></div>';
		    if(rows[i].passed == 1){
		    	toReturn += '<div class="small-6 columns">Passed</div>';
		    }else{
		    	toReturn += '<div class="small-6 columns">Not Passed</div>';
		    }
		    toReturn += '</div><div class="row">';
		    toReturn += '<div class="small-6 columns">' + rows[i].desc  + '</div>';
		    toReturn += '<div class="small-6 columns">' + rows[i].link  + '</div>';
		   	toReturn += '</div><hr>';
		}
		response.write(toReturn);
		console.log('Returning...');
    	next();
	});
}

//---------------------------------------
//	  ******** LOGIN  ************
//---------------------------------------
function loggedin(request,response,next){
	if(request.body.token != null && request.session.token == null){
		request.session.token = request.body.token
		request.session.name = request.body.name
		request.session.clientID = request.body.clientid
		console.log(request.session);

		root(request,response,next)
	}else{
		login(request,response,next)
	}
}
function logout(request,response,next){
		console.log('logout-> '+request.session);
		request.session.name = null;
		request.session.clientID = null;
		request.session.token = null;

		login(request,response,next)
}
function login(request,response,next){
	console.log('login-> '+request.session);
	if(request.session.token == undefined || request.session.token == null){
		logStatus(request,response,next)
		var html = fs.readFileSync('login.html')
		response.write(html)
		next()
	}else{
		root(request,response,next)
		// return response.redirect('/');
	}
}

//---------------------------------------
//	  ******** ISSUE RECEIPT **********
//---------------------------------------
function issueReceipt(request, response, next){
	// Add check for session after

	// show receipt Number

	// get max ticket Number


	// load form for issuance


}

function issuedReceipt(request, response, next){
	// add to db


	// show page given status

	//




}

//---------------------------------------
//			****** ROOT ******
//---------------------------------------
function root(request, response, next){
	console.log('root-> '+request.session);
	if(request.session.token == undefined || request.session.token == null){ login(request, response,next)}
	else {
		logStatus(request,response,next)
		var html = fs.readFileSync('root.html')
		response.write(html)
		next();
	}
}


app.use(express.static(__dirname));
app.use(parseURL);
app.use(bodyParser.text({ type: 'text/html' }));
app.use(bodyParser.urlencoded({ extended: true })); //parse body of POST messages
app.use(addHeader);

app.get('/', root); //main page
app.get('/login', login);
app.post('/loggedin',loggedin);
app.get('/logout',logout);
app.get('/issueReceipt',issueReceipt)
app.post('/issuedReceipt',issuedReceipt)

app.use(addFooter);
app.use(respondToClient);



//create http-express server
http.createServer(app).listen(3001);

console.log('Server Running at http://127.0.0.1:3001  CNTL-C to quit');
