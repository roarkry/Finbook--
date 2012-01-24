var hideGoalHeader = false;

var planClass = ".plan-detail";
var planGoalsClass = ".goal-detail-container";
var goalClass = ".goal-detail.dotted-top-border";
var feedbackClass = ".feedback-detail-padding";

var options;

$(document).ready(function () {
  
  /**
   * read settings using fancy-settings  api
   *
   * @see https://github.com/frankkohlhepp/fancy-settings/wiki/Read-settings
   */
  chrome.extension.sendRequest({action: 'gpmeGetOptions'}, function(theOptions) {
    options = theOptions;
  
    //Display the outlines
    if(options.outline_plans)
      $(planClass).css("border","3px solid grey");
    
    if(options.outline_goals)
      $(planGoalsClass).css("border","3px solid grey");
    
    if(options.outline_goal)  
      $(goalClass).css("border","3px solid green");
    
    if(options.outline_feedback)
      $(feedbackClass).css("border","3px solid blue");
    
    if(options.reorder_plan_by_goal){
      var goalDates = {};
      var keys = Array();

      $(planGoalsClass).each(function (i){
        //get the most recent goals date (as a string)
        var x = $(this).find(".goal-detail-description-heading")[0].innerText;
        keys.push(x);
        goalDates[x] = i;
      });
      
      SortTopLevel(goalDates, keys);      
    }
    
    //Hide the header for Goals - just says "goals"
    if(hideGoalHeader)
      $(".goal-detail-title").each(function (i){
        this.style.display = 'none';
      });
    
    $(planClass).each(SetupPlan);
    
    $(goalClass).each(SetupGoal);
    
    $(feedbackClass).each(SetupFeedback);
    
    if(options.auto_feedback){
      $(feedbackClass).each(ExpandFeedback);
    }
    
    if(options.auto_goals){
      $(goalClass).each(ExpandGoal);
    }
    
    if(options.auto_plans){ 
      $(planClass).each(ExpandPlan);
    }
  });
});

/************Setup Functions**************/

function SetupPlan(i){
  var plan = $(this).find('a')[0];
  var goals = $($(planGoalsClass)[i]).find(goalClass).length;
  if(goals == 1)
    goals = goals + " Goal";
  else
    goals = goals + " Goals";
  plan.outerHTML = "<span class=\"expand-plan\">[-]</span>" + plan.outerHTML + "<span class=\"expand-plan-summary\" style=\"display:none\">" + goals + "</span>";
  
  var shElement = $(".expand-plan")[i];
  shElement.addEventListener("click", function(){ExpandPlan(i);}, false);
}

function SetupGoal(i){
  var goal = $(this).find('span')[0];
  var comments = $(this).find(feedbackClass).length;
  if(comments == 1)
    comments = comments + " Comment";
  else
    comments = comments + " Comments";
  goal.innerHTML = "<span class=\"expand-goal\">[-]</span>" + goal.innerHTML + "<span class=\"expand-goal-summary\" style=\"display:none\">" + comments + "</span>";
  
  var shElement = $(".expand-goal")[i];
  shElement.addEventListener("click", function(){ExpandGoal(i);}, false);
}

function SetupFeedback(i){
  var feedback = $(this).find(".feedback-detail-date-time")[0];
  
  var creatorStr = $(this).find(".feedback-detail-creator")[0].innerText;

  feedback.innerHTML = "<span class=\"expand-feedback\">[-]</span>" + feedback.innerHTML + "<span class=\"expand-feedback-summary\" style=\"display:none\">" + creatorStr + "</span>";
    
  var shElement = $(".expand-feedback")[i];
  shElement.addEventListener("click", function(){ExpandFeedback(i);}, false);
}

/************Expand Functions**************/

function ExpandPlan(i){
  var expanded = ExpandElement($(planGoalsClass)[i]);
  
  ExpandElement($(".expand-plan-summary")[i]);
  ExpandButtonSwitch($(".expand-plan")[i], expanded);
  
  var plansElement = $(planClass)[i];
  
  var desc = $(plansElement).find(".plan-detail-expectation-description");
  if (options.collapse_plan_desc && desc.length > 0)
    ExpandElement(desc[0]);
  
  var desc = $(plansElement).find(".plan-detail-description");
  if (options.collapse_plan_desc && desc.length > 0)
    ExpandElement(desc[0]);
    
  desc = $(plansElement).find(".plan-detail-description-title");
  if (options.collapse_plan_creator && desc.length > 0)
    ExpandElement(desc[0]);
      
  desc = $(plansElement).find(".five-star-rating-control");
  if (desc.length > 0)
    ExpandElement(desc[0]);
  
  
}

