var optionArray = ["auto_plans","auto_goals","auto_feedback","collapse_plan_desc","collapse_plan_creator","collapse_goal_desc", "collapse_goal_commentors", "collapse_feedback_comment", "reorder_plan_by_goal", "outline_plans","outline_goals","outline_feedback"];

//load all options from localstorage via the background page
function loadOptions(){
  chrome.extension.sendRequest({method: "getLocalStorage"}, function(response) {

    autoCollapsePlan = response.data[0] == "true";
    autoCollapseGoal = response.data[1] == "true";
    autoCollapseFeedback = response.data[2] == "true";

    collapsePlanDescription = response.data[3] == "true";
    collapsePlanCreator = response.data[4] == "true";
    collapseGoalDescription = response.data[5] == "true";
    collapseGoalCommentors = response.data[6] == "true";
    collapseFeedbackComment = response.data[7] == "true";
    
    reorderByGoal = response.data[8] == "true";

    outlinePlan = response.data[9] == "true";
    outlineGoal = response.data[10] == "true";
    outlineFeedback = response.data[11] == "true";
    
    outlineGoals = outlinePlan;
    applyOptions();
  });
  
}

// Saves options to localStorage.
function save_options() {
  var options_form = document.getElementById("options");
  with(options_form) {
    for(var i = 0; i < fbpp_option.length; i++){
      if(fbpp_option[i].checked) {
        localStorage[fbpp_option[i].value] = true;
        console.log("ON : " + fbpp_option[i].value);
      }
      else {
        localStorage[fbpp_option[i].value] = false;
        console.log("OFF: " + fbpp_option[i].value);
      }
    }
  }

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  
  checkFirstRun();
  
  //must match order of fields below
  var options = optionArray;
  
  for(i in options){
    if(localStorage[options[i]] == "true") {
      var options_form = document.getElementById("options");
      with(options_form){
        fbpp_option[i].checked = true;
      }
    }
  }
}

function checkFirstRun(){
  var details = chrome.app.getDetails();
  
  if(localStorage["version"] != details.version){
    localStorage["version"] = details.version;
    localStorage[optionArray[0]] = (localStorage[optionArray[0]]) ? localStorage[optionArray[0]] : "true";
    localStorage[optionArray[1]] = (localStorage[optionArray[1]]) ? localStorage[optionArray[1]] : "true";
    localStorage[optionArray[2]] = (localStorage[optionArray[2]]) ? localStorage[optionArray[2]] : "true";
    localStorage[optionArray[3]] = (localStorage[optionArray[3]]) ? localStorage[optionArray[3]] : "true";
    localStorage[optionArray[4]] = (localStorage[optionArray[4]]) ? localStorage[optionArray[4]] : "true";
    localStorage[optionArray[5]] = (localStorage[optionArray[5]]) ? localStorage[optionArray[5]] : "true";
    localStorage[optionArray[6]] = (localStorage[optionArray[6]]) ? localStorage[optionArray[6]] : "true";
    localStorage[optionArray[7]] = (localStorage[optionArray[7]]) ? localStorage[optionArray[7]] : "true";
    localStorage[optionArray[8]] = (localStorage[optionArray[8]]) ? localStorage[optionArray[8]] : "true";
    localStorage[optionArray[9]] = (localStorage[optionArray[9]]) ? localStorage[optionArray[9]] : "false";
    localStorage[optionArray[10]] = (localStorage[optionArray[10]]) ? localStorage[optionArray[10]] : "false";
    localStorage[optionArray[11]] = (localStorage[optionArray[11]]) ? localStorage[optionArray[11]] : "false";
  }
}