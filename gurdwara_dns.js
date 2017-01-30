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
		var AWS = require('aws-sdk');

		// setup AWS config
		AWS.config.update({
		    accessKeyId: "AKIAIODNRZQ4U7HO7NNA",
		    secretAccessKey: "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",
				region: "us-west-2"
		});

		// doc client for Dynamodb
		var docClient = new AWS.DynamoDB.DocumentClient();


		// setup for current account

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

		function sortByAttribue(arr, attribute) {
		  return arr.sort(function(a,b) {
		    return a[attribute] < b[attribute];
		  });
		}

		var minsToDeleteCookieAt = 120

		var sessionMongoose = require('mongoose');
		sessionMongoose.connect('mongodb://localhost:27017/test');

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

		function generateUUID(){
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		}

		String.prototype.capitalizeFirstLetter = function() {
		    return this.charAt(0).toUpperCase() + this.slice(1);
		}
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
		response.write('<p style="text-align: center;margin: 0 auto 10px;">581 Robertson Blvd., Brampton. (Springdale) ON CANADA L6R 2H7</p>');
		response.write('<p style="text-align: center;margin: 0 auto 10px;">Tel: 905-799-2682 / 905-494-5665</p>');

		if(request.session.name !== undefined && request.session.name !== null ){
			response.write('<div class="row dontPrint">');
		  	response.write('<div class="large-6 columns"><p style="text-align: left;"><a class="button primary" href= "/">Home</a></p></div>');
				response.write('<div class="large-6 columns"><p style="text-align: right;"><strong>Logged In:</strong> ' + request.session.name + ' <a class="button alert" href= "/logout" style="color:white;">Logout</a></p></div>');
			response.write('</div>');
		}

		response.write('<hr>');
	}
	function addFooter(request, response, next){
		var html = fs.readFileSync('footer.html')
		response.write(html)
		next();
	}
	function parseURL(request, response, next){
		// console.log(url)
	    //parse query parameters in URL
		var parseQuery = true; //parseQueryStringIfTrue
	  var slashHost = true; //slashDenoteHostIfTrue
	  urlObj = url.parse(request.url, parseQuery , slashHost );
		// console.log(urlObj)
	  // for(x in urlObj.query) console.log(x + ': ' + urlObj.query[x]);
		next();
	}
	function respondToClient(request, response, next){
	    response.end(); //send response to client
		//notice no call to next()
	}

	// Might not be required
	function randomInt(low,high){
		return Math.floor(Math.random()*(high-low+1)+low);
	}

	String.prototype.replaceAll = function(search, replacement) {
	    var target = this;
	    return target.replace(new RegExp(search, 'g'), replacement);
	};
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
	if(request.session.token == undefined || request.session.token == null){ login(request, response,next)}
	else{
		logStatus(request,response,next);

		// get max receipt number +1
		var params = {
			TableName: 'GDS-G1-Donations',
			AttributesToGet: ["receiptNumber"]
		};

		docClient.scan(params, function(err, data){
			if(err){
				console.error("Unable to read donations. Error JSON:", JSON.stringify(err, null, 2));
				response.write('<h3 style="color:red;">ERROR</h3>');
				response.write('<p>'+JSON.stringify(err, null, 2)+'</p>');
				response.write('<p>Please contact (819)329-3318 Immediately.</p>');
				next();
			}else{
				var receiptNumber = parseInt(sortByAttribue(data.Items, "receiptNumber")[0]["receiptNumber"]) + 1;
				response.write('<div class="row">');
				response.write('<div class="large-3 columns"><h4>Receipt Number:</h4></div><div class="large-3 columns"><h4 id="receiptNumber">' + receiptNumber + '</h4></div>');
				response.write('<script>var receiptNumberCurr = '+receiptNumber+';</script>')
				response.write('<div class="large-6 columns"></div>')
				response.write('</div>');

				var html  = fs.readFileSync('receiptForm.html');
				response.write(html);
				var postHTML = fs.readFileSync('post.html');
				response.write(postHTML);
				// create script for updating fields
				response.write('<script>');
					response.write('function updateVals(){');
						// use uid is available
						if(Object.keys(request.body).length === 0 && request.body.constructor === Object){
							response.write('}</script>');
							next();
						}else if(request.body.uuid !== ""){
							// get max receipt number +1
							var params = {
								TableName: 'GDS-G1-Donators',
								Key: {
									donatorUID : request.body.uuid
								}
							};
							console.log('uid that issue receipt received: ' + request.body.uuid);
							docClient.get(params, function(err, data){
								if(err){
									console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
									response.write('<h3 style="color:red;">ERROR</h3>');
									response.write('<p>'+JSON.stringify(err, null, 2)+'</p>');
									response.write('<p>Please contact (819)329-3318 Immediately.</p>');
									next();
								}else{
									console.log('Item0 is: ' + JSON.stringify(data));
											response.write('document.getElementById(\'name\').value = "'+data["Item"]["donatorName"]+"\";");
											response.write('document.getElementById(\'apt\').value = "'+data["Item"]["addressAptNum"]+"\";");
											response.write('document.getElementById(\'street\').value = "'+data["Item"]["addressStreet"]+"\";");
											response.write('document.getElementById(\'city\').value = "'+data["Item"]["addressCity"]+"\";");
											response.write('document.getElementById(\'country\').value = "'+data["Item"]["addressCountry"]+"\";");
											response.write('document.getElementById(\'postal\').value = "'+data["Item"]["addressPostalCode"]+"\";");
											response.write('document.getElementById(\'phone\').value = "'+data["Item"]["telephone"]+"\";");
											response.write('document.getElementById(\'postal\').value = "'+data["Item"]["addressPostalCode"]+"\";");
											response.write('document.getElementById(\'email\').value = "'+data["Item"]["email"]+"\";");
											response.write('document.getElementById(\'uid\').value = "'+request.body.uuid+"\";");
											response.write('document.getElementById(\'donatorStatus\').innerHTML = "<p>Previous Donator</p>";');
										response.write('}');
									response.write('</script>');
									next();
								}
							});
						}
						else if(request.body.first !== "" || request.body.last !== "" || request.body.phone !== "" || request.body.city !== ""){
							if(request.body.first && request.body.last){
								response.write('document.getElementById(\'name\').value = '+request.body.first + " " + request.body.last+";");
							}
							else if(request.body.first){
								response.write('document.getElementById(\'name\').value = '+request.body.first+";");
							}
							else if(request.body.last){
								response.write('document.getElementById(\'name\').value = '+request.body.last+";");
							}
							if(request.body.phone){
								response.write('document.getElementById(\'phone\').value = '+request.body.phone+";");
							}
							if(request.body.city){
								response.write('document.getElementById(\'city\').value = '+request.body.city+";");
							}
								response.write('}');
							response.write('</script>');
							next();
						}

			}
		});
	}
}
function issuedReceipt(request, response, next){
	console.log("\n------------------\n" + JSON.stringify(request.body) + "\n------------------\n")
	logStatus(request, response, next);
	// add to db
	var salutation = request.body.salutation;
	var name = request.body.name;
	var apt = request.body.apt;
	var street = request.body.street;
	var city = request.body.city;
	var country = request.body.country;
	var postal = request.body.postal;
	var phone = request.body.phone;
	var email = request.body.email;
	var uid = request.body.uuid;

	var amountText = request.body.amountText;
	var dollars = request.body.dollars;
	var cents = request.body.cents;
	var donationType = request.body.donationType;
	var paymentType = request.body.paymentType;
	var chequeNumber = request.body.chequeNumber;
	var chequeDate = request.body.chequeDate;
	var receiptNumber = request.body.receiptNumber;

	if(uid == 'xxxxxxxx-xxxx-4xxx'){
		//new client - generate uuid
		uid = generateUUID();
		console.log(uid);
		// create item in donators table
		if(apt == ""){apt="N/A";}
		if(email == ""){email="N/A";}
		var params = {
    	TableName:"GDS-G1-Donators",
			Item:{
			  "addressAptNum": apt,
			  "addressCity": city,
			  "addressCountry": country,
			  "addressPostalCode": postal,
			  "addressStreet": street,
			  "donatorName": name,
			  "donatorUID": uid,
			  "email": email,
			  "salutation": salutation,
			  "telephone": parseInt(phone)
			}
		};
		console.log(params);
		docClient.put(params, function(err, data) {
		    if (err) {
					console.error("Unable to put item in donators. Error JSON:", JSON.stringify(err, null, 2));
					response.write('<h3 style="color:red;">ERROR</h3>');
					response.write('<p>'+JSON.stringify(err, null, 2)+'</p>');
					response.write('<p>Please contact (819)329-3318 Immediately.</p>');
					next();
		    }
				else {
					// store / issue receipt in donationsDB
					var amount = parseInt(dollars) + (parseInt(cents)/100);
					var currDate = new Date();
					if(chequeNumber == ""){chequeNumber = "N/A";}
					if(chequeDate == ""){chequeDate = "N/A";}
					if(amountText == ""){amountText = "N/A"}
					var params = {
						TableName:"GDS-G1-Donations",
						Item:{
							"amount": amount,
							"paymentType" : paymentType,
							"chequeDate": chequeDate,
							"chequeNumber": chequeNumber,
							"dateTime": currDate.toISOString(),
							"donationFor": donationType,
							"donatorID": uid,
							"employeeNumber": request.session.clientID,
							"paymentType": paymentType,
							"receiptNumber": parseInt(receiptNumber),
							"status": "ISSUED",
							"amountText": amountText
						}
					};
					docClient.put(params, function(err, data) {
					    if (err) {
								console.error("Unable to put item in donations. Error JSON:", JSON.stringify(err, null, 2));
								response.write('<h3 style="color:red;">ERROR</h3>');
								response.write('<p>'+JSON.stringify(err, null, 2)+'</p>');
								response.write('<p>Please contact (819)329-3318 Immediately.</p>');
								next();
					    }else{
								var streetAddress = '';
								if(apt != ""){
									streetAddress += apt +", "
								}
								streetAddress += street;

								var html = fs.readFileSync('receiptPrint.html');
								response.write(html);
								response.write('<script>');
								response.write('function updateVals(){');
									response.write('document.getElementById("receiptNum").innerHTML= "'+ receiptNumber +'";');
									response.write('document.getElementById("date").innerHTML= "'+ currDate.toISOString().slice(0,10) +'";');
									response.write('document.getElementById("salutation").innerHTML= "'+ salutation +'";');
									response.write('document.getElementById("name").innerHTML= "'+ name +'";');
									response.write('document.getElementById("streetAddress").innerHTML= "'+ streetAddress +'";');
									response.write('document.getElementById("cityCountry").innerHTML= "'+ city + ", " + country +'";');
									response.write('document.getElementById("postalCode").innerHTML= "'+ postal +'";');
									response.write('document.getElementById("telephone").innerHTML= "'+ phone +'";');
									response.write('document.getElementById("email").innerHTML= "'+ email +'";');
									response.write('document.getElementById("dollars").innerHTML= "'+ dollars +'";');
									response.write('document.getElementById("cents").innerHTML= "'+ cents +'";');
									response.write('document.getElementById("amountText").innerHTML= "'+ amountText +'";');
									response.write('document.getElementById("paymentType").innerHTML= "'+ paymentType +'";');
									response.write('document.getElementById("chequeInfo").innerHTML= "'+ chequeNumber + ", " + chequeDate +'";');
									response.write('document.getElementById("donationType").innerHTML= "'+ donationType +'";');
									response.write('document.getElementById("clientID").innerHTML= "'+ request.session.clientID +'";');
								response.write('}');
								response.write('</script>');

								//create updateVals

								next();
							}
					})

		    }
		});
	}
	else{
		// store / issue receipt in donationsDB
		var amount = parseInt(dollars) + (parseInt(cents)/100);
		var currDate = new Date();
		if(chequeNumber == ""){chequeNumber = "NA";}
		if(chequeDate == ""){chequeDate = "NA";}
		if(amountText == ''){amountText = "N/A"}
		var params = {
			TableName:"GDS-G1-Donations",
			Item:{
				"amount": amount,
				"paymentType" : paymentType,
				"chequeDate": chequeDate,
				"chequeNumber": chequeNumber,
				"dateTime": currDate.toISOString(),
				"donationFor": donationType,
				"donatorID": uid,
				"employeeNumber": request.session.clientID,
				"paymentType": paymentType,
				"receiptNumber": parseInt(receiptNumber),
				"amountText": amountText,
				"status": "ISSUED"
			}
		};
		console.log(params);
		docClient.put(params, function(err, data) {
		    if (err) {
					console.error("Unable to put item in donations. Error JSON:", JSON.stringify(err, null, 2));
					response.write('<h3 style="color:red;">ERROR</h3>');
					response.write('<p>'+JSON.stringify(err, null, 2)+'</p>');
					response.write('<p>Please contact (819)329-3318 Immediately.</p>');
					next();
		    }else{
					var streetAddress = '';
					if(apt != ""){
						streetAddress += apt +", "
					}

					streetAddress += street;

					var html = fs.readFileSync('receiptPrint.html');
					response.write(html);

					response.write('<script>');
					response.write('function updateVals(){');
						response.write('document.getElementById("receiptNum").innerHTML= "'+ receiptNumber +'";');
						response.write('document.getElementById("date").innerHTML= "'+ currDate.toISOString().slice(0,10) +'";');
						response.write('document.getElementById("salutation").innerHTML= "'+ salutation +'";');
						response.write('document.getElementById("name").innerHTML= "'+ name +'";');
						response.write('document.getElementById("streetAddress").innerHTML= "'+ streetAddress +'";');
						response.write('document.getElementById("cityCountry").innerHTML= "'+ city + ", " + country +'";');
						response.write('document.getElementById("postalCode").innerHTML= "'+ postal +'";');
						response.write('document.getElementById("telephone").innerHTML= "'+ phone +'";');
						response.write('document.getElementById("email").innerHTML= "'+ email +'";');
						response.write('document.getElementById("dollars").innerHTML= "'+ dollars +'";');
						response.write('document.getElementById("cents").innerHTML= "'+ cents +'";');
						response.write('document.getElementById("amountText").innerHTML= "'+ amountText +'";');
						response.write('document.getElementById("paymentType").innerHTML= "'+ paymentType +'";');
						response.write('document.getElementById("chequeInfo").innerHTML= "'+ chequeNumber + ", " + chequeDate +'";');
						response.write('document.getElementById("donationType").innerHTML= "'+ donationType +'";');
						response.write('document.getElementById("clientID").innerHTML= "'+ request.session.clientID +'";');
					response.write('}');
					response.write('</script>');

					next();
				}
		});

  }
}