function ExpandGoal(i){
  //show child count
  var expanded = !ExpandElement($(".expand-goal-summary")[i]);
  
  //hide all feedback
  var element = $(goalClass)[i];
  $(element).children('div').each(function(i){
    ExpandElement(this);
  });
  
  //switch the expand button
  ExpandButtonSwitch($(".expand-goal")[i], expanded);
  
  //hide all description elements
  if(options.collapse_goal_desc)
    $(element).children(".goal-detail-description").each(function(i){
      ExpandElement(this);
    });
  
  if(options.collapse_goal_commentors)  
    ExpandElement($(element).children(".goal-detail-description-heading")[1]);
  
}

function ExpandFeedback(i){  
  var expanded = !ExpandElement($(".expand-feedback-summary")[i]);
  
  ExpandButtonSwitch($(".expand-feedback")[i], expanded);
  
  var element = $(feedbackClass)[i];
  
  var desc = $(element).find(".five-star-rating-control");
  if (desc.length > 0)
    ExpandElement(desc[0]);
      
  desc = $(element).find(".feedback-detail-comment");
  if (options.collapse_feedback_comment && desc.length > 0)
    ExpandElement(desc[0]);
  
  desc = $(element).find(".feedback-detail-creator");
  if (desc.length > 0)
    ExpandElement(desc[0]);
  
}

/************Helper Functions**************/

function ExpandElement(element){
  var expanded = false;
  
  if(element.style.display == 'none'){
    $(element).fadeIn(200 /* options.fade_speed */);
    expanded = true;
  }
  else
    $(element).fadeOut(200 /* options.fade_speed */);
    
  return expanded;
}

function ExpandButtonSwitch(element, expanded){
  if(expanded)
    element.innerText = "[-]";
  else
    element.innerText = "[+]";
}

/************Sort Functions**************/

function SwapHTML(x,y){
  var temp = x.innerHTML;
  x.innerHTML = y.innerHTML;
  y.innerHTML = temp;
}

//Help function to swap plans/Expectations
function PerformSwap(mapping, dates, i, j){
  //swap the plan-detail span and the goal-detail-container span
  SwapHTML($(planClass)[mapping[dates[i]]], $(planClass)[mapping[dates[j]]]);
  SwapHTML($(planGoalsClass)[mapping[dates[i]]], $(planGoalsClass)[mapping[dates[j]]]);
  
  //swap the indices in the mapping table
  var t = mapping[dates[i]];
  mapping[dates[i]] = mapping[dates[j]];
  mapping[dates[j]] = t;
  
  //swap the values in the array
  t = dates[i];
  dates[i] = dates[j];
  dates[j] = t;
}

//perform bubble sort - moving HTML elements as we go
function SortTopLevel(mapping, dates){
  var i, j;
  for(i=0; i<dates.length-1; i++){
    for(j=0; j<dates.length-1-i; j++){
      //Use date.js to parse and compare the dates
      var j1 = j;
      var j2 = j+1;
      var d1Str = dates[j1];
      var d2Str = dates[j2];
      var d2 = Date.parse(d2Str);
      var d1 = Date.parse(d1Str);
      
      
      //if the above section has an earlier date, swap them (< = descending | > = ascending
      if(d1.compareTo(d2) < 0){
        PerformSwap(mapping, dates, j, j+1);
      }
    }
  }
}

/************Notes**************/
/** TODO:
 - Clean up the options - make a dictionary or something similar (see the response type from background.html)
 - Clean up the CSS
 - Allow collapsing of CDP page
 - Provide option to hide the word goal
*/
/****************Version Log***************
1.0 - 1/13/2012
1.1 - 1/15/2012
  * Poke functionality is now collapsable 
  * JS isn't applied to the goal entry page (maybe i can apply some of the code though...)
  * Sorting functionality for top-level added, based on goal creation date
  * Hide plan-detail-expectation-description tag along with the plan/expectation description
  * Hide multiple goal-description spans (not sure why they are there to begin with)
/******************************************/