

var app = angular.module('scheduler', []);

var deptCodesShortNames;
var mustCourses;
var allCourses;
var userInfo;

var schedules=[];
var schedulesDateTime=[];

var currentSchedule;//save i buradan aldın
var currentCoursesCodes=[];
var currentCourses=[];
var currentSections=[];

var courseInfoIndex;


app.controller('myCtrl', function($scope,$http,$window,$timeout) {  
	
	//Take necessary information from server
	$http.get("/allCourses.json").then(function(response)
			{
				allCourses=response.data;
				console.log("allCourses downloaded");
				createCurrentCourses();
			});
	$http.get("/mustCourses.json").then(function(response)
			{
        		console.log("mustCourses downloaded");
        		mustCourses=response.data;
			});
	$http.get("/deptCodesShortNames.json").then(function(response)
			{
			console.log("deptCodesShortNames downloaded");
			deptCodesShortNames=response.data;

			});
	$http.get("/known").then(function(response)
	{
		if(response.data["email"]!=null){
			userInfo=response.data;
			$scope.welcomeViewAcc=true;
			$scope.welcomeViewLogin=true;
			$timeout( function(){
            	$scope.$emit("usernames");}, 100 );
			}	
	});
	$scope.logOutButtonHide=true;
	$scope.mySchedulesHide=true;
	$scope.myCoursesHide=true;
	$scope.addCoursesHide=true;
	$scope.courseInfoHide=true;
	$scope.$on('loginView', function(event) {
		$scope.welcomeViewLogin=true;
		$scope.welcomeViewAcc=true;
	});

	$scope.$on("usernames",function(event){
		$scope.username=userInfo["surname"];
		$scope.logOutButtonHide=false;
		$scope.mySchedulesHide=false;
		$scope.myCoursesHide=false;
		$scope.addCoursesHide=false;
		schedules=userInfo["schedules"];
		for(let i=0;i<schedules.length;i++){
			schedulesDateTime[i]=schedules[i].substring(0,schedules[i].indexOf(":"));
		}
		$scope.schedulesDateTime=schedulesDateTime;


		currentSchedule=schedules[0].substring(schedules[0].indexOf(":")+1,schedules[0].length);
		let temp=currentSchedule.split(",");
		if(temp[0]=="") temp=[];
		currentCoursesCodes=[];
		currentSections=[];
		for(let i=0;i<temp.length;i++){
			currentCoursesCodes[i]=temp[i].substring(0,temp[i].indexOf("-"));
			currentSections[i]=temp[i].substring(temp[i].indexOf("-")+1,temp[i].indexOf("-")+3);
		}
		if(allCourses!=null){
			createCurrentCourses();
			
		}

		$scope.currentCoursesCodes=currentCoursesCodes;
		$scope.selected=0;
		displaySchedule();

		
	});

	$scope.logOut=function(){
		$http.get("/logOut").then(function(){
			$window.location.reload();
		});
	}
	$scope.changeCurrentSchedule=function(index){
		$scope.selected=index;
		if(schedules[index]==null) cleanCells();

		currentSchedule=schedules[index].substring(schedules[index].indexOf(":")+1,schedules[index].length);
		console.log(currentSchedule);
		let temp=currentSchedule.split(",");
		if(temp[0]=="") temp=[];
		currentCoursesCodes=[];
		currentSections=[];
		for(let i=0;i<temp.length;i++){
			currentCoursesCodes[i]=temp[i].substring(0,temp[i].indexOf("-"));
			currentSections[i]=temp[i].substring(temp[i].indexOf("-")+1,temp[i].indexOf("-")+3);
		}

		$scope.currentCoursesCodes=currentCoursesCodes;
		createCurrentCourses();
		$scope.courseInfoHide=true;
		displaySchedule();
	}
	$scope.showCourseInfo=function(index){

		$scope.courseName=currentCourses[index]["cn"];
		if(currentSections[index]==0){
			$scope.firstInst="Do not satisfy course requirements";
			return;
		}
		$scope.firstInst=currentCourses[index]["s"][currentSections[index]-1]["inst"][0];
		$scope.secondInst=currentCourses[index]["s"][currentSections[index]-1]["inst"][1];
		$scope.courseInfoHide=false;
		courseInfoIndex=index;
		let sections=[];
		for(let i=0;i<currentCourses[index]["s"].length;i++){
			sections[i]=currentCourses[index]["s"][i]["sn"];
		}
		$scope.sections=sections
	
		$scope.section=currentSections[index];
	}

	$scope.changeSection=function(section){


		if(currentSections[courseInfoIndex]==0) return;
		currentSections[courseInfoIndex]=section;
		let temp=currentSchedule.split(",");
		currentSchedule="";

		for(let i=0;i<temp.length;i++){
			let seperator=","
			if(i==0)seperator="";
			if(i!=courseInfoIndex){
				currentSchedule+=seperator+temp[i];
			}
			else{
				currentSchedule+=seperator+temp[i].substring(0,temp[i].indexOf("-"))+"-"+section;
			}
		}
		//add changes to currentSchedule;
		displaySchedule();
	}
	$scope.newSchedule=function(){
		let size=schedules.length;
		if(size==5){
			alert("Only 5 schedules permitted");
			return;
		}
		let date=new Date();
    	let dateTime=""+date.getDate()+"."+date.getMonth()+"."+date.getFullYear()+"-"+date.getHours()+"."+date.getMinutes();
		schedulesDateTime[size]=dateTime;
		console.log("schedulesDateTime");
		console.log(schedulesDateTime)
		$scope.schedulesDateTime=schedulesDateTime;
		currentSchedule="";
		currentCourses=[];
		$scope.courseInfoHide=true;
		currentCoursesCodes=[];
		$scope.currentCoursesCodes=currentCoursesCodes;
		currentSections=[];
	
		$scope.selected=size;
		displaySchedule();


	}
	$scope.saveSchedule=function(){


		schedules[$scope.selected]=schedulesDateTime[$scope.selected]+":"+currentSchedule;
		console.log(currentSchedule);

		userInfo["schedules"]=schedules;
		console.log(userInfo["schedules"]);

		$http.post("/updateUser",userInfo).then(function(){
			console.log("user Updated");
		});
		
	
	}
	$scope.sendMail=function(){
		let message=angular.element("#table").html();
		$http.post("/sendEmail",message).then(function(response){
			if(response.data["state"]=="1"){
				alert("mail sended");
			}
			else if(response.data["state"]=="0")
			{
				alert("try again later");
			}
		});
	}

});
function displaySchedule(){
	
	cleanCells();
	if(currentCourses==null||currentSections==null) return;


	for(let i=0;i<currentCourses.length;i++){
				
		let deptCode=currentCourses[i]["cc"].substring(0,3);
		let shortName=findDeptShortName(deptCode);
		let tableContent=shortName+currentCourses[i]["cc"].substring(4,currentCourses[i]["cc"].length);
		let sessions=[];
		if(currentSections[i]==0)continue;
		sessions=currentCourses[i]["s"][currentSections[i]-1]["ses"];

		if(sessions==null) continue;
		for(let j=0;j<sessions.length;j++){
			let ids=findElementIds(sessions[j]);
			if(ids==null)continue;

			for(let t=0;t<ids.length;t++){
				let collisionSeperator="";
				if(angular.element("#"+ids[t]).html()!="") collisionSeperator=",";
				angular.element("#"+ids[t]).html(angular.element("#"+ids[t]).html()+collisionSeperator+tableContent+"-"+sessions[j]["p"]);
			}
		}
	}

}
function findElementIds(session){
	if(session==null) return null;
	let day=session["d"];

	if(day=="Monday") day="0";
    else if(day=="Tuesday") day="1";
    else if(day=="Wednesday") day="2";
    else if(day=="Thursday")day="3";
    else if(day=="Friday") day="4";
    else if(day=="Saturday") day="5";
    let startTime=parseInt(session["st"].substring(0,2));
    let endTime=parseInt(session["end"].substring(0,2));
    let output=[];
    let startY=startTime-8;
    for(let i=0;i<endTime-startTime;i++){
    	output[i]=""+startY+day;
    	startY++;
    }

    return output;

}
function cleanCells(){
// row ids in  [1,8]
	for(let i=0;i<=8;i++){
		// column ids in [1,5]
		for(let j=0;j<6;j++){
			angular.element("#"+i+j).html("");
         }
      }
}
function findDeptShortName(deptCode){
	for(let i=0;i<deptCodesShortNames.length;i++){
		if(deptCode==deptCodesShortNames[i]["cc"]) 
		return deptCodesShortNames[i]["cn"];
	}
	return deptCode;
}