//---------------------------------------
//	  ******** FIND DONATOR **********
//---------------------------------------
function userinformation(request, response, next){
	if(request.session.token == undefined || request.session.token == null){ login(request, response,next)}
	else{
		logStatus(request,response,next)
		// generate users given post request and then display in table
		// with link to issue another receipt

		// console.log("\n\n " + request.body.first + ", " + request.body.last + ", " + request.body.phone + ", " + request.body.city + "\n\n");
		var table = "GDS-G1-Donators";
		var filterString = '';
		var filterexpressions = {};
		var first = false, last = false, phone = false, city = false;

		if(request.body.first !== undefined && request.body.first != ""){
			first = true;
			filterString += 'contains(donatorName, :firstname)';
			filterexpressions[":firstname"] =	request.body.first.capitalizeFirstLetter();
		}

		if(request.body.last !== undefined && request.body.last != ""){
			last = true;
			filterexpressions[":secondname"] =	request.body.last.capitalizeFirstLetter();
			if(first == true){
				filterString += ' OR contains(donatorName, :secondname)';
			}else{
				filterString += 'contains(donatorName, :secondname)';
			}

		}

		if(request.body.phone !== undefined && request.body.phone != ""){
			phone = true;
			filterexpressions[":phone"] =	parseInt(request.body.phone);
			if(last == true || first == true){
				filterString += ' OR (telephone = :phone)';
			}else{
				filterString += '(telephone = :phone)';
			}
		}

		if(request.body.city !== undefined && request.body.city != ""){
			city = true;
			filterexpressions[":city"] =	request.body.city.capitalizeFirstLetter();
			if(first == true || last == true || phone == true){
				filterString += ' OR contains(addressCity, :city)';
			}else{
				filterString += 'contains(addressCity, :city)';
			}
		}

		if(first || last || phone || city){
			var params = {
			    TableName: table,
					FilterExpression: filterString,
				  ExpressionAttributeValues: filterexpressions
			};
		}
		else{
			var params = {
			    TableName: table
			};
		}

		docClient.scan(params, function(err, data) {
		    if (err) {
		        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
						response.write('<h3 style="color:red;">ERROR</h3>');
						response.write('<p>'+JSON.stringify(err, null, 2)+'</p>');
						response.write('<p>Please contact (819)329-3318 Immediately.</p>');
						next();
		    } else {
						if(data.Count == 0){
							// No results of search
							response.write('<p>No results found. Please continue issuing receipt.</p>')
							response.write('<button class="large button" style="float:right;" onclick="')
							response.write('post(\'/issueReceipt\',{');
								response.write('name:\''+request.body.first+'\',');
								response.write('city:\''+request.body.city+'\',');
								response.write('telephone:\''+request.body.phone+'\'');
							response.write('})');
							response.write('">Issue Receipt</button></td>');
							response.write(fs.readFileSync('post.html'));
							next();
						}
						else{
							console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
							// generate HTML Table for each
							response.write('<div class="row"><table><thead><tr><th>Donators</th><th width="150"></th></tr></thead><tbody>');

							for(var i in data.Items){
								var uid = data.Items[i]["donatorUID"];
								var name = data.Items[i]["donatorName"];
								var addApt = data.Items[i]["addressAptNum"];
								var addStreet =  data.Items[i]["addressStreet"];
								var addCity =  data.Items[i]["addressCity"];
								var addCountry =  data.Items[i]["addressCountry"];
								var telephoneNum =  data.Items[i]["telephone"];

								response.write('<tr>');
									response.write('<td><p>' + name + '<br>');
									if(addApt != 'NA'){
										response.write(addApt + ", ")
									}
									response.write(addStreet + '<br>' + addCity + ", " + addCountry + "<br>"+telephoneNum+'<p></td>');
									response.write('<td><button class="large button" style="float:center;" onclick="')
									response.write('post(\'/issueReceipt\',{uuid:\''+uid+'\'})');
									response.write('">Issue Receipt</button></td>');
								response.write('</tr>')
							}

							response.write('</tbody></table></div>');
							response.write(fs.readFileSync('post.html'));
							next();
						}
		    }
		});
	}
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
function printReceipt(request, response, next){
	logStatus(request, response, next);
	var params = {
		TableName:"GDS-G1-Donations",
		Key:{
			"receiptNumber": parseInt(request.body.receiptNumber)
		}
	};
	console.log(params);
	docClient.get(params, function(err, data0) {
		console.log(JSON.stringify(data0));
			if (err) {
				console.error("Unable to put item in donations. Error JSON:", JSON.stringify(err, null, 2));
				response.write('<h3 style="color:red;">ERROR</h3>');
				response.write('<p>'+JSON.stringify(err, null, 2)+'</p>');
				response.write('<p>Please contact (819)329-3318 Immediately.</p>');
				next();
			}else{
				/* http://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object */
				if(Object.keys(data0).length === 0 && data0.constructor === Object){
					// receipt not yet issued
					console.error("Unable to put item in donations. Error JSON:", JSON.stringify(err, null, 2));
					response.write('<h3 style="color:red;">Receipt not Issued</h3>');
					response.write('<p>This receipt has not been issued yet.</p>');
					response.write('<p>Please contact (819)329-3318 Immediately if you think this is an error.</p>');
					next();
				}else{
					var params = {
						TableName:"GDS-G1-Donators",
						Key:{
							"donatorUID": data0["Item"]["donatorID"]
						}
					};
					console.log(params);
					docClient.get(params, function(err, data1) {
							if (err) {
								console.error("Unable to get item from donations. Error JSON:", JSON.stringify(err, null, 2));
								response.write('<h3 style="color:red;">ERROR</h3>');
								response.write('<p>'+JSON.stringify(err, null, 2)+'</p>');
								response.write('<p>Please contact (819)329-3318 Immediately.</p>');
								next();
							}else{
								var html = fs.readFileSync('receiptPrint.html');
								response.write(html);
								response.write('<script>');
								response.write('function updateVals(){');
									response.write('document.getElementById("receiptNum").innerHTML= "'+ data0["Item"]["receiptNumber"] +'";');
									response.write('document.getElementById("date").innerHTML= "'+ (new Date(data0["Item"]["dateTime"])).toISOString().slice(0,10) +'";');
									response.write('document.getElementById("salutation").innerHTML= "'+ data1["Item"]["salutation"] +'";');
									response.write('document.getElementById("name").innerHTML= "'+ data1["Item"]["donatorName"] +'";');
									response.write('document.getElementById("streetAddress").innerHTML= "'+ data1["Item"]["addressStreet"] +'";');
									response.write('document.getElementById("cityCountry").innerHTML= "'+ data1["Item"]["addressCity"] + ", " + data1["Item"]["addressCountry"] +'";');
									response.write('document.getElementById("postalCode").innerHTML= "'+ data1["Item"]["addressPostalCode"] +'";');
									response.write('document.getElementById("telephone").innerHTML= "'+ data1["Item"]["telephone"] +'";');
									response.write('document.getElementById("email").innerHTML= "'+ data1["Item"]["email"] +'";');
									response.write('document.getElementById("dollars").innerHTML= "'+ parseInt(data0["Item"]["amount"]) +'";');
									response.write('document.getElementById("cents").innerHTML= "'+ (parseInt(((data0["Item"]["amount"])%100))) +'";');
									response.write('document.getElementById("amountText").innerHTML= "'+ data0["Item"]["amountText"] +'";');
									response.write('document.getElementById("paymentType").innerHTML= "'+ data0["Item"]["paymentType"] +'";');
									response.write('document.getElementById("chequeInfo").innerHTML= "'+ data0["Item"]["chequeNumber"] + ", " + data0["Item"]["chequeDate"] +'";');
									response.write('document.getElementById("donationType").innerHTML= "'+ data0["Item"]["donationType"] +'";');
									response.write('document.getElementById("clientID").innerHTML= "'+ data0["Item"]["employeeNumber"] +'";');
								response.write('}');
								response.write('</script>');
								next();
							}
					});
				}
			}
	});
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

app.post('/userinformation',userinformation);

app.post('/issueReceipt',issueReceipt);
app.post('/issuedReceipt',issuedReceipt);

app.post('/printPreviousReceipt',printReceipt);

app.use(addFooter);
app.use(respondToClient);


//create http-express server
http.createServer(app).listen(3001);

console.log('Server Running at http://127.0.0.1:3001  CNTL-C to quit');