function determineMustSection(courseCode){

	let sections;
	let i=0
	for(;i<allCourses.length;i++){
		if(allCourses[i]["cc"]==courseCode){
			sections=allCourses[i]["s"];
			break;
		}
	}
	if(sections==null)return;
    let j=0;
    let valid=false;
    for(;j<sections.length;j++){
        if(isValid(j)) {
        	valid=true;
        	break;
        }
    }
	if(!valid) return 0;

    return allCourses[i]["s"][j]["sn"];
    
    
 
    function isValid(sectionId){
        
        if(sections[sectionId]["req"]["start"]=="") return true;
        
        let reqLength=sections[sectionId]["req"].length;
        let req=sections[sectionId]["req"];
        let canAddSection=false;
        let start="-1";
        let end="-1";
        let lastName=userInfo["surname"].substring(0,2);
        for(let i=0;i<reqLength;i++){
            if(userInfo["department"]==req[i]["givendept"]||req[i]["givendept"]=="ALL"){
                start=req[i]["start"];
                end=req[i]["end"];
                
                if(lastName.localeCompare(start)>=0&&end.localeCompare(lastName)>=0){
                    canAddSection=true;

                }
                else canAddSection=false;
            }

        }
        if(start=="-1") return false;
        return canAddSection;    
    
    }


  
}



app.controller("courseCtrl",function($scope){
	$scope.courseControl={
	};
		

}).directive("rightcolumn",function(){
	return{
			restrict:'E',
			replace:true,
			templateUrl: '/addCourses.html',
			
    scope: {
      control: '='
    },
	link:function(scope){
		scope.addCourses=true;
		scope.$watch("semesterNo",function(news,old){
			if(parseInt(news)>=1&& parseInt(news)<=8) scope.addCourses=false;

			else scope.addCourses=true;
		});
		scope.$on("addCourses",function(event){
			scope.addCoursesHide=false;
		});
		scope.addMustCourses=function(){
			let deptName=userInfo["department"];
			let deptCode;
			for(let i=0;i<deptCodesShortNames.length;i++){
				if(deptCodesShortNames[i]["cn"]==deptName){
					deptCode=deptCodesShortNames[i]["cc"];
					break;
				}
			}
			let semMustCourses=mustCourses[deptCode][scope.semesterNo];
			let size=currentCourses.length;
			for(let i=0;i<semMustCourses.length;i++){
				currentCoursesCodes[size]=semMustCourses[i];
				let seperator=",";
				if((currentSchedule==""||currentSchedule==null)&&i==0) seperator="";
				let mustSection=determineMustSection(semMustCourses[i]);
				if(mustSection==0) continue;
				currentSections[size++]=mustSection;
				currentSchedule+=seperator+semMustCourses[i]+"-"+mustSection;
			}

			createCurrentCourses();

			displaySchedule();
		}

		scope.addCourse=function(){
			console.log("add courses");
			let isCode=true;
			if(scope.course==""||scope.course==null){
				alert("Course name can not be empty");
				return;
			}
			let courseIdentity=scope.course.toUpperCase();
			if(courseIdentity.charAt(0)>='A'&&courseIdentity.charAt(0)<='Z') isCode=false;
			let searchEntity="cn";
			if(isCode) searchEntity="cc"; 
			let isCourseExists=false;
			let i=0;
			for(;i<allCourses.length;i++){
				if(allCourses[i][searchEntity]==courseIdentity){
					isCourseExists=true;
					break;
				}
			}
			if(!isCourseExists){
			 alert("There is not such course");
			 return;
			}
			let mustSection=determineMustSection(allCourses[i]["cc"]);
			if(mustSection==0) alert("You do not satisfy course requirements");
			let seperator=",";
			if(currentSchedule==""||currentSchedule==null) seperator=""; 
			currentSchedule+=seperator+allCourses[i]["cc"]+"-"+mustSection;
			console.log(currentSchedule);
			let course=allCourses[i];

			currentCourses[currentCourses.length]=course;
			currentSections[currentSections.length]=mustSection;
			currentCoursesCodes[currentCoursesCodes.length]=allCourses[i]["cc"];


			displaySchedule();

		}


	}
		
	};
	

});

function createCurrentCourses(){
	currentCourses=[];
	let size=0;
	for(let i=0;i<currentCoursesCodes.length;i++){
		for(let j=0;j<allCourses.length;j++){
			if(allCourses[j]["cc"]==currentCoursesCodes[i]){
				currentCourses[size++]=allCourses[j];
			}
		}
	}
}

app.controller("loginCtrl",function($scope,$http,$window){

	$scope.focusinControl={
	};

	$scope.$on('requestUserInfo', function(event,data) {
		let query="findByEmail/"+data[0]+"/"+data[1];

		$http.get(query).then(function(response){

		if(response.data["email"]==null){
			console.log("null");				
			alert("wrong email or password");
			$window.location.reload();

			}
		else{

			userInfo=response.data;
			console.log(userInfo["surname"]);
			//authorized view
			$scope.$emit("usernames");

		}
		
	});
	});
	$scope.$on('saveUser',function(event,data){
		let user={
			"email":data[0],
			"password":data[1],
			"surname":data[2],
			"department":data[3],
			"schedules":[]
		};

		$http.post('/saveUser',user).then(function(response){
			if(response.data.length==0){
				alert("Email already exists");
				$window.location.reload();
				return;
			}
			userInfo=user;

			$scope.$emit("usernames");
		});
		
	});

	$scope.$on('recordView',function(event){

		$scope.welcomeViewAcc=true;
		$scope.welcomeViewLogin=true;
	});

	}).directive('focusin',function(){
		return{

			restrict:'E',
			replace:true,
			templateUrl: '/login.html',
    scope: {
      control: '='
    },
    link: function(scope) {
    	scope.userInfoHide=true;
   		scope.courseButtonsHide=true;
    	scope.record=true;

		scope.$watch("recordPassword",function(news,old){
			if(news== null) return;
			if(news!=scope.recordConfirmation) scope.myColor="red";
			else scope.myColor="green";
		});

		scope.$watch("recordConfirmation",function(news,old){
			if(news==null) return;
			if(news!=scope.recordPassword) scope.myColor="red";
			else scope.myColor="green";
		});
		


      scope.internalControl = scope.control || {};
 
      scope.internalControl.accInformationView=function(){
		scope.userInfoHide=false;
      	scope.RecordEmailHide=false;
		scope.RecordPasswordHide=false;
		scope.RecordConfirmationHide=false;
		scope.RecordSurnameHide=false;
		scope.RecordButtonHide=false;
		scope.RecordDepartmentHide=false;
		scope.loginEmailHide=true;
		scope.loginPasswordHide=true;
		scope.LoginButtonHide=true;
		scope.$emit('recordView');

      }
      scope.internalControl.loginView=function(){
      	scope.userInfoHide=false;
      	scope.RecordEmailHide=true;
		scope.RecordPasswordHide=true;
		scope.RecordConfirmationHide=true;
		scope.RecordSurnameHide=true;
		scope.RecordButtonHide=true;
		scope.RecordDepartmentHide=true;
      	scope.$emit('loginView');
      	scope.$emit("addCourses");
     
      }
      scope.signIn=function(){

		if(scope.recordEmail==null || scope.recordPassword==null || scope.recordDepartment==null || scope.recordSurname==null){
			alert("Required fields can not be empty");
		}
		let email=scope.recordEmail;
		let password=scope.recordPassword;
		let department=scope.recordDepartment.toUpperCase();
		let surname=scope.recordSurname;

		if(password!=scope.recordConfirmation){
			alert("Password confirmation is not valid");
		}
		let searchKey;
		if(department.charAt(0)>='A' && department.charAt(0)<='Z') searchKey="cn";
		else searchKey="cc";
		let isValidDept=false;
		for(let i=0;i<deptCodesShortNames.length;i++){
			if(deptCodesShortNames[i][searchKey]==department){
				isValidDept=true;
				break;
			} 
		}
		if(!isValidDept){
			alert("Invalid Department");
			return;
		}
		scope.$emit("saveUser",[email,password,surname,department]);
		scope.userInfoHide=true;
      }

	  scope.checkLoginInfo=function(){
	  	if (scope.loginEmail==null || scope.loginPassword==null){
	  		alert("Email or password can not be empty");
	  		return;
	  	} 
		
	  	scope.$emit('requestUserInfo',[scope.loginEmail,scope.loginPassword]);
		scope.userInfoHide=true;
		
	  }


    }
		};


	});


